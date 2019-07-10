/* eslint-disable no-console */

const WebSocket = require('ws');

/**
 * @description
 * @export
 * @class MockAgent
 */
export default class MockAgent {

    /**
     *Creates an instance of MockAgent.
     * @param {*} port
     * @memberof MockAgent
     */
    constructor(port) {
        this.port = port;
        this.ws = new WebSocket(`ws://localhost:${port}`);

        this.ws.on('open', function open() {
            console.log('socket OPENED');
        });

        this.ws.on('message', function message(message) {
            console.log(`get message from Server MESSAGE:${message}`);
        });

        this.ws.on('close', function close() {
            console.log(`socket CLOSED`);
        });
    }

    /**
     * @description Send join message
     * @memberof MockAgent
     */
    sendJoinMessage() {
        let _this = this;

        const data = {
            MERCHANT_ID: "c0020-10265932",
            REGISTER_NO: "5",
            MERCHANT_NAME: "Beauty Beagle",
            MASTER_DETAILS: {},
            MAC: "00:60:ef:26:52:6b"
        };

        _this.ws.send(JSON.stringify({ name: "JOIN", data: data }));
    }

    /**
     * @description Send heart beat message
     * @memberof MockAgent
     */
    sendHeartBeatMessage() {
        let _this = this;

        const data = {
            BLACK_SCREEN: "",
            BUFFERED_MEMORY: 50,
            CACHED_MEMORY: 1283,
            COUCHDB_COMPACTIONS: false,
            CPU_COUNT: 4,
            CPU_LOAD: {
                load10: "0.06",
                load15: "0.22",
                load5: "0.00"
            },
            CPU_TYPE: "64bit",
            CPU_USAGE: 5.5,
            DEVICE_TYPE: "V3",
            DISK_USAGE: 12.72,
            ERROR_SELF_REPORT: {
                DATE_TIME: null,
                DESCRIPTION: [],
                VALUE: null
            },
            FREE_MEMORY: 1323,
            MAC: "00:60:ef:26:52:6b",
            MASTER_DETAILS: {
                "is.master": "false",
                "is.master.online": "",
                "is.static.setup": "",
                "master.device.ip": "10.10.10.121"
            },
            MEMORY_USAGE: 30.58,
            MERCHANT_ID: "c0020-10265932",
            MERCHANT_NAME: "Pulse Tester",
            MOXY_IS_NOT_RESPONDING: "moxy is running",
            MOXY_TERMINATED_PROGRAMMATICALLY: false,
            MOXY_TERMINATED_UNEXPECTEDLY: false,
            REGISTER_NO: "5",
            RX: "155.1 MB",
            STORAGE: [
                {
                    "avail": "49974",
                    "mount": "/",
                    "name": "/dev/sda1",
                    "total": 57255,
                    "used": "7281"
                }
            ],
            TOTAL_MEMORY: 3826,
            TUNNEL_PORT: "",
            TUNNEL_TIME: null,
            TX: "12.9 MB",
            UPTIME: "2093.88"
        };

        _this.ws.send(JSON.stringify({ name: "HEART_BEAT", data: data }));

    }

    /**
    * @description Send tunnel open success message
    * @memberof MockAgent
    */
    sendTunnelOpenSuccessMessage() {
        let _this = this;

        const data = {
            MERCHANT_ID: "c0020-10265932",
            REGISTER_NO: "5",
            TUNNEL_PORT: '34567',
            TUNNEL_TIME: "123",
            MAC: "00:60:ef:26:52:6b"
        };

        _this.ws.send(JSON.stringify({ name: "TUNNEL_OPEN_SUCCESS", data: data }));

    }


    /**
     * @description Send tunnel open unsuccess message
     * @memberof MockAgent
     */
    sendTunnelOpenUnsuccessMessage() {
        let _this = this;

        const data = {
            REGISTER_NO: "5",
            TUNNEL_PORT: '34567',
            TUNNEL_TIME: "123"
        };

        _this.ws.send(JSON.stringify({ name: "TUNNEL_OPEN_SUCCESS", data: data }));

    }


    /**
     * @description Close Socket
     * @memberof MockAgent
     */
    closeSocket() {
        let _this = this;

        _this.ws.close();
    }

}

/* eslint-enable no-console */
