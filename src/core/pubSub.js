import * as events from 'events';

/**
 * @description This is the strategy manager for different publisher/subscriber strategies.
 * @class PubSub
 */
export default class PubSub extends events.EventEmitter {

    /**
     *Creates an instance of PubSub.
     * @param {object} { host, port } - parameters for initiating the message queue.
     * @memberof PubSub
     */
    constructor({ host, port }) {
        super();
        this._host = host;
        this._port = port;
        this._messageQueue = null;
    }

    /**
     * @description - set the required message queue for pub/sub.
     * @param {object} messageQueue - message queue object.
     * @memberof PubSub
     */
    set messageQueue(messageQueue) {
        let _this = this;
        _this._messageQueue = messageQueue;
        _this._messageQueue.init({ host: _this._host, port: _this._port });

        _this._messageQueue.on('message', (channel, message) => {
            _this.emit('message', channel, message);
        });
    }

    /**
     * @description - get the message queue which is being used.
     * @memberof PubSub
     */
    get messageQueue() {
        return this._messageQueue;
    }

    /**
     * @description - publish a given payload to a specific channel.
     * @param {string} channel - the channel to be published.
     * @param {string} payload - payload to be sent.
     * @memberof PubSub
     */
    publish(channel, payload) {
        this._messageQueue.publish(channel, payload);
    }

    /**
     * @description - subscribe to a specific channel.
     * @param {*} channel - the channel to be subscribed.
     * @memberof PubSub
     */
    subscribe(channel) {
        let _this = this;

        _this._messageQueue.subscribe(channel);
    }
}


