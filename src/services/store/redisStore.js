import * as events from 'events';
import { createClient } from 'redis';

/**
 * @description - key/value store using redis.
 * @class RedisStore
 */
class RedisStore extends events.EventEmitter {

    /**
     * Creates an instance of RedisStore.
     * @memberof RedisStore
     */
    constructor() {
        super();
        this._client = null;
    }

    /**
     * @description - Initializing the Redis key/value store.
     * @param {object} { host, port } - parameters for initiating Redis client.
     * @memberof RedisStore
     */
    init({ host, port }) {
        const _this = this;
        _this._client = _this._createRedisClient({ host, port });
    }

    /**
     * @description - Creates Redis client by introducing retrying capability etc.
     * @param {object} { host, port } - parameters for initiating Redis clients.
     * @returns {object} Redis client.
     * @memberof RedisStore
     */
    _createRedisClient({ host, port }) {
        const _this = this;
        return createClient({
            ...{ host, port },
            retry_strategy: _this._retry.bind(_this)
        });
    }

    /**
     * @description - Retry mechanism for redis.
     * @param {object} options - options
     * @returns {number} - config object sent from npm redis
     * @memberof RedisStore 
     */
    _retry(options) {
        if (options.error && options.error.code === 'ECONNREFUSED')
            return new Error('The server refused the connection');

        if (options.attempt > 10) // eslint-disable-line no-magic-numbers, :- Retry attempt count threshold
            return undefined; // End reconnecting with built in error


        console.log(`Failed to connect to redis server. Retrying attempt: ${options.attempt}`);// eslint-disable-line no-console
        return Math.min(options.attempt * 500, 3000); // eslint-disable-line no-magic-numbers, :- Exponential like retry interval
    }

    /**
     * @description Set given key/value
     * @param {*} key - string
     * @param {*} value - string
     * @memberof RedisStore
     */
    set(key, value) {
        const _this = this;

        _this._client.set(key, value);
    }


    /**
     * @description Get given key from store.
     * @param {string} key - key
     * @param {*} callback - The callback that handles the response.
     * @memberof RedisStore
     */
    get(key, callback) {
        const _this = this;

        _this._client.get(key, function (err, reply) {
            if (err || !reply) {
                return callback(true);
            }
            console.log(reply.toString()); // eslint-disable-line no-console
            return callback(null, reply.toString());
        });
    }
}

export default new RedisStore();

