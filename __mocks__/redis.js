import * as events from 'events';

jest.genMockFromModule('redis');

export const mockPublish = jest.fn();
export const mockSubscribe = jest.fn();
export const mockCreateClient = jest.fn();

/**
 * @description
 * @export
 * @class ServerWrapper
 * @extends {events.EventEmitter}
 */
export default class RedisClient extends events.EventEmitter {

    /**
     *Creates an instance of RedisClient.
     * @memberof RedisClient
     */
    constructor() {
        super();
    }

    /**
     * @description
     * @memberof RedisClient
     */
    publish(channel, payload) {
        mockPublish(channel, payload);
    }

    /**
     * @description
     * @memberof RedisClient
     */
    subscribe(channel) {
        mockSubscribe(channel);
    }

    /**
     * @description
     * @param {*} channel
     * @param {*} message
     * @memberof RedisClient
     */
    emitMessage(channel, message) {
        this.emit('message', channel, message);
    }
}

/**
 * @description
 * @param {*} directoryPath
 * @returns
 */
export function createClient(host, port) {
    mockCreateClient(host, port);
    return new RedisClient();
}


