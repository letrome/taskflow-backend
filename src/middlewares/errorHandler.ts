import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../core/errors.js";
import logger from "../core/logger.js";

export const errorHandler = (
	error: Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	let statusCode = 500;
	let message = "Internal Server Error";
	// biome-ignore lint/suspicious/noExplicitAny: Generic error structure flexibility
	let errors: any;

	if (error instanceof AppError) {
		statusCode = error.statusCode;
		message = error.message;
	} else if (error instanceof ZodError) {
		statusCode = 400;
		message = "Validation failed";
		errors = error.issues;
	}

	if (statusCode >= 400 && statusCode < 500) {
		logger.debug({ err: error }, `Client Error: ${message}`);
	} else {
		logger.error({ err: error }, `Server Error: ${message}`);
	}

	res.status(statusCode).json({
		status: "error",
		message,
		...(errors && { errors }),
	});
};
