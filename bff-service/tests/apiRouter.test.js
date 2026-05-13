const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/proxies/inventarioProxy');
jest.mock('../src/proxies/pedidosProxy');

const inventarioProxy = require('../src/proxies/inventarioProxy');
const pedidosProxy = require('../src/proxies/pedidosProxy');

describe('API Router - BFF Facade', () => {

  // ✅ TEST 1 — GET /api/inventario/productos proxy a ms-inventario
  test('GET /api/inventario/productos retorna 200', async () => {
    inventarioProxy.getProductos.mockResolvedValue([{ id: 1, nombre: 'Mesa' }]);
    const res = await request(app).get('/api/inventario/productos');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  // ✅ TEST 2 — GET /api/pedidos proxy a ms-pedidos
  test('GET /api/pedidos retorna 200', async () => {
    pedidosProxy.getPedidos.mockResolvedValue([{ id: 1, estado: 'PENDIENTE' }]);
    const res = await request(app).get('/api/pedidos');
    expect(res.statusCode).toBe(200);
  });

  // ✅ TEST 3 — GET /api/dashboard agrega datos de ambos servicios
  test('GET /api/dashboard retorna inventario y pedidos', async () => {
    inventarioProxy.getProductos.mockResolvedValue([{ id: 1 }]);
    inventarioProxy.getBajoStock.mockResolvedValue([]);
    pedidosProxy.getPedidos.mockResolvedValue([{ id: 1 }]);
    pedidosProxy.getPedidosPorEstado.mockResolvedValue([]);
    
    const res = await request(app).get('/api/dashboard');
    expect(res.body).toHaveProperty('totalProductos');
    expect(res.body).toHaveProperty('totalPedidos');
    expect(res.body.parcial).toBe(false);
  });

  // ❌ TEST 4 — Fallo esperado: ms-inventario caído retorna 502 Bad Gateway
  test('GET /api/inventario/productos con servicio caído retorna 502', async () => {
    inventarioProxy.getProductos.mockRejectedValue({ status: 503, message: 'Service unavailable' });
    const res = await request(app).get('/api/inventario/productos');
    expect(res.statusCode).toBe(502);
  });

  // ❌ TEST 5 — Fallo esperado: dashboard con un servicio caído retorna parcial:true
  test('GET /api/dashboard con ms-pedidos caído retorna parcial true', async () => {
    inventarioProxy.getProductos.mockResolvedValue([]);
    inventarioProxy.getBajoStock.mockResolvedValue([]);
    pedidosProxy.getPedidos.mockRejectedValue({ status: 503 });
    pedidosProxy.getPedidosPorEstado.mockResolvedValue([]);
    
    const res = await request(app).get('/api/dashboard');
    expect(res.body.parcial).toBe(true);
    expect(res.statusCode).toBe(200); // Promise.allSettled no falla el request global
  });
});
