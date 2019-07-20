import * as events from 'events';

import Rpc from './rpc';
import * as constants from '../utils/constants';
import Store from './store';

/**
 * @description
 * @class ServerWrapper
 * @extends {events.EventEmitter}
 */
export default class ServerWrapper extends events.EventEmitter {

    /**
     * Creates an instance of ServerWrapper.
     * @param {object} serverOptions - options required for concrete server object.
     * @param {object} brokerOptions - options required for concrete broker object.
     * @param {object} storeOptions - options required for concrete store object.
     * @memberof ServerWrapper
     */
    constructor(serverOptions, brokerOptions, storeOptions) {
        super();
        this._webSocketMap = {};
        this._serverOptions = serverOptions;

        //Initiate the Remote Procedure Call(RPC) module required to invoke methods in peer websocket servers.
        this._rpc = new Rpc({ username: brokerOptions.username, password: brokerOptions.password, host: brokerOptions.host }, this.handleRemoteProcess.bind(this, this._webSocketMap));

        //Initiate store module required to store shared properties. 
        this._store = new Store({ host: storeOptions.host, port: storeOptions.port });
    }

    /**
     * @description - Set the required web-socket server for server wrapper.
     * @param {object} webSocketServer - web-socket server.
     * @memberof ServerWrapper
     */
    set webSocketServer(webSocketServer) {
        let _this = this;

        //Creates websocket server and initiates listeners.
        _this._webSocketServer = webSocketServer;
        _this._webSocketServer.init(_this._webSocketMap, _this._serverOptions);

        _this._webSocketServer.on('connection', (webSocket) => {
            _this.emit('connection', webSocket);
        });

        _this._webSocketServer.on('message', (message, webSocket) => {
            _this.emit('message', message, webSocket);
        });

        //In close event the websocket is removed from the socket map if it is available.
        _this._webSocketServer.on('close', (webSocket) => {
            let key = webSocket.key;

            if (_this._webSocketMap[key]) {
                _this.removeWebSocket(key);
            }
            _this.emit('close', webSocket);
        });

        //In terminate event the websocket is removed from the socket map if it is available.
        _this._webSocketServer.on('terminate', (webSocket) => {
            let key = webSocket.key;

            if (_this._webSocketMap[key]) {
                _this.removeWebSocket(key);
            }
            _this.emit('terminate', webSocket);
        });

        _this._webSocketServer.on('socket-error', (webSocket, err) => {
            _this.emit('socket-error', webSocket, err);
        });
    }

    /**
     * @description - Get web-socket server.
     * @memberof ServerWrapper
     */
    get webSocketServer() {
        return this._webSocketServer;
    }

    /**
     * @description - Set rpc message queue.
     * @param {object} messageBroker - message broker.
     * @memberof ServerWrapper
     */
    set messageBroker(messageBroker) {
        this._rpc.messageBroker = messageBroker;
    }

    /**
     * @description - Get rpc message broker.
     * @memberof ServerWrapper
     */
    get messageBroker() {
        return this._rpc.messageBroker;
    }

    /**
     * @description - Set store.
     * @param {object} store - store.
     * @memberof ServerWrapper
     */
    set store(store) {
        this._store.store = store;
    }

    /**
     * @description - get store.
     * @memberof ServerWrapper
     */
    get store() {
        return this._store.store;
    }

    /**
     * @description This is the method acts as the remote procedure which is called at any remote client call.
     * @param {Map<string>} webSocketMap - websocket map
     * @param {object} payload - payload
     * @param {*} callback - The callback that handles the response.
     * @memberof ServerWrapper
     */
    handleRemoteProcess(webSocketMap, payload, callback) {

        let _this = this;
        const data = JSON.parse(payload);

        switch (data.method) {
            case constants.METHOD_SEND:
                _this._handleSendingProcess(webSocketMap, payload, function (err) {
                    if (err) {
                        return callback(err);
                    }
                    return callback(null);
                });
                break;
            case constants.METHOD_CLOSE:
                _this._handleSocketCloseProcess(webSocketMap, payload, function (err) {
                    if (err) {
                        return callback(err);
                    }
                    return callback(null);
                });
                break;
            default:
                break;
        }
    }

