import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { InventarioProxy } from '../src/proxies/inventario.proxy';
import { PedidosProxy } from '../src/proxies/pedidos.proxy';
import { HttpExceptionFilter } from '../src/filters/http-exception.filter';
import { ProxyException } from '../src/proxies/proxy.exception';

describe('BFF E2E Tests', () => {
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

  describe('Pagina: Inventario', () => {
    describe('Componente: Productos Controller', () => {
      describe('Por Funcionalidad:', () => {
        test('test 1 aprobado - Obtener todos los productos (retorna 200)', async () => {
          jest.spyOn(inventarioProxy, 'getProductos').mockResolvedValue([{ id: 1, nombre: 'Mesa' }]);
          const res = await request(app.getHttpServer()).get('/api/inventario/productos');
          expect(res.statusCode).toBe(200);
          expect(res.body).toHaveLength(1);
          expect(res.body[0].nombre).toBe('Mesa');
        });

        test('test 2 aprobado - Obtener producto por ID existente (retorna 200)', async () => {
          jest.spyOn(inventarioProxy, 'getProductoById').mockResolvedValue({ id: 5, nombre: 'Mesa' });
          const res = await request(app.getHttpServer()).get('/api/inventario/productos/5');
          expect(res.statusCode).toBe(200);
          expect(res.body.id).toBe(5);
        });

        test('test 3 aprobado - Crear producto exitosamente (retorna 201)', async () => {
          jest.spyOn(inventarioProxy, 'createProducto').mockResolvedValue({ id: 10, nombre: 'Silla' });
          const res = await request(app.getHttpServer())
            .post('/api/inventario/productos')
            .send({ nombre: 'Silla', precio: 3000, stock: 20 });
          expect(res.statusCode).toBe(201);
          expect(res.body.id).toBe(10);
        });

        test('test 4 manejo de errores - Obtener producto por ID inexistente (retorna 404)', async () => {
          jest.spyOn(inventarioProxy, 'getProductoById').mockRejectedValue(new ProxyException('No encontrado', 404));
          const res = await request(app.getHttpServer()).get('/api/inventario/productos/999');
          expect(res.statusCode).toBe(404);
          expect(res.body.error).toBe('No encontrado');
        });

        test('test 5 manejo de errores - Simulación de timeout de red con ms-inventario (retorna 502 / Bad Gateway)', async () => {
          jest.spyOn(inventarioProxy, 'getProductos').mockRejectedValue(new ProxyException('timeout', 503));
          const res = await request(app.getHttpServer()).get('/api/inventario/productos');
          expect(res.statusCode).toBe(502);
          expect(res.body.error).toBe('timeout');
        });
      });
    });
  });

  describe('Pagina: Pedidos', () => {
    describe('Componente: Pedidos Controller', () => {
      describe('Por Funcionalidad:', () => {
        test('test 1 aprobado - Listar todos los pedidos (retorna 200)', async () => {
          jest.spyOn(pedidosProxy, 'getPedidos').mockResolvedValue([{ id: 1, estado: 'PENDIENTE' }]);
          const res = await request(app.getHttpServer()).get('/api/pedidos');
          expect(res.statusCode).toBe(200);
          expect(res.body).toHaveLength(1);
        });

        test('test 2 aprobado - Obtener pedido por ID existente (retorna 200)', async () => {
          jest.spyOn(pedidosProxy, 'getPedidoById').mockResolvedValue({ id: 1, estado: 'PENDIENTE' });
          const res = await request(app.getHttpServer()).get('/api/pedidos/1');
          expect(res.statusCode).toBe(200);
          expect(res.body.id).toBe(1);
        });

        test('test 3 aprobado - Crear pedido exitosamente (retorna 201)', async () => {
          jest.spyOn(pedidosProxy, 'createPedido').mockResolvedValue({ id: 1, estado: 'PENDIENTE' });
          const res = await request(app.getHttpServer())
            .post('/api/pedidos')
            .send({ clienteId: 1, detalles: [{ productoId: 1, cantidad: 3 }] });
          expect(res.statusCode).toBe(201);
          expect(res.body.id).toBe(1);
        });

        test('test 4 manejo de errores - Crear pedido con stock insuficiente (retorna 409)', async () => {
          jest.spyOn(pedidosProxy, 'createPedido').mockRejectedValue(new ProxyException('Stock insuficiente para el producto Mesa', 409));
          const res = await request(app.getHttpServer())
            .post('/api/pedidos')
            .send({ clienteId: 1, detalles: [{ productoId: 1, cantidad: 999 }] });
          expect(res.statusCode).toBe(409);
          expect(res.body.error).toBe('Stock insuficiente para el producto Mesa');
        });

        test('test 5 manejo de errores - Transición de estado inválida en pedido (retorna 422)', async () => {
          jest.spyOn(pedidosProxy, 'updateEstadoPedido').mockRejectedValue(new ProxyException('No se puede cambiar el estado de CANCELADO a APROBADO', 422));
          const res = await request(app.getHttpServer())
            .put('/api/pedidos/1/estado')
            .send({ estado: 'APROBADO' });
          expect(res.statusCode).toBe(422);
          expect(res.body.error).toBe('No se puede cambiar el estado de CANCELADO a APROBADO');
        });
      });
    });
  });
});
