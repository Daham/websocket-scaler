import ServerWrapper from './core/serverWrapper';
import wsServer from './services/ws/wsServer';
import redisPubSub from './services/pubSub/redisPubSub';


console.log("=======111==========");
const server = new ServerWrapper({ host: '127.0.0.1', port: 6379 });
server.webSocketServer = wsServer;
server.pubSub = redisPubSub;

server.init();


server.subscribeToGlobalMessage("name", "TUNNEL");


server.on('connection', (ws) => {
    console.log("-----Connected------" + ws);
    setInterval(function () {
        console.log("======SENDING MESSAGE========");
        server.send('FIRST', `hello----${process.env.PORT}`);
    }, 5000);

    setTimeout(function () {
        console.log("======Closing MESSAGE========");
        server.close('FIRST');
    }, 10000);

});

server.on('message', (ws, message) => {
    if (message === 'JOIN') {
        console.log("-----storing------" + ws);
        server.storeWebSocket('FIRST', ws);


    }
    console.log(Object.keys(server.getWebSocketMap()));

});


