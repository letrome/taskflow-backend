import express from 'express';
import http from 'node:http';
import type { AddressInfo } from 'node:net';

const normalizePort = (val: string | undefined): number => {
  const defaultPort: number = 3000;
  if (!val) {
    return defaultPort;
  }

  const port: number = Number.parseInt(val, 10);

  if (Number.isNaN(port)) {
    return defaultPort;
  }
  if (port >= 0) {
    return port;
  }
  return defaultPort;
};

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

const app = express();

app.set('port', normalizePort(process.env.PORT));

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

const server = http.createServer(app);

server.on('error', errorHandler);
server.on('listening', listenerLog);

server.listen(app.get('port'));