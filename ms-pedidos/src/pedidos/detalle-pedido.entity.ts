import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Pedido } from './pedido.entity';

@Entity('detalles_pedido')
export class DetallePedido {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Pedido, (pedido) => pedido.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pedido_id' })
  pedido: Pedido;

  @Column({ name: 'producto_id', type: 'bigint' })
  productoId: number;

  @Column('int')
  cantidad: number;

  @Column('double', { name: 'precio_unitario' })
  precioUnitario: number;

  constructor(id?: number, productoId?: number, cantidad?: number, precioUnitario?: number) {
    if (id !== undefined) this.id = id;
    if (productoId !== undefined) this.productoId = productoId;
    if (cantidad !== undefined) this.cantidad = cantidad;
    if (precioUnitario !== undefined) this.precioUnitario = precioUnitario;
  }

  toJSON() {
    return {
      id: this.id,
      productoId: this.productoId,
      cantidad: this.cantidad,
      precioUnitario: this.precioUnitario,
    };
  }
}

