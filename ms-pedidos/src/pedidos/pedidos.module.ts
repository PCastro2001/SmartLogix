import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Pedido } from './pedido.entity';
import { DetallePedido } from './detalle-pedido.entity';
import { PedidoService } from './pedido.service';
import { PedidoController } from './pedido.controller';
import { InventarioClient } from './inventario.client';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, DetallePedido]), HttpModule],
  controllers: [PedidoController],
  providers: [PedidoService, InventarioClient],
  exports: [PedidoService],
})
export class PedidosModule {}
