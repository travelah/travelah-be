const socketIO = require('socket.io');
const httpServer = require('./app');
const getIo = require('./api/chats/chats.routes').getIO;

const port = process.env.PORT || 8080;
httpServer.listen(port, () => {
  console.log(`Listening: http://localhost:${port}`);
});

const io = socketIO(httpServer);

getIo(io);

module.exports = httpServer;
