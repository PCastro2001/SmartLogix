const axios = require('axios');

const baseURL = process.env.PEDIDOS_URL || 'http://localhost:8082';
const defaultOptions = { timeout: 5000 };

const normalizeError = (error) => {
  if (error.response) {
    throw {
      status: error.response.status,
      message: error.response.data?.mensaje || error.response.statusText || 'Error en ms-pedidos',
    };
  } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    throw { status: 503, message: 'timeout' };
  } else {
    throw { status: 500, message: 'Error interno de red' };
  }
};

const getPedidos = async () => {
  try {
    const response = await axios.get(`${baseURL}/pedidos`, defaultOptions);
    return response.data;
  } catch (error) {
    normalizeError(error);
  }
};

const getPedidoById = async (id) => {
  try {
    const response = await axios.get(`${baseURL}/pedidos/${id}`, defaultOptions);
    return response.data;
  } catch (error) {
    normalizeError(error);
  }
};

const createPedido = async (data) => {
  try {
    const response = await axios.post(`${baseURL}/pedidos`, data, defaultOptions);
    return response.data;
  } catch (error) {
    normalizeError(error);
  }
};

const updateEstadoPedido = async (id, estado) => {
  try {
    const response = await axios.put(`${baseURL}/pedidos/${id}/estado`, { estado }, defaultOptions);
    return response.data;
  } catch (error) {
    normalizeError(error);
  }
};

const deletePedido = async (id) => {
  try {
    const response = await axios.delete(`${baseURL}/pedidos/${id}`, defaultOptions);
    return response.data;
  } catch (error) {
    normalizeError(error);
  }
};

const getPedidosPorCliente = async (clienteId) => {
  try {
    const response = await axios.get(`${baseURL}/pedidos/cliente/${clienteId}`, defaultOptions);
    return response.data;
  } catch (error) {
    normalizeError(error);
  }
};

const getPedidosPorEstado = async (estado) => {
  try {
    const response = await axios.get(`${baseURL}/pedidos/estado/${estado}`, defaultOptions);
    return response.data;
  } catch (error) {
    normalizeError(error);
  }
};

module.exports = {
  getPedidos,
  getPedidoById,
  createPedido,
  updateEstadoPedido,
  deletePedido,
  getPedidosPorCliente,
  getPedidosPorEstado,
};
