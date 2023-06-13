const jwt = require('jsonwebtoken');
const socketIO = require('socket.io');
const express = require('express');

const router = express.Router();
const httpServer = require('http').createServer(router);

const io = socketIO(httpServer);

function notFound(req, res, next) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    status: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
}

function isAuthenticated(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization) {
    res.status(401);
    throw new Error('Un-Authorized, you are not authenticated');
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.payload = payload;

    const { userId } = payload;
    req.userId = userId;
  } catch (err) {
    res.status(401);
    if (err.name === 'TokenExpiredError') {
      throw new Error(err.name);
    }
    throw new Error('Un-Authorized');
  }
  return next();
}

function requireAuthenticatedWebSocket(token) {
  if (!token) {
    throw new Error('Token is missing');
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    // eslint-disable-next-line no-param-reassign

    const { userId } = payload;
    // eslint-disable-next-line no-param-reassign
    const userIdRetrieved = userId;
    return userIdRetrieved;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new Error(err.name);
    }
    throw new Error('Un-Authorized');
  }
}

io.use((socket, next) => {
  requireAuthenticatedWebSocket(socket, next);
});
module.exports = {
  notFound,
  errorHandler,
  isAuthenticated,
  requireAuthenticatedWebSocket,
};
