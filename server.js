// src/server.js (debug friendly)
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const loggingMiddleware = require('./middleware/loggingMiddleware');
const errorHandler = require('./middleware/errorHandler');
const shortUrls = require('./routes/shorturls');

const app = express();

console.log('== STARTING debug server.js ==');
console.log('node version:', process.version);
console.log('cwd:', process.cwd());

// Basic env checks (mask password-like values)
function mask(s) {
  if (!s) return '<missing>';
  if (s.length > 20) return s.slice(0, 10) + '...' + s.slice(-7);
  return s;
}

console.log('ENV: PORT=', process.env.PORT || '<not set>');
console.log('ENV: HOSTNAME=', process.env.HOSTNAME || '<not set>');
console.log('ENV: DEFAULT_VALIDITY_MIN=', process.env.DEFAULT_VALIDITY_MIN || '<not set>');
console.log('ENV: MONGODB_URI (masked)=', mask(process.env.MONGODB_URI));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(loggingMiddleware);

// simple route for health
app.get('/_health', (req, res) => res.json({ ok: true }));

app.use('/shorturls', shortUrls);

// attach generic error handler last
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

// Start DB connection and server with extra logging
(async () => {
  try {
    console.log('Attempting DB connect...');
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('ERROR: MONGODB_URI not set in .env -> server will not start.');
      // keep process alive so you can inspect logs; exit if you prefer:
      process.exitCode = 1;
      return;
    }

    await connectDB(uri);
    console.log('DB connected successfully.');

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
      console.log(`Visit http://localhost:${PORT}/_health`);
    });

  } catch (err) {
    console.error('Startup error (caught):', err && err.message ? err.message : err);
    if (err && err.stack) console.error(err.stack);
    // set non-zero exit code
    process.exitCode = 1;
  }
})();
