Page({
  data: {
    status: '',
    message: '',
  },
  onLoad() {
    this.setData({status: my.socket.isConnected() ? 'connected' : 'disconnected'});
    my.socket.on('connect', () => {
      this.setData({status: 'connected'});
    });
    my.socket.on('disconnect', () => {
      this.setData({status: 'disconnected'});
      this.setData({message: 'no message'});
    });
    my.socket.on('connect_error', (error) => {
      this.setData({status: 'connect error'});
      console.log(error);
    });
  },
  onHide() {
    //my.closeSocket();
    my.socket.disconnect();
  },
  onUnload() {
    //my.closeSocket();
    //my.socket.disconnect();
  },
  onTapConnect() {
    //my.connectSocket({url: 'ws://172.31.31.21:8888'});
    // my.onSocketOpen(() => {
    //   console.log('@@@open');
    // });
    // my.onSocketClose(() => {
    //   console.log('@@@close');
    // });
    my.socket.connect();
    my.socket.joinRoom('roomA').then(message => {
      this.setData({message: message});
    });
  },
  onTapDisconnect() {
    //my.closeSocket();
    my.socket.disconnect();
  },
});
