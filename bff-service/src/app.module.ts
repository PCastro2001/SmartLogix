import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health/health.controller';
import { ApiController } from './api/api.controller';
import { InventarioProxy } from './proxies/inventario.proxy';
import { PedidosProxy } from './proxies/pedidos.proxy';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HttpModule],
  controllers: [HealthController, ApiController],
  providers: [InventarioProxy, PedidosProxy],
})
export class AppModule {}
