import { BASIC_SECRET, JWT_SECRET } from "@src/core/config.js";
import { UnauthorizedError } from "@src/core/errors.js";
import logger from "@src/core/logger.js";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function basicAuth(req: Request, _res: Response, next: NextFunction) {
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

export function jwtAuth(req: Request, _res: Response, next: NextFunction) {
	const authType = req.headers.authorization?.split(" ")[0];
	if (authType !== "Bearer") {
		logger.debug("Invalid authorization header");
		throw new UnauthorizedError("Unauthorized");
	}

	const token = req.headers.authorization?.split(" ")[1];
	if (!token) {
		logger.debug("No token provided");
		throw new UnauthorizedError("Unauthorized");
	}

	try {
		const decodedToken = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
		const userId = decodedToken.id;
		const roles = decodedToken.roles;
		req.auth = {
			userId,
			roles,
		};
		next();
	} catch (error) {
		logger.debug(error, "Invalid token");
		throw new UnauthorizedError("Unauthorized");
	}
}
