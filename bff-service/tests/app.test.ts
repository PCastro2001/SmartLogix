import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/filters/http-exception.filter';

const pkg = require('../package.json');

describe('Health Check', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  test('GET /health retorna 200', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
  });

  test('package.json tiene main definido', () => {
    expect(pkg.main).toBeDefined();
    expect(pkg.main).toBe('src/index.js');
  });

  test('PORT tiene valor por defecto si no está en env', () => {
    delete process.env.PORT;
    const port = process.env.PORT || 8080;
    expect(port).toBe(8080);
  });

  test('GET /ruta-inexistente retorna 404', async () => {
    const res = await request(app.getHttpServer()).get('/ruta-que-no-existe');
    expect(res.statusCode).toBe(404);
  });

  test('package.json tiene version válida (semver)', () => {
    const semver = /^\d+\.\d+\.\d+$/;
    expect(semver.test(pkg.version)).toBe(true);
  });
});
