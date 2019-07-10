/* eslint-disable no-console */

import express from 'express';
import MockAgent from './mockAgent';

const app = express();

const port = 3000;

const mockAgent = new MockAgent(process.env.WS_PORT);

app.get('/join', (req, res) => {
    mockAgent.sendJoinMessage();
    res.send('OK');
});

app.get('/heartbeat', (req, res) => {
    mockAgent.sendHeartBeatMessage();
    res.send('OK');
});

app.get('/tunnelOpenSuccess', (req, res) => {
    mockAgent.sendTunnelOpenSuccessMessage();
    res.send('OK');
});

app.get('/tunnelOpenUnsuccess', (req, res) => {
    mockAgent.sendTunnelOpenUnsuccessMessage();
    res.send('OK');
});

app.get('/close', (req, res) => {
    mockAgent.closeSocket();
    res.send('OK');
});

app.listen(port, () => console.log(`Pulse Agent simulator is listening on port ${port}!`));

/* eslint-enable no-console */

