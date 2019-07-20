import * as events from 'events';

/**
 * @description This is the strategy manager for different rpc strategies.
 * @class Rpc
 */
export default class Rpc extends events.EventEmitter {

    /**
     *Creates an instance of Rpc.
     * @param {*} { username, password, host }
     * @param {*} serverFunc - remote procedure.
     * @memberof Rpc
     */
    constructor({ username, password, host }, serverFunc) {
        super();
        this._username = username;
        this._password = password;
        this._host = host;
        this._messageBroker = null;
        this._serverFunc = serverFunc;
    }

    /**
     * @description - Set the required message queue for rpc.
     * @param {object} messageBroker - message queue object.
     * @memberof PubSub
     */
    set messageBroker(messageBroker) {
        let _this = this;

        _this._messageBroker = messageBroker;
        _this._messageBroker.initServerProcess({ username: _this._username, password: _this._password, host: _this._host }, _this._serverFunc);
    }

    /**
     * @description Invoke the remote call.
     * @param {*} content - content
     * @param {*} callback - callback
     * @memberof Rpc
     */
    remoteCall(content, callback) {
        let _this = this;
        _this._messageBroker.remoteCall({ username: _this._username, password: _this._password, host: _this._host }, content, function (result) {
            return callback(result);
        });
    }

}

