/**
 * Created by Daham Pathiraja on 4/28/16.
 */
/* eslint-disable no-console */

import Server from '../../../index';
import socketIdController from './socketIdController';
import * as constants from './constants';
import agentWebSocketModel from './agentWsController';

/**
 * WS based WebSocket service for Pulse Agents
 */
export default class AgentWsServer {

    /**
     *Creates an instance of AgentWsServer.
     * @memberof AgentWsServer
     */
    constructor() {
        this.wsServer = null;
    }

    /**
 * Create WS server and listen to events
 * @param {Object} server - NodeJs HTTPS server
 */
    init() {
        const _this = this;


        _this.wsServer = new Server({
            serverType: 'ws',
            queueType: 'redis',
            serverOptions: { port: process.env.PORT },
            messageBrokerOptions: {
                username: '',
                password: '',
                host: ''
            }
        });

        _this.wsServer.subscribeToGlobalMessage("name", constants.TUNNEL_OPEN_SUCCESS);

        socketIdController.init(_this.wsServer);

        console.log("Agent WS Server started");

        _this.wsServer.on('connection', () => {

        });

        _this.wsServer.on('message', (payload, socket) => {
            if (socket) {
                console.log(`------------ON MESSAGE----------------payload: ${JSON.stringify(payload)} socket-identity: ${JSON.stringify(socket.identity)}`);
            } else {
                console.log(`------------ON MESSAGE----------------payload: ${JSON.stringify(payload)}`);
            }
            agentWebSocketModel.processMessage(_this.wsServer, socket, payload);
        });

        _this.wsServer.on('close', (socket) => {
            console.log(`------------ON CLOSE----------------socket-identity: ${JSON.stringify(socket.identity)}`);
            agentWebSocketModel.handleSocketDisconnection(_this.wsServer, socket, 'closed');
        });

        _this.wsServer.on('terminate', (socket) => {
            console.log(`------------ON TERMINATE----------------socket-identity: ${JSON.stringify(socket.identity)}`);
            agentWebSocketModel.handleSocketDisconnection(_this.wsServer, socket, 'terminated');
        });

        _this.wsServer.on('socket-error', (socket, err) => {
            console.log(`------------ON SOCKET ERROR----------------socket-identity: ${JSON.stringify(socket.identity)} Error: ${err}`);
            agentWebSocketModel.handleSocketDisconnection(socket, 'closed on error');
        });
    }

    /**
     * Global method to send WS message to both onboard and pre-onboard devices
     * @param {string} merchantId <-
     * @param {string} registerNo <-
     * @param {string|null} macAddress <-
     * @param {*} data - the data sent here will be stringified before being sent
     * @param {function} callback <-
     * @return {*} - callback
     */
    sendMessageGlobal(merchantId, registerNo, macAddress, data, callback) {
        let socket = socketIdController.getSocket(merchantId, registerNo, macAddress);

        if (!socket) {
            let err = new Error("Device is offline");
            console.log(err);
            return callback(err);
        }

        this.logger.info(`Sending Message to ${merchantId} | ${registerNo} | ${macAddress}`);

        socket.send(JSON.stringify(data), (err) => {
            if (err) {
                return callback(err);
            }
            return callback(null);
        });
    }

    /**
     * Send message interface explicitly for onboard devices
     * Here we will simply call the sendMessageGlobal with macAddress set as null
     *
     * @param {string} merchantId <-
     * @param {string} registerNo <-
     * @param {*} data - the data sent here will be stringified before being sent
     * @param {function} callback <-
     * @return {*} - callback
     */
    sendMessage(merchantId, registerNo, data, callback) {
        return this.sendMessageGlobal(merchantId, registerNo, null, data, callback);
    }

    /**
     * Proxy socket close call to socketId controller
     * @param {string} args <-
     */
    closeSocket(...args) {
        socketIdController.closeSocket(...args);
    }
}

const agentWsServer = new AgentWsServer();
agentWsServer.init();
