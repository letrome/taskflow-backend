import { BASIC_SECRET } from "@src/core/config.js";
import { UnauthorizedError } from "@src/core/errors.js";
import logger from "@src/core/logger.js";
import type { NextFunction, Request, Response } from "express";

export default function basicAuth(
	req: Request,
	_res: Response,
	next: NextFunction,
) {
	const header = req.headers.authorization;
	if (!header) {
		logger.debug("No authorization header");
		throw new UnauthorizedError("Unauthorized");
	}

	const [type, token] = header.split(" ");
	if (type !== "Basic" || !token) {
		logger.debug("Invalid authorization header");
		throw new UnauthorizedError("Unauthorized");
	}

	const decoded = Buffer.from(token, "base64").toString("utf-8");
	const [_, password] = decoded.split(":");

	if (password !== BASIC_SECRET) {
		logger.debug("Invalid authorization header");
		throw new UnauthorizedError("Unauthorized");
	}

	next();
}
