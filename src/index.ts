import http from 'node:http';
import app from './app.js';
import { errorHandler, logListening } from './utils.js';

const server = http.createServer(app);
const port = app.get('port');

server.on('error', (err) => errorHandler(err, server, port));
server.on('listening', () => logListening(server, port));

server.listen(port);