import Socket from '../library/socket/index';
my.socket = new Socket({
  url: 'ws://172.31.31.21:8888',
  debug: true,
  autoConnect: true,
  engine: my,
});

App({
  onLaunch: function () {


    // my.connectSocket({url: 'ws://192.168.0.189:8888'});
    // my.onSocketOpen(() => {
    //   console.log('@@@open');
    // });
    // my.onSocketClose(() => {
    //   console.log('@@@close');
    // });
  },
});