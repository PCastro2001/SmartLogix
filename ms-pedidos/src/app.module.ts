import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Pedido } from './pedidos/pedido.entity';
import { DetallePedido } from './pedidos/detalle-pedido.entity';
import { PedidosModule } from './pedidos/pedidos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [Pedido, DetallePedido],
      synchronize: true,
    }),
    PedidosModule,
  ],
})
export class AppModule {}
