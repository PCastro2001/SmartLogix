const express = require('express');
const router = express.Router();
const inventarioProxy = require('../proxies/inventarioProxy');
const pedidosProxy = require('../proxies/pedidosProxy');

// Helper para normalizar respuestas de error del proxy
const handleProxyError = (error, res) => {
  const status = error.status >= 500 ? 502 : (error.status || 500);
  res.status(status).json({ error: error.message });
};

// Rutas de Inventario
router.get('/inventario/productos', async (req, res, next) => {
  try {
    const productos = await inventarioProxy.getProductos();
    res.json(productos);
  } catch (error) {
    handleProxyError(error, res);
  }
});

router.get('/inventario/productos/:id', async (req, res, next) => {
  try {
    const producto = await inventarioProxy.getProductoById(req.params.id);
    res.json(producto);
  } catch (error) {
    handleProxyError(error, res);
  }
});

router.post('/inventario/productos', async (req, res, next) => {
  try {
    const producto = await inventarioProxy.createProducto(req.body);
    res.status(201).json(producto);
  } catch (error) {
    handleProxyError(error, res);
  }
});

router.put('/inventario/productos/:id', async (req, res, next) => {
  try {
    const producto = await inventarioProxy.updateProducto(req.params.id, req.body);
    res.json(producto);
  } catch (error) {
    handleProxyError(error, res);
  }
});

router.delete('/inventario/productos/:id', async (req, res, next) => {
  try {
    await inventarioProxy.deleteProducto(req.params.id);
    res.status(204).end();
  } catch (error) {
    handleProxyError(error, res);
  }
});

router.patch('/inventario/productos/:id/stock', async (req, res, next) => {
  try {
    const producto = await inventarioProxy.ajustarStock(req.params.id, req.query.cantidad);
    res.json(producto);
  } catch (error) {
    handleProxyError(error, res);
  }
});

// Rutas de Pedidos
router.get('/pedidos', async (req, res, next) => {
  try {
    const pedidos = await pedidosProxy.getPedidos();
    res.json(pedidos);
  } catch (error) {
    handleProxyError(error, res);
  }
});

router.get('/pedidos/:id', async (req, res, next) => {
  try {
    const pedido = await pedidosProxy.getPedidoById(req.params.id);
    res.json(pedido);
  } catch (error) {
    handleProxyError(error, res);
  }
});

router.post('/pedidos', async (req, res, next) => {
  try {
    const pedido = await pedidosProxy.createPedido(req.body);
    res.status(201).json(pedido);
  } catch (error) {
    handleProxyError(error, res);
  }
});

router.put('/pedidos/:id/estado', async (req, res, next) => {
  try {
    const pedido = await pedidosProxy.updateEstadoPedido(req.params.id, req.body.estado);
    res.json(pedido);
  } catch (error) {
    handleProxyError(error, res);
  }
});

router.delete('/pedidos/:id', async (req, res, next) => {
  try {
    await pedidosProxy.deletePedido(req.params.id);
    res.status(204).end();
  } catch (error) {
    handleProxyError(error, res);
  }
});

// Dashboard Facade
router.get('/dashboard', async (req, res, next) => {
  try {
    const [productos, pedidos] = await Promise.all([
      inventarioProxy.getProductos(),
      pedidosProxy.getPedidos()
    ]);
    res.json({ productos, pedidos });
  } catch (error) {
    // Para el dashboard, si falla uno, retornamos 207 o 502 según el test
    res.status(207).json({ 
      error: 'Error al obtener datos parciales', 
      detalle: error.message 
    });
  }
});

module.exports = router;
