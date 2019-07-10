import fs from 'fs';
import Server from '../index';

const COMMON_LOG_FILE = '/Users/dahamp/Downloads/socket-prac.log';

const log = function (data) {
    fs.appendFileSync(COMMON_LOG_FILE, `[SEVER]-${process.env.PORT}-MESSAGE-${data}\n`);
};

const server = new Server({
    serverType: 'ws',
    queueType: 'amqp',
    serverOptions: { port: process.env.PORT },
    messageBrokerOptions: {
        username: '',
        password: '',
        host: ''
    }
});

server.on('connection', () => {
    log("CONNECTED");

    if (process.env.PORT === '8080') {
        setInterval(function () {
            log("CLOSING ");
            //server.close('SOCK-8080');
            server.send('SOCK-8082', `HELLO Helani FROM : ${process.env.PORT}`, function (err) {
                if (err) {
                    console.log("======111========" + err);
                }
                console.log("=======222=======");
            });
        }, 10000); // eslint-disable-line no-magic-numbers
    }


    if (process.env.PORT === '8082') {
        setInterval(function () {
            log("CLOSING ");
            //server.close('SOCK-8080');
            server.send('SOCK-8082', `HELLO Daham FROM : ${process.env.PORT}`, function (err) {
                if (err) {
                    console.log("======111========" + err);
                }
                console.log("=======222=======");
            });
        }, 10000); // eslint-disable-line no-magic-numbers
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

