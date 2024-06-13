require('dotenv').config();  // Load environment variables
const express = require('express');
const translateController = require('./controllers/translateController');
const errorHandler = require('./utils/errorHandler');

const app = express();

app.use(express.json());
app.use('/translate', translateController);
app.use(errorHandler);

module.exports = app;
