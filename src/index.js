const socketIO = require('socket.io');
const httpServer = require('./app');

const port = process.env.PORT || 8080;
httpServer.listen(port, () => {
  console.log(`Listening: http://localhost:${port}`);
});

const io = socketIO(httpServer);

module.exports = httpServer;
