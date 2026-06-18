import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { InventarioProxy } from '../src/proxies/inventario.proxy';
import { PedidosProxy } from '../src/proxies/pedidos.proxy';
import { HttpExceptionFilter } from '../src/filters/http-exception.filter';

describe('Pagina: Dashboard', () => {
  let app: INestApplication;
  let inventarioProxy: InventarioProxy;
  let pedidosProxy: PedidosProxy;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    inventarioProxy = moduleFixture.get<InventarioProxy>(InventarioProxy);
    pedidosProxy = moduleFixture.get<PedidosProxy>(PedidosProxy);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Componente: Dashboard Aggregator', () => {
    describe('Por Funcionalidad:', () => {
      test('test 1 aprobado - Dashboard OK con todos los datos', async () => {
        jest.spyOn(inventarioProxy, 'getProductos').mockResolvedValue([{}, {}, {}]);
        jest.spyOn(inventarioProxy, 'getBajoStock').mockResolvedValue([{}]);
        jest.spyOn(pedidosProxy, 'getPedidos').mockResolvedValue([{}, {}]);
        jest.spyOn(pedidosProxy, 'getPedidosPorEstado').mockResolvedValue([{}]);

        const res = await request(app.getHttpServer()).get('/api/dashboard');
        expect(res.body.parcial).toBe(false);
        expect(res.body.totalProductos).toBe(3);
        expect(res.body.productosBajoStock).toBe(1);
        expect(res.body.totalPedidos).toBe(2);
        expect(res.body.pedidosPendientes).toBe(1);
      });

      test('test 2 aprobado - Dashboard con conteo correcto de productos de bajo stock', async () => {
        jest.spyOn(inventarioProxy, 'getProductos').mockResolvedValue([]);
        jest.spyOn(inventarioProxy, 'getBajoStock').mockResolvedValue([{ id: 1 }, { id: 2 }]);
        jest.spyOn(pedidosProxy, 'getPedidos').mockResolvedValue([]);
        jest.spyOn(pedidosProxy, 'getPedidosPorEstado').mockResolvedValue([]);

        const res = await request(app.getHttpServer()).get('/api/dashboard');
        expect(res.body.productosBajoStock).toBe(2);
      });

      test('test 3 aprobado - Dashboard con conteo correcto de pedidos pendientes', async () => {
        jest.spyOn(inventarioProxy, 'getProductos').mockResolvedValue([]);
        jest.spyOn(inventarioProxy, 'getBajoStock').mockResolvedValue([]);
        jest.spyOn(pedidosProxy, 'getPedidos').mockResolvedValue([]);
        jest.spyOn(pedidosProxy, 'getPedidosPorEstado').mockResolvedValue([{ id: 101 }, { id: 102 }]);

        const res = await request(app.getHttpServer()).get('/api/dashboard');
        expect(res.body.pedidosPendientes).toBe(2);
      });

      test('test 4 manejo de errores - Caída de ms-inventario marca parcial: true', async () => {
        jest.spyOn(inventarioProxy, 'getProductos').mockRejectedValue(new Error('down'));
        jest.spyOn(inventarioProxy, 'getBajoStock').mockRejectedValue(new Error('down'));
        jest.spyOn(pedidosProxy, 'getPedidos').mockResolvedValue([]);
        jest.spyOn(pedidosProxy, 'getPedidosPorEstado').mockResolvedValue([]);

        const res = await request(app.getHttpServer()).get('/api/dashboard');
        expect(res.body.parcial).toBe(true);
      });

      test('test 5 manejo de errores - Caída de ms-pedidos marca parcial: true', async () => {
        jest.spyOn(inventarioProxy, 'getProductos').mockResolvedValue([]);
        jest.spyOn(inventarioProxy, 'getBajoStock').mockResolvedValue([]);
        jest.spyOn(pedidosProxy, 'getPedidos').mockRejectedValue(new Error('down'));
        jest.spyOn(pedidosProxy, 'getPedidosPorEstado').mockRejectedValue(new Error('down'));

        const res = await request(app.getHttpServer()).get('/api/dashboard');
        expect(res.body.parcial).toBe(true);
      });
    });
  });
});
