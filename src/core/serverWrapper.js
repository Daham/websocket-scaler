import * as events from 'events';

import Rpc from './rpc';
import * as constants from '../utils/constants';

/**
 * @description
 * @class ServerWrapper
 * @extends {events.EventEmitter}
 */
export default class ServerWrapper extends events.EventEmitter {

    /**
     *Creates an instance of ServerWrapper.
     * @memberof ServerWrapper
     */
    constructor(serverOptions, queueOptions) {
        super();
        this._webSocketMap = {};
        this._subscriptionTags = [];
        this._serverOptions = serverOptions;
        this._rpc = new Rpc({ username: queueOptions.username, password: queueOptions.password, host: queueOptions.host }, this.handleRemoteProcess.bind(this, this._webSocketMap));
    }

    /**
     * @description - set the required web-socket server for server wrapper.
     * @param {object} webSocketServer - web-socket server.
     * @memberof ServerWrapper
     */
    set webSocketServer(webSocketServer) {
        let _this = this;

        _this._webSocketServer = webSocketServer;
        _this._webSocketServer.init(_this._webSocketMap, _this._serverOptions);

        _this._webSocketServer.on('connection', (webSocket) => {
            _this.emit('connection', webSocket);
        });

        _this._webSocketServer.on('message', (message, webSocket) => {
            _this.emit('message', message, webSocket);
        });

        _this._webSocketServer.on('close', (webSocket) => {
            let key = webSocket.key;
            if (_this._webSocketMap[key]) {
                _this.removeWebSocket(key);
            }
            _this.emit('close', webSocket);
        });

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
     * @description - get web-socket server.
     * @memberof ServerWrapper
     */
    get webSocketServer() {
        return this._webSocketServer;
    }

    /**
     * @description - set rpc message queue.
     * @param {object} messageBroker - message broker.
     * @memberof ServerWrapper
     */
    set messageBroker(messageBroker) {
        this._rpc.messageBroker = messageBroker;
    }

    /**
     * @description - get rpc message broker.
     * @memberof ServerWrapper
     */
    get messageBroker() {
        return this._rpc.messageBroker;
    }

    /**
     * @description Handle remote process.
     * @param {*} webSocketMap - websocket map
     * @param {*} payload - payload
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
     * @description - handle sending process.
     * @param {*} webSocketMap - websocket map
     * @param {*} payload - payload
     * @memberof ServerWrapper
     */
    _handleSendingProcess(webSocketMap, payload, callback) {
        const data = JSON.parse(payload);
        const webSocket = webSocketMap[data.key];
        console.log("=========start===========");
        console.log(webSocketMap);
        console.log(data.key);
        console.log(webSocket);
        console.log("==========end==========");
        if (webSocket) {
            console.log(`[Websocket-send] sending ${JSON.stringify(data.message)}`); // eslint-disable-line no-console
            webSocket.send(JSON.stringify(data.message), (err) => {
                if (err) {
                    console.log(`[Websocket-send] Connection Error ${err}`); // eslint-disable-line no-console
                    return callback(err);
                }
                return callback(null);
            });
        }
    }

    /**
     * @description - handle web-socket close process.
     * @param {*} payload
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
     * @description
     * @param {string} key - key
     * @param {object} webSocket - webSocket object
     * @memberof ServerWrapper
     */
    storeWebSocket(key, webSocket, metaDataObj) {
        const _this = this;

        for (let key in metaDataObj) {
            if (metaDataObj.hasOwnProperty(key)) {
                webSocket[key] = metaDataObj[key];
            }
        }

        _this._webSocketMap[key] = webSocket;
    }

    /**
     * @description
     * @param {*} key - key
     * @memberof ServerWrapper
     */
    removeWebSocket(key) {
        const _this = this;
        delete _this._webSocketMap[key];
    }

    /**
     * @description - 
     * @returns {Map<string>} - WebSocket Map
     * @memberof ServerWrapper
     */
    getWebSocketMap() {
        const _this = this;
        return _this._webSocketMap;
    }

    /**
     * @description - 
     * @memberof ServerWrapper
     */
    getWebSocket(key) {
        const _this = this;
        return _this._webSocketMap[key];
    }

    /**
     * @description
     * @param {*} key
     * @param {*} message
     * @param {*} callback
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
     * @description
     * @param {*} key
     * @param {*} callback
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
