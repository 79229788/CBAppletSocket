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
  this.inClients = [];
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
    });
    ws.on('error',  (error) => {
      console.log(error);
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
      _.each(this.clients, (socket) => {
        if(socket.ws.isAlive === false) return socket.ws.terminate();
        socket.ws.isAlive = false;
        socket.ws.ping();
      });
    }, interval);
  },
  /**
   * 移除Socket
   */
  removeSocket: function (ws) {
    const socket = this.clients[ws.socketId];
    const roomLocations = socket.roomLocations;
    roomLocations.forEach(location => {
      this.rooms[location[0]].splice(location[1], 1);
    });
    delete this.clients[ws.socketId];
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
   * 给当前内部的sockets全部发消息
   */
  emit: function (eventName, message) {
    this.inClients.forEach(socket => {
      socket.emit(eventName, message)
    });
    this.inClients = [];
  },
  /**
   * 给当前内部添加sockets
   */
  in: function (roomName) {
    const rooms = this.rooms[roomName];
    if(rooms) {
      rooms.forEach(data => {
        const socket = this.clients[data.id];
        if(socket) this.inClients.push(socket);
      });
    }
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
    roomNames = !_.isArray(roomNames) ? [roomNames] : roomNames;
    roomNames.forEach(roomName => {
      this.in(roomName);
    });
    this.emit(eventName, data);
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
      subscribes = subscribes.concat(sockets);
    });
    return subscribes;
  },
});

module.exports = Sockets;
