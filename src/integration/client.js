const WebSocket = require('ws');
const fs = require('fs');

const COMMON_LOG_FILE = '/Users/dahamp/Downloads/socket-prac.log';


/**
 * @description
 * @export
 * @class SocketClientWrapper
 */
export default class SocketClientWrapper {

    /**
     *Creates an instance of SocketClientWrapper.
     * @param {*} port
     * @memberof SocketClientWrapper
     */
    constructor(port) {
        this.port = port;
        this.ws = new WebSocket(`ws://localhost:${port}`);
    }

    /**
     * @description
     * @param {*} data
     * @memberof SocketClientWrapper
     */
    _log(data) {
        fs.appendFileSync(COMMON_LOG_FILE, `[Socket-Client]-${this.port}-MESSAGE-${data}\n`);
    }

    /**
     * @description
     * @memberof SocketClientWrapper
     */
    initNormalFucnctionality() {
        let _this = this;

        _this.ws.on('open', function open() {
            _this._log('socket OPENED');

            _this._log('trying to JOIN');
            _this.ws.send(JSON.stringify({ name: "JOIN", message: `JOINING socket client: ${_this.port}`, port: _this.port }));

            setInterval(function () {
                _this._log('sending usual message');
                _this.ws.send(JSON.stringify({ name: "NETWORK_ONDEMAND", message: `ONDEMAND RESULT socket client: ${_this.port}` }));
            }, 3000);// eslint-disable-line no-magic-numbers
        });

        _this.ws.on('message', function message(message) {
            _this._log(`get message from Server MESSAGE:${message}`);
        });

        _this.ws.on('close', function close() {
            _this._log(`socket CLOSED`);
        });
    }

    /**
     * @description
     * @memberof SocketClientWrapper
     */
    initGlobalMessageSendingFunctionality() {
        let _this = this;

        _this.ws.on('open', function open() {
            _this._log('socket OPENED');

            _this._log('trying to JOIN');
            _this.ws.send(JSON.stringify({ name: "JOIN", message: `JOINING socket client: ${_this.port}`, port: _this.port }));

            // setInterval(function () {
            //     _this._log('sending usual message');
            //     _this.ws.send(JSON.stringify({ name: "NETWORK_ONDEMAND", message: `ONDEMAND RESULT socket client: ${_this.port}` }));
            // }, 3000);// eslint-disable-line no-magic-numbers

            // setTimeout(function () {
            //     _this.ws.send(JSON.stringify({ name: "TUNNEL", message: `TUNNEL OPENED BY socket client: ${_this.port}` }));
            // }, 10000);// eslint-disable-line no-magic-numbers

        });

        _this.ws.on('message', function message(message) {
            _this._log(`get message from Server MESSAGE:${message}`);
        });

        _this.ws.on('close', function close() {
            _this._log(`socket CLOSED`);
        });
    }

}


//new SocketClientWrapper(8080).initNormalFucnctionality();// eslint-disable-line no-magic-numbers
//new SocketClientWrapper(8081).initNormalFucnctionality();// eslint-disable-line no-magic-numbers
new SocketClientWrapper(process.env.PORT).initGlobalMessageSendingFunctionality();// eslint-disable-line no-magic-numbers


