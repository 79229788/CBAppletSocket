Page({
  data: {
    status: '',
    message: '',
  },
  onLoad() {
    // socket.on('connect', () => {
    //   this.setData({status: 'connected'});
    // });
    // socket.on('disconnect', () => {
    //   this.setData({status: 'disconnected'});
    //   this.setData({message: 'no message'});
    // });
    // socket.on('connect_error', (error) => {
    //   this.setData({status: 'connect error'});
    //   console.log(error);
    // });
    // socket.on('say', message => {
    //   this.setData({message: message});
    // });
  },
  onHide() {
    //my.closeSocket();
    //my.socket.disconnect();
  },
  onUnload() {
    //my.closeSocket();
    //my.socket.disconnect();
  },
  onTapConnect() {
    my.connectSocket({url: 'ws://192.168.0.189:8888'});
    my.onSocketOpen(() => {
      console.log('@@@open');
    });
    my.onSocketClose(() => {
      console.log('@@@close');
    });
    //my.socket.connect();
    // socket.joinRoom('roomA').then(message => {
    //   this.setData({message: message});
    // });
  },
  onTapDisconnect() {
    my.closeSocket();
    //my.socket.disconnect();
  },
});
