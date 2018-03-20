import events from './events';

const Socket = function (options) {
  this.opts = Object.assign({
    url: 'ws://localhost:8888',
    debug: false,
    autoConnect: false,
  }, options);
  this.url = this.opts.url;
  this.debug = this.opts.debug;
  this.init();
};

Object.assign(Socket.prototype, {
  pendedEvents: [], //已挂载的事件
  init: function () {
    this.emitter = new events.EventEmitter();
    if(this.opts.autoConnect) this.connect();
    this._onConnect = this._onConnect.bind(this);
    this._onDisconnect = this._onDisconnect.bind(this);
    this._onConnectError = this._onConnectError.bind(this);
    this._onMessage = this._onMessage.bind(this);
    this.emitter.on('handlePendedEvents', () => {
      this.pendedEvents.forEach(event => {
        this.emit(event.eventName, event.message);
      });
      this.pendedEvents = [];
    });
  },
  /**
   * 连接socket
   */
  connect: function () {
    if(this.connected) return;
    my.connectSocket({url: this.url});
    my.onSocketOpen(this._onConnect);
    my.onSocketClose(this._onDisconnect);
    my.onSocketError(this._onConnectError);
    my.onSocketMessage(this._onMessage);
  },
  /**
   * 断开socket
   */
  disconnect: function () {
    if(!this.connected) return;
    my.closeSocket();
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
    if(this.onConnect) this.onConnect();
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
    if(this.onDisconnect) this.onDisconnect();
    if (this.debug) {
      console.log('====================================');
      console.log('Socket was disconnected from Page.');
      console.log('====================================');
    }
  },
  _onConnectError: function (error) {
    this.connected = false;
    this.emitter.emit('connect_error', error);
    if(this.onConnectError) this.onConnectError();
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
    my.sendSocketMessage({
      data: JSON.stringify([eventName, message]),
    });
  },
  /**
   * 带有回应的消息提交
   * @param eventName
   * @param object
   */
  emitBack: function (eventName, object) {

  },
});

export default Socket;
