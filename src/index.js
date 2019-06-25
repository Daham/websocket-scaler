import * as events from 'events';

import ServerWrapper from './core/serverWrapper';
import * as constants from './utils/constants';

//concrete server classes
import wsServer from './services/ws/wsServer';

//concrete publisher subscriber service classes
import redisPubSub from './services/pubSub/redisPubSub';

/**
 * @description - Web-Socket Server class.
 * @export
 * @class Server
 * @extends {events.EventEmitter}
 */
export default class Server extends events.EventEmitter {

    /**
     *Creates an instance of Server.
     * @param {object} { serverType, queueType, host, port, serverOptions, queueOptions }
     * @memberof Server
     */
    constructor({ serverType, queueType, serverOptions, queueOptions }) {
        super();
        this._serverType = serverType;
        this._queueType = queueType;
        this._serverOptions = serverOptions;
        this._queueOptions = queueOptions;

        this._server = null;
        this._wsServer = null;
        this._pubSub = null;

        this._init();
    }

    /**
     * @description - initialize a Web-socket server with different configuratiosn.
     * @memberof Server
     */
    _init() {
        const _this = this;
        switch (_this._serverType) {
            case constants.WS:
                switch (_this._queueType) {
                    case constants.REDIS:
                        _this._wsServer = wsServer;
                        _this._pubSub = redisPubSub;
                        break;
                    case constants.AMQP:
                        break;
                    default:
                        break;
                }
                break;
            case constants.SOCKET_IO:
                switch (_this._queueType) {
                    case constants.REDIS:
                        break;
                    case constants.AMQP:
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }

        _this._initWebSocketServerWithPubSub();
    }

    /**
     * @description - initialize a websocket server by assigning different strategies to strategy managers.
     * @memberof Server
     */
    _initWebSocketServerWithPubSub() {
        const _this = this;

        _this._server = new ServerWrapper(_this._serverOptions, _this._queueOptions);
        _this._server.webSocketServer = _this._wsServer;
        _this._server.pubSub = _this._pubSub;

        _this._server.init();

        _this._server.on('connection', (ws) => {
            _this.emit('connection', ws);
        });

        _this._server.on('message', (message, webSocket) => {
            _this.emit('message', message, webSocket);
        });
    }

    /**
     * @description - stores web-socket (storing ws is essential for scaling bahavior)
     * @param {string} key - key in the socket map.
     * @param {object} ws - web-socket
     * @memberof Server
     */
    storeWebSocket(key, ws) {
        this._server.storeWebSocket(key, ws);
    }

    /**
     * @description - send message through a given socket
     * @param {string} key - key in the socket map.
     * @param {string} message - message as a string.
     * @memberof Server
     */
    send(key, message) {
        this._server.send(key, message);
    }


    /**
     * @description - close web-socket
     * @param {string} key - key in the socket map.
     * @memberof Server
     */
    close(key) {
        this._server.close(key);
    }

    /**
      * @description - subscribe to a global message which is required to be listened by all web-socket servers.
      * @param {string} tagFieldKey - key of the field where the tag is given.
      * @param {string} tag - tag label.
      * @memberof Server
      */
    subscribeToGlobalMessage(tagFieldKey, tag) {
        this._server.subscribeToGlobalMessage(tagFieldKey, tag);
    }

    /**
    * @description - 
    * @returns {Map<string>} - WebSocket Map
    * @memberof Server
    */
    getWebSocketMap(key) {
        return this._server.getWebSocketMap(key);
    }


}


// const server = new Server({
//     serverType: 'ws',
//     queueType: 'redis',
//     serverOptions: {
//         port: process.env.PORT
//     },
//     queueOptions: {
//         host: '127.0.0.1',
//         port: 6379
//     }
// });

// server.subscribeToGlobalMessage("name", "TUNNEL");


// server.on('connection', (ws) => {
//     console.log("-----Connected------" + ws);

//     // setTimeout(function () {
//     //     console.log("======Closing MESSAGE========");
//     //     server.close('FIRST');
//     //     server.send('FIRST', `hello----${process.env.PORT}`);
//     // }, 10000);

// });

// server.on('message', (message, ws) => {
//     if (ws) {
//         console.log("-----Message with socket------" + ws + JSON.stringify(message));
//         if (JSON.parse(message).name === 'JOIN') {
//             console.log("-----storing------" + ws);
//             server.storeWebSocket('FIRST', ws);
//         }
//     } else {
//         console.log("-----Message------" + JSON.stringify(message));
//     }

//     console.log(Object.keys(server.getWebSocketMap()));

// });


