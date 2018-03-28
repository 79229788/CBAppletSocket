const WebSocket = require('ws');
const events = require('events');
const _ = require('lodash');
const shortid = require('shortid');
const utils = require('./utils');

const Socket = function(ws, sockets) {
  this.ws = ws;
  this.ws.socketId = shortid.generate();
  this.sockets = sockets;
  this.emitter = new events.EventEmitter();
  this.id = this.ws.socketId;
  this.server = utils.getIPAddress();
  this.rooms = [];          //当前所在的房间[房间名]
  this.roomLocations = [];  //所在房间的位置[房间名，索引]
  this.sockets.clients[this.id] = this;
};

Object.assign(Socket.prototype, {
  /**
   * 事件监听
   * @param eventName
   * @param listener
   */
  on: function (eventName, listener) {
    this.emitter.on(eventName, listener);
  },
  /**
   * 提交消息
   * @param eventName
   * @param message
   */
  emit: function (eventName, message) {
    if(this.ws.readyState !== WebSocket.OPEN || !this.ws.isAlive) return;
    this.ws.send(JSON.stringify([eventName, message]));
  },
  /**
   * 回应消息
   * @param eventName
   * @param statusCode
   * @param message
   */
  res: function (eventName, statusCode, message) {
    this.emit(eventName + '@back', {statusCode: statusCode, message: message})
  },
  /**
   * 加入房间
   * @param roomName
   */
  join: function (roomName) {
    if(this.rooms[roomName]) return;
    if(!this.sockets.rooms[roomName]) this.sockets.rooms[roomName] = {};
    this.sockets.rooms[roomName][this.id] = {id: this.id, server: this.server};
    if(!this.rooms) this.rooms = {};
    this.rooms[roomName] = 1;
  },
  /**
   * 离开房间
   * @param roomName
   */
  leave: function (roomName) {
    if(!this.sockets.rooms[roomName]) return;
    delete this.rooms[roomName];
    delete this.sockets.rooms[roomName][this.id];
  },

});

module.exports = Socket;
