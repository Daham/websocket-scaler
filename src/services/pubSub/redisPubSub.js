import * as events from 'events';
import { createClient } from 'redis';

/**
 * @description - publisher/subscriber module using Redis publisher and Redis subscriber.
 * @class RedisPubSub
 */
class RedisPubSub extends events.EventEmitter {

    /**
     *Creates an instance of RedisPubSub.
     * @memberof RedisPubSub
     */
    constructor() {
        super();
        this._publisher = null;
        this._subscriber = null;
    }

    /**
     * @description - initializing the Redis pub/sub.
     * @param {object} { host, port } - parameters for initiating Redis clients.
     * @memberof RedisPubSub
     */
    init({ host, port }) {
        const _this = this;
        _this._subscriber = createClient({ host, port });
        _this._publisher = createClient({ host, port });

        _this._subscriber.on('message', (channel, message) => {
            _this.emit('message', channel, message);
        });
    }

    /**
     * @description - creates Redis client by introducing retrying capability etc.
     * @param {object} { host, port } - parameters for initiating Redis clients.
     * @returns {object} Redis client.
     * @memberof RedisPubSub
     */
    createRedisClient({ host, port }) {
        const _this = this;
        return createClient({
            ...{ host, port },
            retry_strategy: _this._retry.bind(_this)
        });
    }

    /**
     * @description
     * @param {object} options - options
     * @returns - config object sent from npm redis
     * @memberof RedisPubSub 
     */
    _retry(options) {
        if (options.error && options.error.code === 'ECONNREFUSED')
            return new Error('The server refused the connection');

        if (options.attempt > 10) // eslint-disable-line no-magic-numbers, :- Retry attempt count threshold
            return undefined; // End reconnecting with built in error

        // eslint-disable-next-line no-console
        console.log(`Failed to connect to redis server. Retrying attempt: ${options.attempt}`);
        return Math.min(options.attempt * 500, 3000); // eslint-disable-line no-magic-numbers, :- Exponential like retry interval
    }

    /**
     * @description - publishes to a given channel.
     * @param {string} channel
     * @param {string} payload
     * @memberof RedisPublisher
     */
    publish(channel, payload) {
        const _this = this;

        _this._publisher.publish(channel, payload);
    }

    /**
    * @description - subscribes to a given channel
    * @param {string} channel
    * @memberof RedisSubscriber
    */
    subscribe(channel) {
        const _this = this;
        _this._subscriber.subscribe(channel);
    }
}

export default new RedisPubSub();

