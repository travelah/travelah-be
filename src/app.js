const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const cors = require('cors');

const dotenv = require('dotenv');

const env = process.env.NODE_ENV || 'development';

if (env === 'production') {
  dotenv.config({ path: `.env.${env}` });
} else {
  dotenv.config({ path: '.env' });
}

const middlewares = require('./middleware/middleware');
const api = require('./api');

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
