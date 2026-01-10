import type { Server } from "node:http";
import logger from "./logger.js";

export const errorHandler = (
	error: NodeJS.ErrnoException,
	_server: Server,
	port: number | string,
) => {
	if (error.syscall !== "listen") {
		throw error;
	}

	const bind = `port ${port}`;
	switch (error.code) {
		case "EACCES":
			logger.error(`${bind} requires elevated privileges.`);
			process.exit(1);
			break;
		case "EADDRINUSE":
			logger.error(`${bind} is already in use.`);
			process.exit(1);
			break;
		default:
			throw error;
	}
};

export const logListening = (_server: Server, port: number | string) => {
	const bind = `port ${port}`;
	logger.info(`Listening on ${bind}`);
};
