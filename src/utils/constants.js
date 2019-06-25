//WS Web-Socket Constants
export const PING_INTERVAL = 6 * 1000;// eslint-disable-line no-magic-numbers
export const PONG_DELAY = 20 * 1000;// eslint-disable-line no-magic-numbers
export const HEALTHY_PING_COUNT_THRESHOLD = 2;


//Pub/Sub Queue Channels Constants
export const SEND_CHANNEL = 'SEND_CHANNEL';
export const SOCKET_CLOSE_CHANNEL = 'SOCKET_CLOSE_CHANNEL';
export const SUBSCRIBER_MESSAGE = 'SUBSCRIBER_MESSAGE';
export const GLOBAL_MESSAGE_SUBSCRIBE = (tag) => `GLOBAL_MESSAGE_SUBSCRIBE_${tag}`;

//Server Constants
export const WS = 'ws';
export const REDIS = 'redis';
export const SOCKET_IO = 'socket.io';
export const AMQP = 'amqp';
