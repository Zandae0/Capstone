require('dotenv').config();  // Load environment variables
const express = require('express');
const translateRouter = require('./controllers/translateController');
const errorHandler = require('./utils/errorHandler');

const app = express();

// Middleware untuk meng-handle JSON body dan URL encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Gunakan translateRouter untuk rute /translate
app.use('/translate', translateRouter);

// Middleware untuk menangani error
app.use(errorHandler);

module.exports = app;
