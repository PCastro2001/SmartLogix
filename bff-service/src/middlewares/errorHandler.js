const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  
  res.status(status).json({
    error: message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
};

module.exports = errorHandler;
