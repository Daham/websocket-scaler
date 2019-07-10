/* eslint-disable no-console */

/**
 * This module manages all the tasks related to the identity of the global socket mapping or any given WS connection
 */
class SocketIdentity {

    /**
     * Constructor
     */
    constructor() {
        this.socketMap = {};
        this.server = null;

        // Periodical-Temporary critical information to monitor websocket connections count
        /*eslint-disable*/ // Magic Number -> 5 minutes
        setInterval(() => {
            console.log("CRITICAL INFO *****> Socketmap size: %s", Object.keys(this.socketMap).length);
        }, 5 * 60 * 1000);
        /*eslint-enable*/
    }


    /**
     * Initialize by assigning a web-socket server.
     * @param {*} server
     * @memberof SocketIdentity
     */
    init(server) {
        this.server = server;
    }

    /**
     * Save identity value to socket and add entry to the socket map
     * @param {Object} server - WS server
     * @param {Object} socket - WS connection
     * @param {string} merchantId <-
     * @param {string} registerNo <-
     * @param {string} macAddress <-
     */
    saveIdentity(socket, merchantId, registerNo, macAddress) {
        if (!socket.identity) {
            socket.identity = { merchantId, registerNo, macAddress };
            this.server.storeWebSocket(this.getSocketKey(merchantId, registerNo, macAddress), socket);

            // Try to save preOnboard device once when a socket is connected
            if (!merchantId && !registerNo && macAddress) {
                console.log(`Save not onboarded device merchantId: ${merchantId} registerNo: ${registerNo} macAddress: ${macAddress} `);
            }
        } else if (!this.server.getWebSocket(this.getSocketKey(merchantId, registerNo, macAddress))) {
            this.server.storeWebSocket(this.getSocketKey(merchantId, registerNo, macAddress), socket);
        }

        console.log(this.server.getWebSocketMap());
    }

    /**
     * Generate a unique key to the device using merchantId and RegisterNo or macAddress
     * @param {string} merchantId <-
     * @param {string} registerNo <-
     * @param {string} [macAddress] <-
     * @return {string} - unique Id
     */
    getSocketKey(merchantId, registerNo, macAddress) {
        if (merchantId && registerNo) {
            registerNo = typeof registerNo === 'number' ? registerNo : registerNo.trim();
            return merchantId.trim() + registerNo;
        }
        return macAddress || '*NULL*';
    }

    /**
     * Get all socket keys in map
     * @return {Array} <-
     */
    getAllSocketKeys() {
        return Object.keys(this.server.getWebSocketMap());
    }

    /**
     * Return a WS connection if a matching socket is available in socketMap
     *
     * @param {string} merchantId <-
     * @param {string} registerNo <-
     * @param {string} macAddress <-
     *
     * @returns {*} matching WS connection or undefined
     */
    getSocket(merchantId, registerNo, macAddress) {
        return this.server.getWebSocket(this.getSocketKey(merchantId, registerNo, macAddress));
    }

    /**
     * Get the identity of a given socket(merchantId, registerNo and macAddress)
     * @param {object} socket - WS connection
     * @return {{merchantId: string, registerNo: string, macAddress: string}|*|{}} <-
     */
    getIdentity(socket) {
        return socket.identity || {};
    }

    /**
     * Remove socket entry from the socket map
     * @param {Object} socket - socket connection
     */
    removeSocket(socket) {
        let { merchantId, registerNo, macAddress } = this.getIdentity(socket);
        let key = this.getSocketKey(merchantId, registerNo, macAddress);
        this.server.removeWebSocket(key);
    }

    /**
     * Close the corresponding socket, given the identity of the device. If the socket returned from the map
     * is undefined, corresponding entry, if exists, will be deleted from the socketMap
     *
     * @param {string} merchantId <-
     * @param {string} registerNo <-
     * @param {string} macAddress <-
     * @returns {boolean} socket close status
     */
    closeSocket(merchantId, registerNo, macAddress) {
        let socket = this.getSocket(merchantId, registerNo, macAddress);
        if (socket) {
            this.server(this.getSocketKey(merchantId, registerNo, macAddress));
            return true;
        }
        return false;
    }

}

export default new SocketIdentity();

/* eslint-enable no-console */
