const WebSocket = require('ws');
const events = require('events');
const _ = require('lodash');
const Socket = require('./socket');
const utils = require('./utils');

const Sockets = function(server, options) {
  this.wss = new WebSocket.Server({ server });
  this.emitter = new events.EventEmitter();
  this.wss.on('connection', (ws) => {
    const socket = new Socket(ws, this);
    this.emitter.emit('connection', socket);
    socket.emit('_', socket.id);
    ws.on('message', function (message) {
      if(!_.isNaN(Number(message))) return;
      const data = JSON.parse(message);
      socket.emitter.emit(data[0], data[1]);
    });
    ws.on('error',  (error) => {
      console.log(error);
    });
  });
};

Object.assign(Sockets.prototype, {
  rooms: {},
  sockets: {},
  inSockets: [],
  /**
   * 事件监听
   * @param eventName
   * @param listener
   */
  on: function (eventName, listener) {
    this.emitter.on(eventName, listener);
  },
  /**
   * 给当前内部的sockets全部发消息
   */
  emit: function (eventName, message) {
    inSockets.forEach(socket => {
      socket.emit(eventName, message)
    });
    this.inSockets = [];
  },
  /**
   * 给当前内部添加sockets
   */
  in: function (roomName) {
    const rooms = this.rooms[roomName];
    rooms.forEach(data => {
      this.inSockets.push(this.sockets[data.id]);
    });
  },
});

module.exports = Sockets;