    /**
     * @description - Handles sending process.
     * @param {Map<string>} webSocketMap - websocket map
     * @param {object} payload - payload
     * @param {*} callback - The callback that handles the response.
     * @memberof ServerWrapper
     */
    _handleSendingProcess(webSocketMap, payload, callback) {
        const data = JSON.parse(payload);
        const webSocket = webSocketMap[data.key];

        console.log(`[Websocket-send] web-socket key: ${data.key}`); // eslint-disable-line no-console
        console.log(`[Websocket-send] web-socket map: ${Object.keys(webSocketMap)}`); // eslint-disable-line no-console
        console.log(`[Websocket-send] web-socket obj: ${webSocket}`); // eslint-disable-line no-console

        if (webSocket) {
            console.log(`[Websocket-send] sending ${JSON.stringify(data.message)}`); // eslint-disable-line no-console
            webSocket.send(data.message, (err) => {
                if (err) {
                    console.log(`[Websocket-send] Connection Error ${err}`); // eslint-disable-line no-console
                    return callback(err);
                }
                return callback(null);
            });
        }
    }

    /**
     * @description - Handles web-socket close process.
     * @param {Map<string>} webSocketMap - websocket map
     * @param {object} payload - payload
     * @param {*} callback - The callback that handles the response.
     * @memberof ServerWrapper
     */
    _handleSocketCloseProcess(webSocketMap, payload) {

        const data = JSON.parse(payload);
        const webSocket = webSocketMap[data.key];

        if (webSocket) {
            console.log(`[Websocket-close] closing socket with key: ${data.key}`); // eslint-disable-line no-console
            webSocket.close();
        }
    }

    /**
     * @description Store websocket in the socket map.
     * @param {string} key - key
     * @param {object} webSocket - webSocket object
     * @param {object} metaDataObj - metadata to be stored within the websocket object itself (e.g identity, createdTime etc).
     * @memberof ServerWrapper
     */
    storeWebSocket(key, webSocket, metaDataObj) {
        const _this = this;

        for (let key in metaDataObj) {
            if (metaDataObj.hasOwnProperty(key)) {
                webSocket[key] = metaDataObj[key];
            }
        }

        _this._store.set(key, constants.EXISTS);
        _this._webSocketMap[key] = webSocket;
        console.log(`[Websocket-send] web-socket map after storing: ${Object.keys(_this.getWebSocketMap())}`); // eslint-disable-line no-console
    }

    /**
     * @description - remove websocket (removing ws is essential for scaling bahavior)
     * @param {object} key - key in the socket map.
     * @memberof ServerWrapper
     */
    removeWebSocket(key) {
        const _this = this;
        _this._store.set(key, constants.NOT_EXISTS);
        delete _this._webSocketMap[key];
    }

    /**
    * @description - get web-socket map.
    * @returns {Map<string>} - WebSocket Map
    * @memberof ServerWrapper
    */
    getWebSocketMap() {
        const _this = this;
        return _this._webSocketMap;
    }

    /**
     * @description - get a web-socket by key.
     * @param {string} - key
     * @returns {object} - websocket
     * @memberof ServerWrapper
     */
    getWebSocket(key) {
        const _this = this;
        return _this._webSocketMap[key];
    }

    /**
    * @description - Check whether the given websocket exists in other peer websocket maps.
    * @param {string} key - key
    * @param {boolean} callback - true/false
    * @memberof ServerWrapper
    */
    isWebSocketGloballyExist(key, callback) {
        const _this = this;
        _this._store.get(key, function (err, value) {
            if (err) {
                return callback(true);
            }
            if (value === constants.EXISTS) {
                return callback(null, true);
            }
            return callback(null, false);
        });
    }

    /**
     * @description - Send message through a given socket
     * @param {string} key - key in the socket map.
     * @param {string} message - message as a string.
     * @param {*} callback - The callback that handles the response.
     * @memberof ServerWrapper
     */
    send(key, message, callback) {
        this._rpc.remoteCall(JSON.stringify({ method: constants.METHOD_SEND, key: key, message: message }), function (result) {
            if (result === constants.REMOTE_FUNC_SUCCESS_RESPONSE) {
                return callback(null);
            }
            return callback(true);
        });
    }

    /**
     * @description - Close web-socket
     * @param {string} key - key in the socket map.
     * @param {*} callback - The callback that handles the response.
     * @memberof ServerWrapper
     */
    close(key, callback) {
        this._rpc.remoteCall(JSON.stringify({ method: constants.METHOD_CLOSE, key: key, message: '' }), function (result) {
            if (result === constants.REMOTE_FUNC_SUCCESS_RESPONSE) {
                return callback(null);
            }
            return callback(true);
        });
    }
}
