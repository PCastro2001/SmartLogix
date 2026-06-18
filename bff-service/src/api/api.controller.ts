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
  HttpException,
} from '@nestjs/common';
import { InventarioProxy } from '../proxies/inventario.proxy';
import { PedidosProxy } from '../proxies/pedidos.proxy';

@Controller('api')
export class ApiController {
  constructor(
    private readonly inventarioProxy: InventarioProxy,
    private readonly pedidosProxy: PedidosProxy,
  ) {}

  // Rutas de Inventario
  @Get('inventario/productos')
  async getProductos() {
    return this.inventarioProxy.getProductos();
  }

  @Get('inventario/productos/:id')
  async getProductoById(@Param('id') id: string) {
    return this.inventarioProxy.getProductoById(id);
  }

  @Post('inventario/productos')
  @HttpCode(HttpStatus.CREATED)
  async createProducto(@Body() body: any) {
    return this.inventarioProxy.createProducto(body);
  }

  @Put('inventario/productos/:id')
  async updateProducto(@Param('id') id: string, @Body() body: any) {
    return this.inventarioProxy.updateProducto(id, body);
  }

  @Delete('inventario/productos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProducto(@Param('id') id: string) {
    return this.inventarioProxy.deleteProducto(id);
  }

  @Patch('inventario/productos/:id/stock')
  async ajustarStock(@Param('id') id: string, @Query('cantidad') cantidad: string) {
    return this.inventarioProxy.ajustarStock(id, cantidad);
  }

  // Rutas de Pedidos
  @Get('pedidos')
  async getPedidos() {
    return this.pedidosProxy.getPedidos();
  }

  @Get('pedidos/:id')
  async getPedidoById(@Param('id') id: string) {
    return this.pedidosProxy.getPedidoById(id);
  }

  @Post('pedidos')
  @HttpCode(HttpStatus.CREATED)
  async createPedido(@Body() body: any) {
    return this.pedidosProxy.createPedido(body);
  }

  @Put('pedidos/:id/estado')
  async updateEstadoPedido(@Param('id') id: string, @Body() body: any) {
    return this.pedidosProxy.updateEstadoPedido(id, body.estado);
  }

  @Delete('pedidos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePedido(@Param('id') id: string) {
    return this.pedidosProxy.deletePedido(id);
  }

  // Dashboard Facade enriquecido
  @Get('dashboard')
  async getDashboard() {
    const results = await Promise.allSettled([
      this.inventarioProxy.getProductos(),
      this.inventarioProxy.getBajoStock(),
      this.pedidosProxy.getPedidos(),
      this.pedidosProxy.getPedidosPorEstado('PENDIENTE'),
    ]);

    const dashboard = {
      totalProductos: results[0].status === 'fulfilled' ? (results[0].value?.length || 0) : 0,
      productosBajoStock: results[1].status === 'fulfilled' ? (results[1].value?.length || 0) : 0,
      totalPedidos: results[2].status === 'fulfilled' ? (results[2].value?.length || 0) : 0,
      pedidosPendientes: results[3].status === 'fulfilled' ? (results[3].value?.length || 0) : 0,
      parcial: results.some((r) => r.status === 'rejected'),
    };

    return dashboard;
  }

  // Ruta para testear el errorHandler
  @Get('test-error')
  getTestError() {
    throw new HttpException('Error de prueba', 418);
  }
}
