function errorHandler(err, req, res, next) {
  console.error('[VaultGuard API Error]', err.stack || err.message);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `API Route Not Found - [${req.method}] ${req.originalUrl}`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
