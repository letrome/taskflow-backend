import type { Server } from 'node:http';

export const errorHandler = (
  error: NodeJS.ErrnoException,
  server: Server,
  port: number | string,
) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = 'port ' + port;
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

export const logListening = (server: Server, port: number | string) => {

  const bind = 'port ' + port;
  console.log('Listening on ' + bind);
};
