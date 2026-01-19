import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

export const validate = (schema: ZodType) => {
	return (req: Request, _res: Response, next: NextFunction) => {
		try {
			req.body = schema.parse(req.body);
			next();
		} catch (error) {
			console.error(
				"Validation Error details:",
				JSON.stringify(error, null, 2),
			);
			next(error);
		}
	};
};

export const validateParams = (schema: ZodType) => {
	return (req: Request, _res: Response, next: NextFunction) => {
		try {
			// biome-ignore lint/suspicious/noExplicitAny: Need to handle generic parsed params
			const parsed = schema.parse(req.params) as Record<string, any>;
			req.params = { ...req.params, ...parsed };
			next();
		} catch (error) {
			console.error(
				"Validation Params Error details:",
				JSON.stringify(error, null, 2),
			);
			next(error);
		}
	};
};
