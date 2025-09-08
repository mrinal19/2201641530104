// src/middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  const status = err && err.statusCode ? err.statusCode : 500;
  const payload = {
    error: err && err.message ? err.message : 'internal error'
  };

  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err && err.stack ? err.stack : undefined;
  }

  res.status(status).json(payload);
}

module.exports = errorHandler;
