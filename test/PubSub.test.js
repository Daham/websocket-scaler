import PubSub from '../src/core/pubSub';
import redisPubSub from '../src/services/pubSub/redisPubSub';
import { mockPublish, mockSubscribe, mockCreateClient } from 'redis';

jest.mock('redis');

describe('PubSub Strategy Manager with Redis Message Queue', () => {

    beforeEach(() => {

    });

    test('calls the messageQueue method in PubSub Strategy Manager properly', () => {
        const pubSub = new PubSub({ host: '127.0.0.1', port: '6379' });
        pubSub.messageQueue = redisPubSub;

        expect(mockCreateClient).toHaveBeenCalled();
    });

    test('calls the publish method in PubSub Strategy Manager properly', () => {
        const pubSub = new PubSub({ host: '127.0.0.1', port: '6379' });
        pubSub.messageQueue = redisPubSub;
        pubSub.publish('SOME_CHANNEL', 'SOME_PAYLOAD');

        expect(mockPublish).toHaveBeenCalledTimes(1);
        expect(mockPublish).toHaveBeenCalledWith('SOME_CHANNEL', 'SOME_PAYLOAD');
    });

    test('calls the subscribe method in PubSub Strategy Manager properly', () => {
        const pubSub = new PubSub({ host: '127.0.0.1', port: '6379' });
        pubSub.messageQueue = redisPubSub;
        pubSub.subscribe('SOME_CHANNEL');

        expect(mockSubscribe).toHaveBeenCalledTimes(1);
        expect(mockSubscribe).toHaveBeenCalledWith('SOME_CHANNEL');
    });
});
