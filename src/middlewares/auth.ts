import type { NextFunction, Request, Response } from "express";
import { BASIC_SECRET } from "../config.js";
import logger from "../logger.js";

export default function basicAuth(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const header = req.headers.authorization;
		if (!header) {
			throw new Error("No authorization header provided");
		}

		const [type, token] = header.split(" ");
		if (type !== "Basic" || !token) {
			throw new Error("Invalid authorization format");
		}

		const decoded = Buffer.from(token, "base64").toString("utf-8");
		const [_, password] = decoded.split(":");

		if (password !== BASIC_SECRET) {
			throw new Error("Invalid credentials");
		}

		next();
	} catch (error) {
		logger.debug(error);
		res.status(401).json({ error: "Unauthorized" });
	}
}
