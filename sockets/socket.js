const WebSocket = require('ws');
const events = require('events');
const _ = require('lodash');
const uuid = require('uuid/v1');
const utils = require('./utils');

const Socket = function(ws, sockets) {
  this.ws = ws;
  this.sockets = sockets;
  this.emitter = new events.EventEmitter();
  this.id = uuid();
  this.server = utils.getIPAddress();
  this.sockets.sockets[this.id] = this;
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
    if(this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify([eventName, message]));
  },
  /**
   * 向房间广播消息
   * @param roomNames
   * @param eventName
   * @param data
   */
  broadcast: function (roomNames, eventName, data) {
    roomNames = !_.isArray(roomNames) ? [roomNames] : roomNames;
    const space = this.sockets;
    roomNames.forEach(roomName => {
      space.in(roomName);
    });
    space.emit(eventName, data);
  },
  /**
   * 获取房间订阅数
   * @param roomNames
   */
  subscribes: function (roomNames) {

  },
  /**
   * 加入房间
   * @param roomName
   */
  join: function (roomName) {
    if(!this.sockets.rooms[roomName]) {
      this.sockets.rooms[roomName] = [{id: this.id, ip: this.server}];
    }else {
      this.sockets.rooms[roomName].push({id: this.id, ip: this.server});
    }
    if(!this.ws.rooms) {
      this.ws.rooms = [roomName]
    }else {
      this.ws.rooms.push(roomName);
    }
  },
  /**
   * 离开房间
   * @param roomName
   */
  leave: function (roomName) {
    if(!this.sockets.rooms[roomName]) return;
    _.remove(this.sockets.rooms[roomName], item => item === roomName);
    _.remove(this.ws.rooms, item => item === roomName);
  },

});

module.exports = Socket;