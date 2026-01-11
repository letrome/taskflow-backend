import "dotenv/config";
import http from "node:http";
import mongoose from "mongoose";
import app from "./app.js";
import { MONGO_URI } from "./core/config.js";
import logger from "./core/logger.js";
import { errorHandler, logListening } from "./core/utils.js";

const server = http.createServer(app);
const port = app.get("port");

server.on("error", (err) => errorHandler(err, server, port));
server.on("listening", () => logListening(server, port));

try {
	logger.debug("Connection to MongoDB...");
	await mongoose.connect(MONGO_URI);
	logger.debug("Connection to MongoDB successful !");
} catch (error) {
	logger.error(error, "Connection to MongoDB failed !");
	throw error;
}

server.listen(port);
