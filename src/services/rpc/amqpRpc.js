import * as events from 'events';
import * as amqp from 'amqplib';
import uuid from 'uuid/v4';
import * as constants from '../../utils/constants';

/**
 * @description Rpc module using AMQP.
 * @class AmqpRpc
 */
class AmqpRpc extends events.EventEmitter {

    /**
     *Creates an instance of AmqpRpc.
     * @memberof AmqpRpc
     */
    constructor() {
        super();
    }

    /**
     * @description initialize rpc server process
     * @param {*} queueOptions - queue options
     * @param {*} remoteFunction - remote procedure
     * @memberof AmqpRpc
     */
    initServerProcess(queueOptions, remoteFunction) {
        const amqpCon = amqp.connect(`amqp://${queueOptions.username}:${queueOptions.password}@${queueOptions.host}`);

        console.log(`[Remote-Server] AMQP Connection Object: ${JSON.stringify(amqp)} `); // eslint-disable-line no-console

        amqpCon
            .then(conn => conn.createChannel())
            .then((ch) => {
                const exchange = constants.DIST_FUNC_EXCHANGE;

                ch.assertExchange(exchange, 'fanout', {
                    durable: false
                });

                ch.assertQueue('', {
                    exclusive: true
                })
                    .then((q) => {
                        console.log(" [Remote-Server] Waiting for messages in %s. To exit press CTRL+C", q.queue); // eslint-disable-line no-console

                        ch.bindQueue(q.queue, exchange, '');

                        ch.consume(q.queue, (msg) => {

                            console.log(`[Remote-Server] Message Data to be sent: ${msg.content} `); // eslint-disable-line no-console
                            console.log(`[Remote-Server] Correlation Id: ${msg.properties.correlationId} `); // eslint-disable-line no-console

                            remoteFunction(msg.content.toString('utf8'), function (err) {
                                if (err) {
                                    console.log(`[Remote-Server] Error sending message`); // eslint-disable-line no-console
                                    ch.sendToQueue(
                                        msg.properties.replyTo,
                                        Buffer.from(constants.REMOTE_FUNC_FAIL_RESPONSE),
                                        { correlationId: msg.properties.correlationId });
                                    return;
                                }
                                console.log(`[Remote-Server] Sent message`); // eslint-disable-line no-console
                                ch.sendToQueue(
                                    msg.properties.replyTo,
                                    Buffer.from(constants.REMOTE_FUNC_SUCCESS_RESPONSE),
                                    { correlationId: msg.properties.correlationId });
                                return;
                            });

                            ch.ack(msg);
                        });
                    });
            });
    }

    /**
     * @description Invoke the remote call.
     * @param {*} queueOptions
     * @param {*} content
     * @param {*} callback
     * @memberof AmqpRpc
     */
    remoteCall(queueOptions, content, callback) {
        const amqpCon = amqp.connect(`amqp://${queueOptions.username}:${queueOptions.password}@${queueOptions.host}`);

        console.log(`[RPC-Client] AMQP Connection Object: ${JSON.stringify(amqp)} `); // eslint-disable-line no-console

        amqpCon
            .then(conn => conn.createChannel())
            .then((ch) => {
                const exchange = constants.DIST_FUNC_EXCHANGE;
                const corr = uuid();

                ch.assertQueue('', {
                    exclusive: true,
                    expires: 5000,
                    autodelete: true
                })

                    .then((q) => {
                        ch.assertExchange(exchange, 'fanout', {
                            durable: false
                        });

                        ch.publish(exchange, '', new Buffer(content), {
                            correlationId: corr,
                            replyTo: q.queue
                        });

                        console.log(`Sent ${content}`); // eslint-disable-line no-console

                        ch.consume(q.queue, (msg) => {
                            console.log(`[RPC-Client] Received Message ${msg.toString('utf8')}`); // eslint-disable-line no-console
                            if (msg.properties.correlationId === corr) {
                                const result = msg.content.toString();
                                console.log(`Receive ${result}`); // eslint-disable-line no-console
                                return callback(result);
                            }
                        });
                    });
            });
    }
}

export default new AmqpRpc();

