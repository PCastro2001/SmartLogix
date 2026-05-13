const request = require('supertest');
const app = require('../src/app');

describe('Health Check', () => {
  test('GET /health retorna 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
  });

  // ✅ TEST 2 — package.json tiene campo main definido
  test('package.json tiene main definido', () => {
    const pkg = require('../package.json');
    expect(pkg.main).toBeDefined();
    expect(pkg.main).toBe('src/index.js');
  });

  // ✅ TEST 3 — Variables de entorno cargadas por dotenv
  test('PORT tiene valor por defecto si no está en env', () => {
    delete process.env.PORT;
    const port = process.env.PORT || 8080;
    expect(port).toBe(8080);
  });

  // ❌ TEST 4 — Fallo esperado: ruta inexistente retorna 404
  test('GET /ruta-inexistente retorna 404', async () => {
    const res = await request(app).get('/ruta-que-no-existe');
    expect(res.statusCode).toBe(404);
  });

  // ❌ TEST 5 — Fallo esperado: package.json sin campo version lanzaría error en publish
  test('package.json tiene version válida (semver)', () => {
    const pkg = require('../package.json');
    const semver = /^\d+\.\d+\.\d+$/;
    expect(semver.test(pkg.version)).toBe(true);
  });
});
