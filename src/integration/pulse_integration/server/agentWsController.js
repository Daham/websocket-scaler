/**
 * Created by Daham Pathiraja on 4/28/16.
 */
/* eslint-disable no-console */
// Core modules

import socketIdController from './socketIdController';

// Helpers
import * as constants from './constants';

/**
 * Acts as the facade for routing the socket messages to the corresponding handlers
 */
class AgentWsController {

    /**
     * Handle tunnel open action
     * @param {Object} socket - WS connection
     * @param {Object} data - tunnel open data
     */
    handleTunnelOpenAction(server, socket, { MERCHANT_ID, REGISTER_NO, MAC, TUNNEL_PORT }) {
        if (!(MERCHANT_ID && REGISTER_NO) && !MAC) {
            console.log("Device cannot be identified");// eslint-disable-line no-console
            if (socket) {
                socket.close();
            }
            return;
        }

        console.log(`Update tunnel status merchantId: ${MERCHANT_ID} registerNo: ${REGISTER_NO} macAddress: ${MAC} tunnelId: ${TUNNEL_PORT}`);
    }

    /**
     * Handle Agent heartbeat
     * @param {Object} socket - WS connection
     * @param {Object} data - heartbeat data
     */
    handleAgentHeartBeat(socket, data) {
        const merchantId = data[constants.MERCHANT_ID],
            registerNo = data[constants.REGISTER_NO],
            macAddress = data[constants.MAC],
            tunnelId = data[constants.TUNNEL_PORT];

        if (!(merchantId && registerNo) && !macAddress) {
            let err = new Error("Device cannot be identified");
            console.log(err);
            socket.close();
            return;
        }

        // Perform tasks as required on heart-beat for both onboard and pre-onboard devices
        //socketIdController.saveIdentity(socket, merchantId, registerNo, macAddress);

        console.log(`Update tunnel status of merchantId: ${merchantId} registerNo: ${registerNo} macAddress: ${macAddress} tunnelId: ${tunnelId}`);

        // Perform these tasks for onboard devices only
        if (merchantId && registerNo) {
            console.log(`Update device health of device: ${merchantId} registerNo: ${registerNo} data:${JSON.stringify(data)}`);
        }
    }

    /**
     * Handle the disconnection event socket of a target socket
     *
     * @param {Object} socket - WS connection
     * @param {string} cause - cause for disconnection for logging the message
     */
    handleSocketDisconnection(socket, cause) {

        const { merchantId, registerNo, macAddress } = socketIdController.getIdentity(socket),
            { pingCounter, healthy } = socket;


        console.log(`Socket to: ${merchantId}|${registerNo}|${macAddress} ${cause} status: ${healthy}|${pingCounter}`);
    }

    /**
     * Handle Join Tag
     * @param {Object} socket - WS connection
     * @param {Object} data - Join data
     */
    handleJoinTag(server, socket, data) {
        const merchantId = data[constants.MERCHANT_ID],
            registerNo = data[constants.REGISTER_NO],
            macAddress = data[constants.MAC];

        console.log(`merchantId: ${merchantId} registerNo: ${registerNo} macAddress: ${macAddress}`);

        if (!(merchantId && registerNo) && !macAddress) {
            console.error("Device cannot be identified");
            socket.close();
            return;
        }

        const key = socketIdController.getSocketKey(merchantId, registerNo, macAddress);

        if (!server.getWebSocket(key)) {
            server.storeWebSocket(key, socket, { identity: { merchantId, registerNo, macAddress } });

            // Try to save preOnboard device once when a socket is connected
            if (macAddress) {
                console.log(`Save not onboarded device merchantId: ${merchantId} registerNo: ${registerNo} macAddress: ${macAddress} `);
            }
        }
    }

    /**
     * @description
     * @param {*} dataObj
     * @param {*} callback
     * @returns
     * @memberof AgentWsController
     */
    handleHourlyRestartMessage(dataObj, callback) {
        return callback(`Data object ${dataObj}`);
    }

    /**
     * Parse the socket event and forward data to corresponding handler
     * @param {Object} server - websocket server
     * @param {Object} socket - socket which the event was emitted to
     * @param {*} payload - event payload
     */
    processMessage(server, socket, payload) {

        let payloadObj = JSON.parse(payload),
            event = payloadObj.name,
            data = payloadObj.data;

        if (!event || !data) {
            this.logger.error(`Empty data object from web socket message ${JSON.stringify(payload)}`);
            return;
        }

        switch (event) {
            case constants.AGENT_HEARTBEAT_TAG:
                this.handleAgentHeartBeat(socket, data);
                break;
            case constants.JOIN_TAG:
                this.handleJoinTag(server, socket, data);
                break;
            case constants.AGENT_HOURLY_RESTARTS_TAG:
                this.handleHourlyRestartMessage(data, this.logError.bind("handleHourlyRestartMessage"));
                break;
            case constants.TUNNEL_OPEN_SUCCESS:
                this.handleTunnelOpenAction(server, socket, data);
                break;
            default:
                this.logger.warn(`Unknown message sent from Agent. Type: ${JSON.stringify(event)}`);
                break;
        }
    }
}

export default new AgentWsController();

/* eslint-enable no-console */

