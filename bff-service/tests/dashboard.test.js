const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/proxies/inventarioProxy');
jest.mock('../src/proxies/pedidosProxy');

const inventarioProxy = require('../src/proxies/inventarioProxy');
const pedidosProxy = require('../src/proxies/pedidosProxy');

describe('Dashboard enriquecido y ErrorHandler', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ✅ TEST 1 — Dashboard con todos los servicios OK retorna datos completos
  test('dashboard OK retorna parcial:false', async () => {
    inventarioProxy.getProductos.mockResolvedValue([{}, {}, {}]);
    inventarioProxy.getBajoStock.mockResolvedValue([{}]);
    pedidosProxy.getPedidos.mockResolvedValue([{}, {}]);
    pedidosProxy.getPedidosPorEstado.mockResolvedValue([{}]);
    const res = await request(app).get('/api/dashboard');
    expect(res.body.parcial).toBe(false);
    expect(res.body.totalProductos).toBe(3);
  });

  // ✅ TEST 2 — Dashboard retorna conteo de bajo stock
  test('dashboard incluye bajosStock en respuesta', async () => {
    inventarioProxy.getProductos.mockResolvedValue([]);
    inventarioProxy.getBajoStock.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    pedidosProxy.getPedidos.mockResolvedValue([]);
    pedidosProxy.getPedidosPorEstado.mockResolvedValue([]);
    const res = await request(app).get('/api/dashboard');
    expect(res.body.productosBajoStock).toBe(2);
  });

  // ✅ TEST 3 — errorHandler retorna JSON con campo error
  test('errorHandler retorna JSON estructurado', async () => {
    // endpoint de prueba que lanza error
    const res = await request(app).get('/api/test-error');
    expect(res.body).toHaveProperty('error');
    expect(res.statusCode).toBe(418);
  });

  // ❌ TEST 4 — Fallo esperado: dashboard parcial con Promise.allSettled retorna parcial:true
  test('dashboard con fallo parcial retorna parcial:true', async () => {
    inventarioProxy.getProductos.mockRejectedValue(new Error('down'));
    inventarioProxy.getBajoStock.mockRejectedValue(new Error('down'));
    pedidosProxy.getPedidos.mockResolvedValue([]);
    pedidosProxy.getPedidosPorEstado.mockResolvedValue([]);
    const res = await request(app).get('/api/dashboard');
    expect(res.body.parcial).toBe(true);
  });

  // ❌ TEST 5 — Fallo esperado: error sin status retorna 500 por defecto
  test('error sin status definido retorna 500', async () => {
    // Forzamos un error en una ruta que no sea dashboard para ver el errorHandler en acción
    inventarioProxy.getProductos.mockImplementation(() => {
        throw new Error('unknown error');
    });
    const res = await request(app).get('/api/inventario/productos');
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('unknown error');
  });
});
