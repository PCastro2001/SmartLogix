import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './producto.entity';
import { ProductoDTO } from './producto.dto';
import { ResourceNotFoundException } from './exceptions';

@Injectable()
export class ProductoService {
  constructor(
    @InjectRepository(Producto)
    private readonly repo: Repository<Producto>,
  ) {}

  async listarTodos(): Promise<Producto[]> {
    return this.repo.find();
  }

  async listarBajoStock(): Promise<Producto[]> {
    const todos = await this.repo.find();
    return todos.filter((p) => p.stock <= p.stockMinimo);
  }

  async obtenerPorId(id: number): Promise<Producto> {
    const producto = await this.repo.findOne({ where: { id } });
    if (!producto) {
      throw new ResourceNotFoundException(`Producto no encontrado con id: ${id}`);
    }
    // TypeORM bigint can return as string or number depending on driver, but sqlite uses numbers.
    // Let's ensure id is number
    producto.id = Number(producto.id);
    return producto;
  }

  async crearProducto(dto: ProductoDTO): Promise<Producto> {
    const p = new Producto();
    p.nombre = dto.nombre;
    p.descripcion = dto.descripcion || '';
    p.precio = dto.precio;
    p.stock = dto.stock;
    p.stockMinimo = dto.stockMinimo;
    p.activo = true;
    const saved = await this.repo.save(p);
    saved.id = Number(saved.id);
    return saved;
  }

  async actualizarProducto(id: number, dto: ProductoDTO): Promise<Producto> {
    const p = await this.obtenerPorId(id);
    p.nombre = dto.nombre;
    p.descripcion = dto.descripcion || '';
    p.precio = dto.precio;
    p.stock = dto.stock;
    p.stockMinimo = dto.stockMinimo;
    const saved = await this.repo.save(p);
    saved.id = Number(saved.id);
    return saved;
  }

  async eliminarProducto(id: number): Promise<void> {
    const p = await this.obtenerPorId(id);
    p.activo = false;
    await this.repo.save(p);
  }

  async ajustarStock(id: number, cantidad: number): Promise<Producto> {
    const p = await this.obtenerPorId(id);
    const nuevoStock = p.stock + cantidad;
    if (nuevoStock < 0) {
      // In Java, it threw IllegalArgumentException which got mapped to 400 Bad Request.
      // We throw a standard BadRequestException with message.
      throw new BadRequestException('El stock resultante no puede ser negativo');
    }
    p.stock = nuevoStock;
    const saved = await this.repo.save(p);
    saved.id = Number(saved.id);
    return saved;
  }
}
