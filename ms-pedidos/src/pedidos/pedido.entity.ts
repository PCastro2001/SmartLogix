import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert } from 'typeorm';
import { DetallePedido } from './detalle-pedido.entity';

export enum EstadoPedido {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  ENVIADO = 'ENVIADO',
  CANCELADO = 'CANCELADO',
}

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: number;

  @Column({
    type: 'varchar',
    default: EstadoPedido.PENDIENTE,
  })
  estado: EstadoPedido;

  @Column({ name: 'fecha_creacion', type: 'datetime' })
  fechaCreacion: Date;

  @Column('double')
  total: number;

  @OneToMany(() => DetallePedido, (detalle) => detalle.pedido, {
    cascade: true,
    eager: true,
  })
  detalles: DetallePedido[];

  @BeforeInsert()
  setFechaCreacion() {
    if (!this.fechaCreacion) {
      this.fechaCreacion = new Date();
    }
  }

  constructor(
    id?: number,
    clienteId?: number,
    estado?: EstadoPedido,
    fechaCreacion?: Date,
    total?: number,
    detalles?: DetallePedido[]
  ) {
    if (id !== undefined) this.id = id;
    if (clienteId !== undefined) this.clienteId = clienteId;
    if (estado !== undefined) this.estado = estado;
    if (fechaCreacion !== undefined) this.fechaCreacion = fechaCreacion;
    if (total !== undefined) this.total = total;
    if (detalles !== undefined) this.detalles = detalles;
  }
}
