import Server from '../src/index';
import { mockPublish, mockSubscribe, mockCreateClient } from 'redis';
import * as constants from './constants';

jest.mock('redis');

describe('Server with Redis Message Queue', () => {

    beforeEach(() => {

    });

    test('calls the send method properly', () => {
        const payload = { key: 'beautybeagle-4', message: 'mock message' };
        const server = new Server({
            serverType: 'ws',
            queueType: 'redis',
            serverOptions: {
                port: '8080'
            },
            queueOptions: {
                host: '127.0.0.1',
                port: 6379
            }
        });

        server.send('beautybeagle-4', 'mock message');

        expect(mockPublish).toHaveBeenCalledWith(constants.SEND_CHANNEL, JSON.stringify(payload));
    });

    test('calls the close method properly', () => {
        const payload = { key: 'beautybeagle-4' };
        const server = new Server({
            serverType: 'ws',
            queueType: 'redis',
            serverOptions: {
                port: '8080'
            },
            queueOptions: {
                host: '127.0.0.1',
                port: 6379
            }
        });

        server.close('beautybeagle-4');

        expect(mockPublish).toHaveBeenCalledWith(constants.SOCKET_CLOSE_CHANNEL, JSON.stringify(payload));
    });

    test('subscribe to global message process handles properly with redis queue subscription', () => {
        const payload = { key: 'beautybeagle-4', message: 'mock message' };
        const server = new Server({
            serverType: 'ws',
            queueType: 'redis',
            serverOptions: {
                port: '8080'
            },
            queueOptions: {
                host: '127.0.0.1',
                port: 6379
            }
        });

        server.on('message', (message) => {
            expect(message).toMatch(payload.message);

        });

        server._server._pubSub._messageQueue._subscriber.emitMessage(constants.GLOBAL_MESSAGE_SUBSCRIBE('TUNNEL'), JSON.stringify(payload)); // eslint-disable-line new-cap
    });

});
