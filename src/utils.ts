export const normalizePort = (val: string | undefined): number => {
  const defaultPort: number = 4000;
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
