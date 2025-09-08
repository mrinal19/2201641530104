// src/config/db.js
const mongoose = require('mongoose');

async function connectDB(uri) {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('DB: connected');
  } catch (err) {
    console.error('DB: connection error', err.message);
    throw err;
  }
}

module.exports = connectDB;
