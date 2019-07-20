
/**
 * @description This is the strategy manager for different store strategies.
 * @class Store
 */
export default class Store {

    /**
     *Creates an instance of Rpc.
     * @param {*} { host, port } - parameters for initiating the store.
     * @memberof Store
     */
    constructor({ host, port }) {
        //store configurations
        this._host = host;
        this._port = port;

        //variable to keep store concerete object.
        this._store = null;
    }

    /**
     * @description - set the required store for store.
     * @param {object} store - store object.
     * @memberof PubSub
     */
    set store(store) {
        let _this = this;

        _this._store = store;
        _this._store.init({ host: _this._host, port: _this._port });
    }

    /**
     * @description store key/val
     * @param {string} key - key
     * @param {value} value - value
     * @memberof Store
     */
    set(key, value) {
        this._store.set(key, value);
    }

    /**
     * @description get key
     * @param {string} key - key
     * @param {*} callback - The callback that handles the response.
     * @memberof Store
     */
    get(key, callback) {
        const _this = this;

        _this._store.get(key, function (err, reply) {
            if (err) {
                return callback(true);
            }
            return callback(null, reply);
        });
    }

}

