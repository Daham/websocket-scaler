import ServerWrapper from '../src/core/serverWrapper';
import redisPubSub from '../src/services/pubSub/redisPubSub';
import { mockPublish, mockSubscribe, mockCreateClient } from 'redis';
import * as constants from './constants';

jest.mock('redis');

describe('ServerWrapper with Redis Message Queue', () => {

    beforeEach(() => {

    });

    test('calls the send method properly', () => {
        const payload = { key: 'beautybeagle-4', message: 'mock message' };
        const serverWrapper = new ServerWrapper({
            port: 6379
        }, {
            host: '127.0.0.1',
            port: 6379
        });

        serverWrapper.pubSub = redisPubSub;
        serverWrapper.send('beautybeagle-4', 'mock message');

        expect(mockPublish).toHaveBeenCalledWith(constants.SEND_CHANNEL, JSON.stringify(payload));
    });

    test('calls the close method properly', () => {
        const payload = { key: 'beautybeagle-4' };
        const serverWrapper = new ServerWrapper({
            port: 6379
        }, {
            host: '127.0.0.1',
            port: 6379
        });

        serverWrapper.pubSub = redisPubSub;
        serverWrapper.close('beautybeagle-4');

        expect(mockPublish).toHaveBeenCalledWith(constants.SOCKET_CLOSE_CHANNEL, JSON.stringify(payload));
    });

    test('calls the _initSendingProcess properly', () => {
        const serverWrapper = new ServerWrapper({
            port: 6379
        }, {
            host: '127.0.0.1',
            port: 6379
        });

        serverWrapper.pubSub = redisPubSub;
        serverWrapper._initSendingProcess();

        expect(mockSubscribe).toHaveBeenCalledWith(constants.SEND_CHANNEL);
    });

    test('calls the _initSendingProcess properly', () => {
        const serverWrapper = new ServerWrapper({
            port: 6379
        }, {
            host: '127.0.0.1',
            port: 6370
        });

        serverWrapper.pubSub = redisPubSub;
        serverWrapper._initSocketCloseProcess();

        expect(mockSubscribe).toHaveBeenCalledWith(constants.SOCKET_CLOSE_CHANNEL);
    });

    test('calls the init subscribeToGlobalMessage properly', () => {
        const serverWrapper = new ServerWrapper({
            port: 6379
        }, {
            host: '127.0.0.1',
            port: 6370
        });

        serverWrapper.pubSub = redisPubSub;
        serverWrapper.subscribeToGlobalMessage('name', 'TUNNEL');

        expect(mockSubscribe).toHaveBeenCalledWith(constants.GLOBAL_MESSAGE_SUBSCRIBE('TUNNEL'));// eslint-disable-line new-cap
    });

    test('sending process handles properly with redis queue subscription', () => {
        const payload = { key: 'beautybeagle-4', message: 'mock message' };
        const serverWrapper = new ServerWrapper({
            port: 6379
        }, {
            host: '127.0.0.1',
            port: 6370
        });

        const mockSend = jest.fn().mockImplementation((message) => {
            expect(message).toMatch(payload.message);
        });

        const mockClose = jest.fn().mockImplementation(() => {

        });

        serverWrapper._webSocketMap = { 'beautybeagle-4': { send: mockSend, close: mockClose } };

        serverWrapper.pubSub = redisPubSub;
        serverWrapper.init();

        expect(mockSubscribe).toHaveBeenCalledWith(constants.SEND_CHANNEL);
        expect(mockSubscribe).toHaveBeenCalledWith(constants.SOCKET_CLOSE_CHANNEL);

        serverWrapper._pubSub._messageQueue._subscriber.emitMessage(constants.SEND_CHANNEL, JSON.stringify(payload));

        expect(mockSend.mock.calls.length).toBe(1);
        expect(mockClose.mock.calls.length).toBe(0);
    });

    test('socket closing process handles properly with redis queue subscription', () => {
        const payload = { key: 'beautybeagle-4', message: 'mock message' };
        const serverWrapper = new ServerWrapper({
            port: 6379
        }, {
            host: '127.0.0.1',
            port: 6370
        });

        const mockSend = jest.fn().mockImplementation((message) => {
            expect(message).toMatch(payload.message);
        });

        const mockClose = jest.fn().mockImplementation(() => {

        });

        serverWrapper._webSocketMap = { 'beautybeagle-4': { send: mockSend, close: mockClose } };

        serverWrapper.pubSub = redisPubSub;
        serverWrapper.init();

        expect(mockSubscribe).toHaveBeenCalledWith(constants.SEND_CHANNEL);
        expect(mockSubscribe).toHaveBeenCalledWith(constants.SOCKET_CLOSE_CHANNEL);

        serverWrapper._pubSub._messageQueue._subscriber.emitMessage(constants.SOCKET_CLOSE_CHANNEL, JSON.stringify(payload));

        expect(mockSend.mock.calls.length).toBe(0);
        expect(mockClose.mock.calls.length).toBe(1);
    });

    test('subscribe to global message process handles properly with redis queue subscription', () => {
        const payload = { key: 'beautybeagle-4', message: 'mock message' };
        const serverWrapper = new ServerWrapper({
            port: 6379
        }, {
            host: '127.0.0.1',
            port: 6370
        });

        serverWrapper.pubSub = redisPubSub;
        serverWrapper.init();

        expect(mockSubscribe).toHaveBeenCalledWith(constants.SEND_CHANNEL);
        expect(mockSubscribe).toHaveBeenCalledWith(constants.SOCKET_CLOSE_CHANNEL);

        serverWrapper.on('message', (message) => {
            expect(message).toMatch(payload.message);

        });

        serverWrapper._pubSub._messageQueue._subscriber.emitMessage(constants.GLOBAL_MESSAGE_SUBSCRIBE('TUNNEL'), JSON.stringify(payload)); // eslint-disable-line new-cap
    });

});
