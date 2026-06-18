import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column('double')
  precio: number;

  @Column('int')
  stock: number;

  @Column('int', { name: 'stock_minimo' })
  stockMinimo: number;

  @Column('boolean', { default: true })
  activo: boolean;

  constructor(
    id?: number,
    nombre?: string,
    descripcion?: string,
    precio?: number,
    stock?: number,
    stockMinimo?: number,
    activo?: boolean
  ) {
    if (id !== undefined) this.id = id;
    if (nombre !== undefined) this.nombre = nombre;
    if (descripcion !== undefined) this.descripcion = descripcion;
    if (precio !== undefined) this.precio = precio;
    if (stock !== undefined) this.stock = stock;
    if (stockMinimo !== undefined) this.stockMinimo = stockMinimo;
    if (activo !== undefined) this.activo = activo;
  }
}
