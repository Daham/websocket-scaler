import redisPubSub from '../src/services/pubSub/redisPubSub';
import { mockPublish, mockSubscribe, mockCreateClient } from 'redis';

jest.mock('redis');

describe('RedisPubSub module', () => {

    beforeEach(() => {

    });

    test('calls the messageQueue method in RedisPubSub properly', () => {
        redisPubSub.init({ host: '127.0.0.1', port: 6379 });

        expect(mockCreateClient).toHaveBeenCalled();
    });

    test('calls the publish method in RedisPubSub properly', () => {
        redisPubSub.publish('SOME_CHANNEL', 'SOME_PAYLOAD');

        expect(mockPublish).toHaveBeenCalledTimes(1);
        expect(mockPublish).toHaveBeenCalledWith('SOME_CHANNEL', 'SOME_PAYLOAD');
    });

    test('calls the subscribe method in RedisPubSub properly', () => {
        redisPubSub.subscribe('SOME_CHANNEL');

        expect(mockSubscribe).toHaveBeenCalledTimes(1);
        expect(mockSubscribe).toHaveBeenCalledWith('SOME_CHANNEL');
    });
});
