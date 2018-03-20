// const http = require('http');
// const server = http.createServer().listen(8888);
// const io = require('socket.io')(server);
//
// let index = 0;
// io.on('connection', function(socket) {
//   socket.on('hi', function(message) {
//     console.log(message, index);
//     socket.emit('say', `hello too${index}!`);
//     index ++;
//   })
// });

const http = require('http');
const server = http.createServer().listen(8888);
const Sockets = require('./sockets');
const io = new Sockets(server);

let index = 0;
io.on('connection', function(socket) {
  socket.on('hi', function(message) {
    console.log(message, index);
    socket.emit('say', `hello too${index}!`);
    index ++;
  })
});

