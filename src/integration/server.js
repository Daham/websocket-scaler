import fs from 'fs';
import Server from '../index';

const COMMON_LOG_FILE = '/Users/dahamp/Downloads/socket-prac.log';

const log = function (data) {
    fs.appendFileSync(COMMON_LOG_FILE, `[SEVER]-${process.env.PORT}-MESSAGE-${data}\n`);
};

const server = new Server({
    serverType: 'ws',
    queueType: 'redis',
    serverOptions: {
        port: process.env.PORT
    },
    queueOptions: {
        host: '127.0.0.1',
        port: 6379
    }
});

server.subscribeToGlobalMessage("name", "TUNNEL");

server.on('connection', () => {
    log("CONNECTED");

    if (process.env.PORT === '8082') {
        setTimeout(function () {
            log("CLOSING ");
            server.close('SOCK-8080');
            server.send('SOCK-8080', `HELLO FROM : ${process.env.PORT}`);
        }, 20000); // eslint-disable-line no-magic-numbers
    }

});

server.on('message', (message, ws) => {
    let data = JSON.parse(message);

    log(`Normal Message==============>${data.message}`);

    if (ws) {
        if (JSON.parse(message).name === 'JOIN') {
            log(`STORING SOCK-${data.port}`);
            ws.identity = `SOCK-${data.port}`;
            server.storeWebSocket(`SOCK-${data.port}`, ws);
        }
    }

    log(`-------------Current keys joined------------${JSON.stringify(Object.keys(server.getWebSocketMap()))}`);
});

server.on('close', (ws) => {
    log(`Closing Socket -${ws.identity}`);
});

server.on('terminate', (ws) => {
    log(`Terminating Socket -${ws.identity}`);
});

server.on('socket-error', (ws) => {
    log(`WebSocket Error Socket -${ws.identity}`);
});

