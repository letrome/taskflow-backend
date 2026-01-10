import pino from "pino";
import { PINO_LOG_LEVEL } from "./config.js";

const logger = pino({
	level: PINO_LOG_LEVEL,
});

export default logger;
