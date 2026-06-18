import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { PedidoService } from './pedido.service';
import { PedidoDTO } from './pedido.dto';
import { Pedido, EstadoPedido } from './pedido.entity';
import { IllegalArgumentException } from './exceptions';

@Controller('pedidos')
export class PedidoController {
  constructor(private readonly service: PedidoService) {}

  @Get()
  async listarTodos(): Promise<Pedido[]> {
    return this.service.listarTodos();
  }

  @Get(':id')
  async obtenerPorId(@Param('id', ParseIntPipe) id: number): Promise<Pedido> {
    return this.service.obtenerPorId(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearPedido(@Body() dto: PedidoDTO): Promise<Pedido> {
    return this.service.crearPedido(dto);
  }

  @Put(':id/estado')
  async actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, string>,
  ): Promise<Pedido> {
    const estadoStr = body.estado;
    if (!estadoStr) {
      throw new IllegalArgumentException("El campo 'estado' es requerido");
    }

    const upperEstado = estadoStr.toUpperCase();
    if (!Object.values(EstadoPedido).includes(upperEstado as EstadoPedido)) {
      throw new IllegalArgumentException(`Estado inválido: ${estadoStr}`);
    }

    return this.service.actualizarEstado(id, upperEstado as EstadoPedido);
  }

  @Delete(':id')
  async cancelarPedido(@Param('id', ParseIntPipe) id: number): Promise<Pedido> {
    return this.service.actualizarEstado(id, EstadoPedido.CANCELADO);
  }

  @Get('cliente/:clienteId')
  async listarPorCliente(@Param('clienteId', ParseIntPipe) clienteId: number): Promise<Pedido[]> {
    return this.service.listarPorCliente(clienteId);
  }

  @Get('estado/:estado')
  async listarPorEstado(@Param('estado') estado: string): Promise<Pedido[]> {
    const upperEstado = estado.toUpperCase();
    if (!Object.values(EstadoPedido).includes(upperEstado as EstadoPedido)) {
      throw new IllegalArgumentException(`Estado inválido: ${estado}`);
    }
    return this.service.listarPorEstado(upperEstado as EstadoPedido);
  }
}
