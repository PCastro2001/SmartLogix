import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PedidoDTO, DetalleDTO } from './pedido.dto';
import { InventarioClient } from './inventario.client';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { EstadoPedido } from './pedido.entity';

describe('PedidoIntegrationTest', () => {
  let app: INestApplication;

  const mockInventarioClient = {
    obtenerProducto: jest.fn().mockImplementation((id: number) => {
      if (id === 1) {
        return { id: 1, nombre: 'Mesa', precioUnitario: 5000, stock: 100 };
      }
      if (id === 2) {
        return { id: 2, nombre: 'Silla', precioUnitario: 2000, stock: 50 };
      }
      if (id === 3) {
        return { id: 3, nombre: 'Escaso', precioUnitario: 100, stock: 0 };
      }
      if (id === 99) {
        return { id: 99, nombre: 'Generico', precioUnitario: 1000, stock: 50 };
      }
      throw new Error(`Producto no encontrado con ID: ${id}`);
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(InventarioClient)
      .useValue(mockInventarioClient)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('crearPedidoConStockDisponible', async () => {
    const dto = new PedidoDTO(1, [new DetalleDTO(1, 3)]);
    const resp = await request(app.getHttpServer())
      .post('/pedidos')
      .send(dto)
      .expect(201);

    expect(resp.body.estado).toBe(EstadoPedido.PENDIENTE);
  });

  it('totalCalculadoCorrectamente', async () => {
    const dto = new PedidoDTO(1, [new DetalleDTO(2, 4)]);
    const resp = await request(app.getHttpServer())
      .post('/pedidos')
      .send(dto)
      .expect(201);

    expect(resp.body.total).toBe(8000.0);
  });

  it('actualizarEstadoPendienteAAprobado', async () => {
    // Crear pedido
    const dto = new PedidoDTO(1, [new DetalleDTO(99, 1)]);
    const created = await request(app.getHttpServer())
      .post('/pedidos')
      .send(dto)
      .expect(201);

    const id = created.body.id;

    // Actualizar estado
    await request(app.getHttpServer())
      .put(`/pedidos/${id}/estado`)
      .send({ estado: EstadoPedido.APROBADO })
      .expect(200);

    // Obtener y verificar
    const fetched = await request(app.getHttpServer())
      .get(`/pedidos/${id}`)
      .expect(200);

    expect(fetched.body.estado).toBe(EstadoPedido.APROBADO);
  });

  it('crearPedidoSinStockRetorna409', async () => {
    const dto = new PedidoDTO(1, [new DetalleDTO(3, 1)]);
    await request(app.getHttpServer())
      .post('/pedidos')
      .send(dto)
      .expect(409);
  });

  it('obtenerPedidoInexistenteRetorna404', async () => {
    await request(app.getHttpServer())
      .get('/pedidos/99999')
      .expect(404);
  });
});
