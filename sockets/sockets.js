const WebSocket = require('ws');
const events = require('events');
const _ = require('lodash');
const Socket = require('./socket');
const utils = require('./utils');

const Sockets = function(server, options) {
  this.wss = new WebSocket.Server({ server });
  this.emitter = new events.EventEmitter();
  this.rooms = {};
  this.clients = {};
  this.wss.on('connection', this.connection.bind(this));
  this.heartbeat(30000);
};

Object.assign(Sockets.prototype, {
  /**
   * 已连接
   * @param ws
   */
  connection: function (ws) {
    ws.isAlive = true;
    const socket = new Socket(ws, this);
    this.emitter.emit('connection', socket);
    socket.emit('_', socket.id);
    ws.on('message', function (message) {
      if(!_.isNaN(Number(message))) return;
      const data = JSON.parse(message);
      socket.emitter.emit(data[0], data[1]);
    });
    ws.on('close', (code) => {
      this.removeSocket(ws);
      socket.emitter.emit('disconnect', code);
    });
    ws.on('error', (error) => {
      socket.emitter.emit('connect_error', {code: error.code, message: error.message});
    });
    ws.on('pong', () => {
      ws.isAlive = true;
    });
  },
  /**
   * 心跳连接
   */
  heartbeat: function (interval) {
    setInterval(() => {
      setTimeout(() => {
        _.each(this.clients, (socket, socketId) => {
          if(socket.ws.isAlive === false) {
            this.removeSocket(socketId);
            socket.ws.terminate();
            return;
          }
          socket.ws.isAlive = false;
          socket.ws.ping();
        });
      }, 0);
    }, interval);
  },
  /**
   * 移除Socket
   */
  removeSocket: function (ws) {
    const socketId = _.isObject(ws) ? ws.socketId : ws;
    const socket = this.clients[socketId];
    if(!socket) return;
    const rooms = socket.rooms || {};
    Object.keys(rooms).forEach(room => {
      if(this.rooms[room]) delete this.rooms[room][socketId]
    });
    delete this.clients[socketId];
  },
  /**
   * 事件监听
   * @param eventName
   * @param listener
   */
  on: function (eventName, listener) {
    this.emitter.on(eventName, listener);
  },
  /**
   * 向房间广播消息
   * @param roomNames
   * @param eventName
   * @param data
   */
  broadcast: function (roomNames, eventName, data) {
    if(roomNames === null) {
      this.clients.forEach(socket => {
        socket.emit(eventName, data);
      });
      return;
    }
    roomNames = _.isArray(roomNames) ? roomNames : [roomNames];
    roomNames.forEach(roomName => {
      const sockets = this.rooms[roomName];
      if(sockets) {
        _.each(sockets, (socketInfo, socketId) => {
          const socket = this.clients[socketId];
          if(socket) socket.emit(eventName, data);
        });
      }
    });
  },
  /**
   * 获取房间的订阅者的ID
   * @param roomNames
   */
  subscribes: function (roomNames) {
    roomNames = !_.isArray(roomNames) ? [roomNames] : roomNames;
    let subscribes = [];
    roomNames.forEach(roomName => {
      const sockets = this.rooms[roomName];
      if(sockets) subscribes = subscribes.concat(Object.values(sockets));
    });
    return subscribes;
  },
});

module.exports = Sockets;
