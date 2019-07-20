import * as events from 'events';

import ServerWrapper from './core/serverWrapper';
import * as constants from './utils/constants';

//concrete server classes
import wsServer from './services/ws/wsServer';

//concrete publisher subscriber service classes
import amqpRpc from './services/rpc/amqpRpc';

//concrete store service classes
import redisStore from './services/store/redisStore';

/**
 * @description A class to represent the Server. This builds Server Wrapper Object according to the arguments provided. 
 * @export
 * @class Server
 * @extends {events.EventEmitter}
 */
export default class Server extends events.EventEmitter {

    /**
     * Creates an instance of Server.
     * @param {object} { serverType, brokerType, storeType, serverOptions, messageBrokerOptions, storeOptions } - Types and options of server properties.
     * @memberof Server
     */
    constructor({ serverType, queueType: brokerType, storeType: storeType, serverOptions, messageBrokerOptions, storeOptions }) {
        super();

        //Facts on which concrete object types of properties to be used. 
        this._serverType = serverType;
        this._brokerType = brokerType;
        this._storeType = storeType;

        //Configurations of concrete object types of properties.
        this._serverOptions = serverOptions;
        this._messageBrokerOptions = messageBrokerOptions;
        this._storeOptions = storeOptions;

        //variables for concrete instances.
        this._server = null;
        this._wsServer = null;
        this._messageBroker = null;
        this._store = null;

        this._init();
    }

    /**
     * @description - initialize a Web-socket server with different configurations.
     * @memberof Server
     */
    _init() {
        const _this = this;

        //TODO: This will be written in more elabortaive fashion when extending.
        if (_this._serverType === constants.WS) {
            if (_this._brokerType === constants.AMQP) {
                if (_this._storeType === constants.REDIS) {
                    _this._wsServer = wsServer;
                    _this._messageBroker = amqpRpc;
                    _this._store = redisStore;
                }
            }
        }

        _this._initWebSocketServerWithProperties();
    }

    /**
     * @description - initialize a websocket server by assigning different strategies to strategy managers.
     * @memberof Server
     */
    _initWebSocketServerWithProperties() {
        const _this = this;

        _this._server = new ServerWrapper(_this._serverOptions, _this._messageBrokerOptions, _this._storeOptions);

        //Initialize concerete strategies.
        _this._server.webSocketServer = _this._wsServer;
        _this._server.messageBroker = _this._messageBroker;
        _this._server.store = _this._store;

        //Initialize websocket listeners.
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
     * @param {object} metaDataObj - metadata to be stored within the websocket object itself (e.g identity, createdTime etc).
     * @memberof Server
     */
    storeWebSocket(key, ws, metaDataObj) {
        this._server.storeWebSocket(key, ws, metaDataObj);
    }

    /**
     * @description - remove websocket (removing ws is essential for scaling bahavior)
     * @param {object} key - key in the socket map.
     * @memberof Server
     */
    removeWebSocket(key) {
        this._server.removeWebSocket(key);
    }

    /**
     * @description - Send message through a given socket
     * @param {string} key - key in the socket map.
     * @param {string} message - message as a string.
     * @param {*} callback - The callback that handles the response.
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
     * @description - Close web-socket
     * @param {string} key - key in the socket map.
     * @param {*} callback - The callback that handles the response.
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
     * @param {string} - key
     * @returns {object} - websocket
     * @memberof Server
     */
    getWebSocket(key) {
        return this._server.getWebSocket(key);
    }

    /**
     * @description - Check whether the given websocket exists in other peer websocket maps.
     * @param {string} key - key
     * @param {boolean} callback - true/false
     * @memberof Server
     */
    isWebSocketGloballyExist(key, callback) {
        this._server.isWebSocketGloballyExist(key, function (err, isExist) {
            if (err) {
                return callback(true);
            }
            return callback(null, isExist);
        });
    }
}


