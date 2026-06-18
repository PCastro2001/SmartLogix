import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductoService } from './producto.service';
import { ProductoDTO } from './producto.dto';
import { Producto } from './producto.entity';

@Controller('productos')
export class ProductoController {
  constructor(private readonly service: ProductoService) {}

  @Get()
  async listarTodos(): Promise<Producto[]> {
    return this.service.listarTodos();
  }

  @Get('bajo-stock')
  async listarBajoStock(): Promise<Producto[]> {
    return this.service.listarBajoStock();
  }

  @Get(':id')
  async obtenerPorId(@Param('id', ParseIntPipe) id: number): Promise<Producto> {
    return this.service.obtenerPorId(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearProducto(@Body() dto: ProductoDTO): Promise<Producto> {
    return this.service.crearProducto(dto);
  }

  @Put(':id')
  async actualizarProducto(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ProductoDTO,
  ): Promise<Producto> {
    return this.service.actualizarProducto(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminarProducto(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.eliminarProducto(id);
  }

  @Patch(':id/stock')
  async ajustarStock(
    @Param('id', ParseIntPipe) id: number,
    @Query('cantidad', ParseIntPipe) cantidad: number,
  ): Promise<Producto> {
    return this.service.ajustarStock(id, cantidad);
  }
}
