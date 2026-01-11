const checkAndGetPort = (val: string | undefined): number => {
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

const checkAndGetBasicSecret = (val: string | undefined): string => {
	if (!val) {
		throw new Error("BASIC_SECRET is not defined");
	}
	return val;
};

const checkAndGetLogLevel = (val: string | undefined): string => {
	const validLevels = ["fatal", "error", "warn", "info", "debug", "trace"];
	if (val && validLevels.includes(val)) {
		return val;
	}
	return "info";
};

const checkAndGetAllowedOrigins = (val: string | undefined): string[] => {
	if (!val) {
		return [];
	}
	return val.split(",");
};

const checkAndGetMongoUri = (val: string | undefined): string => {
	if (!val) {
		throw new Error("MONGO_URI is not defined");
	}
	return val;
};

export const PORT = checkAndGetPort(process.env.PORT);
export const BASIC_SECRET = checkAndGetBasicSecret(process.env.BASIC_SECRET);
export const PINO_LOG_LEVEL = checkAndGetLogLevel(process.env.PINO_LOG_LEVEL);
export const ALLOWED_ORIGINS = checkAndGetAllowedOrigins(
	process.env.ALLOWED_ORIGINS,
);
export const MONGO_URI = checkAndGetMongoUri(process.env.MONGO_URI);
