import logger from "@src/core/logger.js";
import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

export const validate = (schema: ZodType) => {
	return (req: Request, _res: Response, next: NextFunction) => {
		try {
			req.body = schema.parse(req.body);
			next();
		} catch (error) {
			logger.error(
				`Validation Error details: ${JSON.stringify(error, null, 2)}`,
			);
			next(error);
		}
	};
};

export const validateParams = (schema: ZodType) => {
	return (req: Request, _res: Response, next: NextFunction) => {
		try {
			const parsed = schema.parse(req.params);
			req.params = { ...req.params, ...(parsed as object) };
			next();
		} catch (error) {
			logger.error(
				`Validation Params Error details: ${JSON.stringify(error, null, 2)}`,
			);
			next(error);
		}
	};
};

export const validateQuery = (schema: ZodType) => {
	return (req: Request, _res: Response, next: NextFunction) => {
		try {
			const parsed = schema.parse(req.query);
			req.validatedQuery = parsed;
			next();
		} catch (error) {
			logger.error(
				`Validation Query Error details: ${JSON.stringify(error, null, 2)}`,
			);
			next(error);
		}
	};
};
