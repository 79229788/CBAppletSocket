import Socket from '../library/socket/index';
my.socket = new Socket({
  url: 'ws://192.168.0.189:8888',
  debug: true,
  autoConnect: false,
  engine: my,
});

App({
  onLaunch: function () {

  },
});