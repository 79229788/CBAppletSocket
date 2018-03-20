import Socket from '../../../library/socket/index';

const socket = new Socket({
  url: 'ws://192.168.0.189:8888',
  debug: true,
  autoConnect: false,
});

Page({
  data: {
    status: '',
    message: '',
  },
  onLoad() {
    socket.on('connect', () => {
      this.setData({status: 'connected'});
    });
    socket.on('disconnect', () => {
      this.setData({status: 'disconnected'});
    });
    socket.on('connect_error', (error) => {
      this.setData({status: 'connect error'});
      console.log(error);
    });
    socket.on('say', message => {
      this.setData({message: message});
    });
  },
  onTapConnect() {
    socket.connect();
    socket.emit('hi', 'hello');
  },
  onTapDisconnect() {
    socket.disconnect();
    this.setData({message: 'no message'});
  },
});
