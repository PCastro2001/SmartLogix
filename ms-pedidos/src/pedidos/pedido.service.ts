import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido, EstadoPedido } from './pedido.entity';
import { DetallePedido } from './detalle-pedido.entity';
import { PedidoDTO } from './pedido.dto';
import { InventarioClient } from './inventario.client';
import {
  ResourceNotFoundException,
  StockInsuficienteException,
  IllegalStateException,
  IllegalArgumentException,
} from './exceptions';

@Injectable()
export class PedidoService {
  private static readonly TRANSICIONES_PERMITIDAS: Record<EstadoPedido, EstadoPedido[]> = {
    [EstadoPedido.PENDIENTE]: [EstadoPedido.APROBADO, EstadoPedido.CANCELADO],
    [EstadoPedido.APROBADO]: [EstadoPedido.ENVIADO, EstadoPedido.CANCELADO],
    [EstadoPedido.ENVIADO]: [EstadoPedido.CANCELADO],
    [EstadoPedido.CANCELADO]: [],
  };

  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepo: Repository<Pedido>,
    @InjectRepository(DetallePedido)
    private readonly detalleRepo: Repository<DetallePedido>,
    private readonly inventarioClient: InventarioClient,
  ) {}

  async crearPedido(dto: PedidoDTO): Promise<Pedido> {
    let total = 0.0;
    const pedido = new Pedido();
    pedido.clienteId = dto.clienteId;
    pedido.estado = EstadoPedido.PENDIENTE;
    pedido.detalles = [];

    if (dto.detalles && dto.detalles.length > 0) {
      for (const detalleDTO of dto.detalles) {
        const producto = await this.inventarioClient.obtenerProducto(detalleDTO.productoId);
        if (producto.stock < detalleDTO.cantidad) {
          throw new StockInsuficienteException(`Stock insuficiente para el producto: ${producto.nombre}`);
        }

        const subtotal = producto.precioUnitario * detalleDTO.cantidad;
        total += subtotal;

        const detalle = new DetallePedido();
        detalle.productoId = producto.id;
        detalle.cantidad = detalleDTO.cantidad;
        detalle.precioUnitario = producto.precioUnitario;
        detalle.pedido = pedido;

        pedido.detalles.push(detalle);
      }
    }

    pedido.total = total;
    const saved = await this.pedidoRepo.save(pedido);
    saved.id = Number(saved.id);
    if (saved.detalles) {
      saved.detalles.forEach((d) => {
        d.id = Number(d.id);
        d.productoId = Number(d.productoId);
      });
    }
    return saved;
  }

  async actualizarEstado(id: number, nuevoEstado: EstadoPedido): Promise<Pedido> {
    const pedido = await this.pedidoRepo.findOne({ where: { id } });
    if (!pedido) {
      throw new IllegalArgumentException(`Pedido no encontrado con ID: ${id}`);
    }

    const estadoActual = pedido.estado;
    const estadosPermitidos = PedidoService.TRANSICIONES_PERMITIDAS[estadoActual] || [];

    if (!estadosPermitidos.includes(nuevoEstado)) {
      throw new IllegalStateException(
        `Transición de estado no permitida desde ${estadoActual} hacia ${nuevoEstado}`,
      );
    }

    pedido.estado = nuevoEstado;
    const saved = await this.pedidoRepo.save(pedido);
    saved.id = Number(saved.id);
    return saved;
  }

  async listarTodos(): Promise<Pedido[]> {
    return this.pedidoRepo.find();
  }

  async obtenerPorId(id: number): Promise<Pedido> {
    const pedido = await this.pedidoRepo.findOne({ where: { id } });
    if (!pedido) {
      throw new ResourceNotFoundException(`Pedido no encontrado con ID: ${id}`);
    }
    pedido.id = Number(pedido.id);
    return pedido;
  }

  async listarPorCliente(clienteId: number): Promise<Pedido[]> {
    return this.pedidoRepo.find({ where: { clienteId } });
  }

  async listarPorEstado(estado: EstadoPedido): Promise<Pedido[]> {
    return this.pedidoRepo.find({ where: { estado } });
  }
}
