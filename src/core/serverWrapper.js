import * as events from 'events';

import PubSub from './pubSub';
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
        this._pubSub = new PubSub({ host: queueOptions.host, port: queueOptions.port });
    }

    /**
     * @description - init server wrapper. 
     * @memberof ServerWrapper
     */
    init() {
        let _this = this;
        //initiate global processes.
        _this._initSendingProcess();
        _this._initSocketCloseProcess();

        _this._pubSub.on('message', (channel, payload) => {

            console.log(`Sending Message "${payload}" on channel "${channel}" arrived!`);// eslint-disable-line no-console

            if (channel === constants.SEND_CHANNEL) {
                _this._handleSendingProcess(payload);
            }

            if (channel === constants.SOCKET_CLOSE_CHANNEL) {
                _this._handleSocketCloseProcess(payload);
            }

            if (channel.startsWith(constants.GLOBAL_MESSAGE_SUBSCRIBE(''))) {// eslint-disable-line new-cap
                _this._handleGlobalMessage(channel, payload);
            }

        });
    }

    /**
     * @description - set the required web-socket server for server wrapper.
     * @param {object} webSocketServer - web-socket server.
     * @memberof ServerWrapper
     */
    set webSocketServer(webSocketServer) {
        let _this = this;

        _this._webSocketServer = webSocketServer;
        _this._webSocketServer.init(_this._pubSub, _this._webSocketMap, _this._subscriptionTags, _this._serverOptions);

        _this._webSocketServer.on('connection', (webSocket) => {
            _this.emit('connection', webSocket);
        });

        _this._webSocketServer.on('message', (message, webSocket) => {
            _this.emit('message', message, webSocket);
        });

        _this._webSocketServer.on('close', () => {
            _this.emit('close');
        });

        _this._webSocketServer.on('terminate', () => {
            _this.emit('close');
        });

        _this._webSocketServer.on('error', (err) => {
            _this.emit('socket-error', err);
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
     * @description - set publisher subscriber message queue.
     * @param {object} pubSub - publisher subscriber.
     * @memberof ServerWrapper
     */
    set pubSub(pubSub) {
        this._pubSub.messageQueue = pubSub;
    }

    /**
     * @description - get publisher subscriber message queue.
     * @memberof ServerWrapper
     */
    get pubSub() {
        return this._pubSub.messageQueue;
    }

    /**
     * @description
     * @memberof ServerWrapper
     */
    _initSendingProcess() {
        let _this = this;
        _this._pubSub.subscribe(constants.SEND_CHANNEL);
    }

    /**
     * @description - handle sending process.
     * @param {*} payload
     * @memberof ServerWrapper
     */
    _handleSendingProcess(payload) {
        let _this = this;

        const data = JSON.parse(payload);
        const webSocket = _this._webSocketMap[data.key];

        if (webSocket) {
            webSocket.send(JSON.stringify(data.message), (err) => {
                if (err) {
                    // eslint-disable-next-line no-console
                    console.log(`Connection Error ${err}`);
                }
            });
        }
    }

    /**
     * @description
     * @memberof ServerWrapper
     */
    _initSocketCloseProcess() {
        let _this = this;
        _this._pubSub.subscribe(constants.SOCKET_CLOSE_CHANNEL);
    }

    /**
     * @description - handle web-socket close process.
     * @param {*} payload
     * @memberof ServerWrapper
     */
    _handleSocketCloseProcess(payload) {
        let _this = this;

        const data = JSON.parse(payload);
        const webSocket = _this._webSocketMap[data.key];

        if (webSocket) {
            webSocket.close();
        }
    }


    /**
     * @description - subscribe to a global message which is required to be listened by all web-socket servers.
     * @param {string} tagFieldKey - key of the field where the tag is given.
     * @param {string} tag - tag label.
     * @memberof ServerWrapper
     */
    subscribeToGlobalMessage(tagFieldKey, tag) {
        let _this = this;

        //store all tags with the corresponding fields which should be globally listened.  
        _this._subscriptionTags.push({ tagFieldKey: tagFieldKey, tag: tag });

        _this._pubSub.subscribe(constants.GLOBAL_MESSAGE_SUBSCRIBE(tag));  // eslint-disable-line new-cap
    }

    /**
     * @description - handle messages on global channels
     * @param {*} payload
     * @memberof ServerWrapper
     */
    _handleGlobalMessage(channel, payload) {
        let _this = this;

        const data = JSON.parse(payload);
        console.log(`Global Message Subscription: Message "${payload}" on channel "${channel}" arrived!`);// eslint-disable-line no-console

        _this.emit('message', data.message);
    }

    /**
     * @description
     * @param {string} key - key
     * @param {object} webSocket - webSocket object
     * @memberof ServerWrapper
     */
    storeWebSocket(key, webSocket) {
        const _this = this;
        _this._webSocketMap[key] = webSocket;
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
     * @param {string} key
     * @param {string} message
     * @memberof ServerWrapper
     */
    send(key, message) {
        this._pubSub.publish(constants.SEND_CHANNEL, JSON.stringify({ key: key, message: message }));
    }


    /**
     * @description - 
     * @param {string} key
     * @memberof ServerWrapper
     */
    close(key) {
        this._pubSub.publish(constants.SOCKET_CLOSE_CHANNEL, JSON.stringify({ key: key }));
    }
}
