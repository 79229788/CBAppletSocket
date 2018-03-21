const http = require('http');
const server = http.createServer().listen(8888);
const Sockets = require('./sockets');
const io = new Sockets(server);

io.on('connection', function(socket) {
  console.log('@@@open');
  socket.on('joinRoom', function(message) {
    const roomName = message.roomName;
    socket.join(roomName);
    socket.res('joinRoom', 200, io.subscribes(roomName).length);
  });
  socket.on('disconnect', function (code) {
    console.log('@@@close', code);
  });
  socket.on('error', function (error) {
    console.log('@@@error', error);
  });
});

