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
    my.socket.disconnect();
  },
  onUnload() {
    //my.socket.disconnect();
  },
  onTapConnect() {
    my.socket.connect();
    // socket.joinRoom('roomA').then(message => {
    //   this.setData({message: message});
    // });
  },
  onTapDisconnect() {
    my.socket.disconnect();
  },
});
