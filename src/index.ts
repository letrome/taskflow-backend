import http from 'node:http';
import type { AddressInfo } from 'node:net';
import app from './app.js';

const server = http.createServer(app);

const errorHandler = (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + app.get('port');
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
    default:
      throw error;
  }
};

const listenerLog = () => {
    const address: string | AddressInfo | null = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + app.get('port');
    console.log('Listening on ' + bind);
}

server.on('error', errorHandler);
server.on('listening', listenerLog);

server.listen(app.get('port'));