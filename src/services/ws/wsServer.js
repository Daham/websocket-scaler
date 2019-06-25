import { Server } from 'ws';
import * as events from 'events';

import * as constants from '../../utils/constants';

/**
 * @description Concrete class implementation with npm ws web-socket server
 * @export
 * @class WSServer
 */
class WSServer extends events.EventEmitter {

    /**
     *Creates an instance of WSServer.
     * @param {object} pubSub - required publisher subscriber module.
     * @param {Map<string>} webSocketMap - socket map.
     * @param {Array} subscriptionTags - array of subscription tags.
     * @memberof WSServer
     */
    constructor() {
        super();
        this._pubSub = null;
        this._webSocketMap = null;
        this._subscriptionTags = null;
    }

    /**
     * @description - Initilaizing the web-socket and use listners accordingly.
     * @memberof WSServer
     */
    init(pubSub, webSocketMap, subscriptionTags, options) {
        const _this = this;

        _this._pubSub = pubSub;
        _this._webSocketMap = webSocketMap;
        _this._subscriptionTags = subscriptionTags;

        const webSocketServer = new Server({ port: options.port });

        webSocketServer.on('connection', (webSocket) => {

            _this.emit('connection', webSocket);

            webSocket.on('message', (message) => {

                //pubish message with websocket to subscribers of specific message tag.
                _this._subscriptionTags.forEach((element) => {
                    let tag = JSON.parse(message)[element.tagFieldKey];
                    if (element.tag === tag) {
                        _this._pubSub.publish(constants.GLOBAL_MESSAGE_SUBSCRIBE(tag), message); // eslint-disable-line new-cap
                    }
                });

                _this.emit('message', message, webSocket);
            });

            webSocket.on('close', () => {
                _this.emit('close');
            });

            webSocket.on('terminate', () => {
                _this.emit('close');
            });

            webSocket.on("pong", () => {
                _this._refreshSocket(webSocket);
            });

            webSocket.on('error', (err) => {
                _this.emit('socket-error', err);
            });
        });

        webSocketServer.on('error', (err) => {
            _this.emit('server-error', err);
        });

        setInterval(() => {
            _this._sendPings();
            setTimeout(() => _this._closeUnhealthySockets(), constants.PONG_DELAY);
        }, constants.PING_INTERVAL);
    }

    /**
   * Mark webSocket as 'unhealthy' and send a ping.
   * If a pong is received before PONG_DELAY, it will be marked again as 'healthy' by the 'pong' event listener
   * otherwise, the connection will be closed by the removeUnhealthy function
   */
    _sendPings() {
        const _this = this;
        const webSocketKeys = Object.keys(_this._webSocketMap);

        for (let index = webSocketKeys.length - 1; index >= 0; index--) {
            const webSocket = _this._webSocketMap[webSocketKeys[index]];

            webSocket.healthy = false;
            webSocket.ping();

            webSocket.pingCounter = webSocket.pingCounter || 0;
            webSocket.pingCounter++;
        }
    }

    /**
  * Reset the health variables of given socket
  * @param {object} webSocket - WS connection
  */
    _refreshSocket(webSocket) {
        webSocket.healthy = true;  // Mark as healthy
        webSocket.pingCounter = 0; // reset ping counter.
    }

    /**
    * Iterate through all sockets in webSocket map and close the connections of unhealthy connections
    *
    * Note: sendPings and removeUnhealthy are Batch processed to reduce the number of timeouts and intervals required, although it has other side effects such as unfairness
    */
    _closeUnhealthySockets() {
        const _this = this;
        const webSocketKeys = Object.keys(_this._webSocketMap);

        for (let index = webSocketKeys.length - 1; index >= 0; index--) {
            const webSocket = _this._webSocketMap[webSocketKeys[index]];

            if (!webSocket.healthy && webSocket.pingCounter > _this.HEALTHY_PING_COUNT_THRESHOLD) {
                // eslint-disable-next-line no-console
                console.log(`disconnecting webSocket with key ${webSocketKeys[index]} since no pong received`);
                webSocket.close(); // Will trigger the 'close' event of the socket
            }
        }
    }

}

export default new WSServer();
