import * as events from 'events';

import ServerWrapper from './core/serverWrapper';
import * as constants from './utils/constants';

//concrete server classes
import wsServer from './services/ws/wsServer';

//concrete publisher subscriber service classes
import amqpRpc from './services/rpc/amqpRpc';

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
    constructor({ serverType, queueType, serverOptions, messageBrokerOptions }) {
        super();
        this._serverType = serverType;
        this._queueType = queueType;
        this._serverOptions = serverOptions;
        this._messageBrokerOptions = messageBrokerOptions;

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
                    case constants.AMQP:
                        _this._wsServer = wsServer;
                        _this._messageBroker = amqpRpc;
                        break;
                    default:
                        break;
                }
                break;
            case constants.SOCKET_IO:
                switch (_this._queueType) {
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

        _this._server = new ServerWrapper(_this._serverOptions, _this._messageBrokerOptions);
        _this._server.webSocketServer = _this._wsServer;
        _this._server.messageBroker = _this._messageBroker;

        _this._server.on('connection', (ws) => {
            _this.emit('connection', ws);
        });

        _this._server.on('message', (message, webSocket) => {
            _this.emit('message', message, webSocket);
        });

        _this._server.on('close', (webSocket) => {
            _this.emit('close', webSocket);
        });

        _this._server.on('terminate', (webSocket) => {
            _this.emit('terminate', webSocket);
        });

        _this._server.on('socket-error', (webSocket, err) => {
            _this.emit('socket-error', webSocket, err);
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
     * @description - remove websocket (removing ws is essential for scaling bahavior)
     * @param {*} key- key in the socket map.
     * @memberof Server
     */
    removeWebSocket(key) {
        this._server.removeWebSocket(key);
    }

    /**
     * @description - send message through a given socket
     * @param {string} key - key in the socket map.
     * @param {string} message - message as a string.
     * @memberof Server
     */
    send(key, message, callback) {
        this._server.send(key, message, function (err) {
            if (err) {
                return callback(err);
            }
            return callback(null);
        });
    }

    /**
     * @description - close web-socket
     * @param {string} key - key in the socket map.
     * @memberof Server
     */
    close(key, callback) {
        this._server.close(key, function (err) {
            if (err) {
                return callback(err);
            }
            return callback(null);
        });
    }

    /**
    * @description - get web-socket map.
    * @returns {Map<string>} - WebSocket Map
    * @memberof Server
    */
    getWebSocketMap() {
        return this._server.getWebSocketMap();
    }

    /**
     * @description - get a web-socket by key.
     * @param {*} key
     * @returns
     * @memberof Server
     */
    getWebSocket(key) {
        return this._server.getWebSocket(key);
    }


}


