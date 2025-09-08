// src/middleware/loggingMiddleware.js
const fs = require('fs');
const path = require('path');

const logFile = process.env.LOG_FILE || path.join(__dirname, '../../logs/app.log');
// ensure logs folder exists
try {
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
} catch (e) {
  // ignore
}

function writeLog(obj) {
  const line = JSON.stringify(obj) + '\\n';
  fs.appendFile(logFile, line, (err) => {
    if (err) {
      // do not crash app from logging errors
      console.error('log write err', err && err.message ? err.message : err);
    }
  });
}

function loggingMiddleware(req, res, next) {
  const start = Date.now();
  req.logContext = {
    rid: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    path: req.path,
    method: req.method,
    ip: req.ip,
  };

  res.on('finish', () => {
    const record = {
      ts: new Date().toISOString(),
      rid: req.logContext.rid,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration_ms: Date.now() - start,
    };
    writeLog(record);
  });

  next();
}

module.exports = loggingMiddleware;
