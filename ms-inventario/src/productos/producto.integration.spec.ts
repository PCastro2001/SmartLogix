import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { ProductoDTO } from './producto.dto';
import { HttpExceptionFilter } from '../filters/http-exception.filter';

describe('ProductoIntegrationTest', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('crearYObtenerProducto', async () => {
    const dto = new ProductoDTO('Palet', 'Madera', 3000.0, 100, 10);
    const createdResponse = await request(app.getHttpServer())
      .post('/productos')
      .send(dto)
      .expect(201);

    const id = createdResponse.body.id;
    expect(id).toBeDefined();

    const fetchedResponse = await request(app.getHttpServer())
      .get(`/productos/${id}`)
      .expect(200);

    expect(fetchedResponse.body.nombre).toBe('Palet');
  });

  it('ajustarStockFlujoCompleto', async () => {
    // Crear producto de prueba
    const dto = new ProductoDTO('Cinta', 'Desc', 100.0, 50, 10);
    const created = await request(app.getHttpServer())
      .post('/productos')
      .send(dto)
      .expect(201);

    const id = created.body.id;

    // Ajustar stock
    await request(app.getHttpServer())
      .patch(`/productos/${id}/stock?cantidad=20`)
      .expect(200);

    const updated = await request(app.getHttpServer())
      .get(`/productos/${id}`)
      .expect(200);

    expect(updated.body.stock).toBe(70);
  });

  it('bajoStockRetornaResultados', async () => {
    const dto = new ProductoDTO('Escaso', 'Desc', 100.0, 2, 10); // stock=2, stockMinimo=10
    await request(app.getHttpServer())
      .post('/productos')
      .send(dto)
      .expect(201);

    const resp = await request(app.getHttpServer())
      .get('/productos/bajo-stock')
      .expect(200);

    expect(Array.isArray(resp.body)).toBe(true);
    expect(resp.body.length).toBeGreaterThan(0);
  });

  it('obtenerIdInexistenteRetorna404', async () => {
    const resp = await request(app.getHttpServer())
      .get('/productos/99999')
      .expect(404);

    expect(resp.body.mensaje).toContain('Producto no encontrado');
  });

  it('ajustarStockNegativoRetorna400', async () => {
    const dto = new ProductoDTO('Limitado', 'Desc', 100.0, 3, 10);
    const created = await request(app.getHttpServer())
      .post('/productos')
      .send(dto)
      .expect(201);

    const id = created.body.id;

    await request(app.getHttpServer())
      .patch(`/productos/${id}/stock?cantidad=-100`)
      .expect(400);
  });
});
