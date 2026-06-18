import { IsNotEmpty, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DetalleDTO {
  @IsNotEmpty()
  @IsNumber()
  productoId: number;

  @IsNotEmpty()
  @IsNumber()
  cantidad: number;

  constructor(productoId?: number, cantidad?: number) {
    if (productoId !== undefined) this.productoId = productoId;
    if (cantidad !== undefined) this.cantidad = cantidad;
  }
}

export class PedidoDTO {
  @IsNotEmpty()
  @IsNumber()
  clienteId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleDTO)
  detalles: DetalleDTO[];

  constructor(clienteId?: number, detalles?: DetalleDTO[]) {
    if (clienteId !== undefined) this.clienteId = clienteId;
    this.detalles = detalles || [];
  }
}

export class ProductoDTO {
  id: number;
  nombre: string;
  precioUnitario: number;
  stock: number;

  constructor(id?: number, nombre?: string, precioUnitario?: number, stock?: number) {
    if (id !== undefined) this.id = id;
    if (nombre !== undefined) this.nombre = nombre;
    if (precioUnitario !== undefined) this.precioUnitario = precioUnitario;
    if (stock !== undefined) this.stock = stock;
  }
}
