import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, IsPositive } from 'class-validator';

export class ProductoDTO {
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive({ message: 'El precio debe ser positivo' })
  precio: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock: number;

  @IsNotEmpty()
  @IsNumber()
  stockMinimo: number;

  constructor(nombre?: string, descripcion?: string, precio?: number, stock?: number, stockMinimo?: number) {
    if (nombre !== undefined) this.nombre = nombre;
    if (descripcion !== undefined) this.descripcion = descripcion;
    if (precio !== undefined) this.precio = precio;
    if (stock !== undefined) this.stock = stock;
    if (stockMinimo !== undefined) this.stockMinimo = stockMinimo;
  }
}
