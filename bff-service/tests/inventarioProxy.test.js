const axios = require('axios');
jest.mock('axios');

const inventarioProxy = require('../src/proxies/inventarioProxy');

describe('InventarioProxy', () => {

  // ✅ TEST 1 — getProductos retorna lista cuando ms-inventario responde OK
  test('getProductos retorna array de productos', async () => {
    axios.get.mockResolvedValue({ data: [{ id: 1, nombre: 'Caja' }] });
    const result = await inventarioProxy.getProductos();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].nombre).toBe('Caja');
  });

  // ✅ TEST 2 — getProductoById retorna el producto correcto
  test('getProductoById retorna producto por ID', async () => {
    axios.get.mockResolvedValue({ data: { id: 5, nombre: 'Mesa' } });
    const result = await inventarioProxy.getProductoById(5);
    expect(result.id).toBe(5);
  });

  // ✅ TEST 3 — createProducto envía POST y retorna producto creado
  test('createProducto retorna producto creado', async () => {
    const nuevo = { nombre: 'Silla', precio: 3000, stock: 20 };
    axios.post.mockResolvedValue({ data: { id: 10, ...nuevo } });
    const result = await inventarioProxy.createProducto(nuevo);
    expect(result.id).toBe(10);
  });

  // ❌ TEST 4 — Fallo esperado: 404 de ms-inventario se normaliza a error controlado
  test('getProductoById con ID inexistente lanza error normalizado', async () => {
    axios.get.mockRejectedValue({ response: { status: 404, data: { mensaje: 'No encontrado' } } });
    await expect(inventarioProxy.getProductoById(999)).rejects.toMatchObject({
      status: 404,
      message: 'No encontrado'
    });
  });

  // ❌ TEST 5 — Fallo esperado: timeout de Axios se normaliza a error 503
  test('timeout de ms-inventario se normaliza a error 503', async () => {
    axios.get.mockRejectedValue({ code: 'ECONNABORTED', message: 'timeout' });
    await expect(inventarioProxy.getProductos()).rejects.toMatchObject({ status: 503 });
  });
});
