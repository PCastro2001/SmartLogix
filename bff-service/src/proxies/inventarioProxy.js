const axios = require('axios');

const baseURL = process.env.INVENTARIO_URL || 'http://localhost:8081';
const defaultOptions = { timeout: 5000 };

const normalizeError = (error) => {
  if (error.response) {
    throw {
      status: error.response.status,
      message: error.response.data?.mensaje || error.response.statusText || 'Error en ms-inventario',
    };
  } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    throw { status: 503, message: 'timeout' };
  } else {
    throw { status: 500, message: 'Error interno de red' };
  }
};

const getProductos = async () => {
  try {
    const response = await axios.get(`${baseURL}/productos`, defaultOptions);
    return response.data;
  } catch (error) {
    normalizeError(error);
  }
};

const getProductoById = async (id) => {
  try {
    const response = await axios.get(`${baseURL}/productos/${id}`, defaultOptions);
    return response.data;
  } catch (error) {
    normalizeError(error);
  }
};

const createProducto = async (data) => {
  try {
    const response = await axios.post(`${baseURL}/productos`, data, defaultOptions);
    return response.data;
  } catch (error) {
    normalizeError(error);
  }
};

const updateProducto = async (id, data) => {
  try {
    const response = await axios.put(`${baseURL}/productos/${id}`, data, defaultOptions);
    return response.data;
  } catch (error) {
    normalizeError(error);
  }
};

const deleteProducto = async (id) => {
  try {
    const response = await axios.delete(`${baseURL}/productos/${id}`, defaultOptions);
    return response.data;
  } catch (error) {
    normalizeError(error);
  }
};

const ajustarStock = async (id, cantidad) => {
  try {
    const response = await axios.patch(`${baseURL}/productos/${id}/stock`, null, {
      ...defaultOptions,
      params: { cantidad }
    });
    return response.data;
  } catch (error) {
    normalizeError(error);
  }
};

const getBajoStock = async () => {
  try {
    const response = await axios.get(`${baseURL}/productos/bajo-stock`, defaultOptions);
    return response.data;
  } catch (error) {
    normalizeError(error);
  }
};

module.exports = {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
  ajustarStock,
  getBajoStock,
};
