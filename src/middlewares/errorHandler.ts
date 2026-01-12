import { AppError } from "@src/core/errors.js";
import logger from "@src/core/logger.js";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export const errorHandler = (
	error: Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	let statusCode = 500;
	let message = "Internal Server Error";

	if (error instanceof AppError) {
		statusCode = error.statusCode;
		message = error.message;
	} else if (error instanceof ZodError) {
		statusCode = 400;
		message = error.issues[0]?.message || "Validation error";
	} else if (
		"statusCode" in error &&
		typeof (error as Record<string, unknown>).statusCode === "number"
	) {
		statusCode = (error as { statusCode: number }).statusCode;
		message = error.message;
	}

	if (statusCode >= 400 && statusCode < 500) {
		logger.debug({ err: error }, `Client Error: ${message}`);
	} else {
		logger.error({ err: error }, `Server Error: ${message}`);
	}

	res.status(statusCode).json({
		status: "error",
		message,
	});
};
