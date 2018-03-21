import events from './events';

const Socket = function (options) {
  this.opts = Object.assign({
    url: 'ws://localhost:8888',
    debug: false,
    autoConnect: false,
    engine: null,
  }, options);
  this.url = this.opts.url;
  this.debug = this.opts.debug;
  this.pendedEvents = [];
  this.init();
};

Object.assign(Socket.prototype, {
  init: function () {
    this.emitter = new events.EventEmitter();
    this._onConnect = this._onConnect.bind(this);
    this._onDisconnect = this._onDisconnect.bind(this);
    this._onConnectError = this._onConnectError.bind(this);
    this._onMessage = this._onMessage.bind(this);
    if(this.opts.autoConnect) this.connect();
    this.emitter.on('handlePendedEvents', () => {
      this.pendedEvents.forEach(event => {
        this.emit(event.eventName, event.message);
      });
      this.pendedEvents = [];
    });
    this.emitter.on('disconnect', () => {
      this.offListenerAllEvents();
    });
    this.emitter.on('connect_error', () => {
      this.offListenerAllEvents();
    });
  },
  offListenerAllEvents: function () {
    if(this.opts.engine.offSocketOpen) this.opts.engine.offSocketOpen(this._onConnect);
    if(this.opts.engine.offSocketClose) this.opts.engine.offSocketClose(this._onDisconnect);
    if(this.opts.engine.offSocketError) this.opts.engine.offSocketError(this._onConnectError);
    if(this.opts.engine.offSocketMessage) this.opts.engine.offSocketMessage(this._onMessage);
  },
  /**
   * 连接socket
   */
  connect: function () {
    if(this.connected) return;
    this.opts.engine.connectSocket({url: this.url});
    this.opts.engine.onSocketOpen(this._onConnect);
  },
  /**
   * 断开socket
   */
  disconnect: function () {
    if(!this.connected) return;
    this.opts.engine.closeSocket();
  },
  /**
   * 是否在连接
   */
  isConnected: function () {
    return this.connected;
  },
  _onConnect: function () {
    this.connected = true;
    this.emitter.emit('handlePendedEvents');
    this.emitter.emit('connect', this);
    if (this.debug) {
      console.log(
        '\n' +
        '\n' +
        '  |>    Now connected to ' + this.url + '.' + '\n' +
        '\\___/   (Connected at: ' + (new Date()) + ')' + '\n' +
        '\n' +
        '\n'
      )
    }
  },
  _onDisconnect: function () {
    this.connected = false;
    this.emitter.emit('disconnect', this);
    if (this.debug) {
      console.log('====================================');
      console.log('Socket was disconnected from Page.');
      console.log('====================================');
    }
  },
  _onConnectError: function (error) {
    this.connected = false;
    this.emitter.emit('connect_error', error);
    if (this.debug) {
      console.log('====================================');
      console.log('Socket found connect error from Page.');
      console.log('====================================');
    }
  },
  _onMessage: function (message) {
    if(!isNaN(Number(message.data))) return;
    const data = JSON.parse(message.data);
    if(data[0] === '_') {
      this.id = data[1];
    }else {
      this.emitter.emit(data[0], data[1]);
    }
  },
  /**
   * 监听事件通知
   * @param eventName
   * @param listener
   * @return {Promise}
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
    if(!this.isConnected()) {
      return this.pendedEvents.push({eventName: eventName, message: message});
    }
    this.opts.engine.sendSocketMessage({
      data: JSON.stringify([eventName, message]),
    });
  },
  /**
   * 带有回应的消息提交
   * @param eventName
   * @param message
   */
  emitBack: function (eventName, message) {
    return new Promise((ok, no) => {
      this.on(eventName, data => {
        if(data.statusCode !== 200) return no(data.message);
        ok(data.message);
      });
      this.emit(eventName, message);
    });
  },
  /**
   * 加入房间
   * @param roomName
   * @param object
   * @return {*}
   */
  joinRoom: function (roomName, object) {
    return this.emitBack('joinRoom', Object.assign({}, object || {}, {roomName: roomName}));
  },
  /**
   * 离开房间
   * @param roomName
   * @param object
   * @return {*}
   */
  leaveRoom: function (roomName, object) {
    return this.emitBack('leaveRoom', Object.assign({}, object || {}, {roomName: roomName}));
  },
});

export default Socket;
