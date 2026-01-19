import { isValidObjectId } from "mongoose";
import z from "zod";

export const objectIdSchema = (message: string) =>
	z.string().superRefine((val, ctx) => {
		if (!isValidObjectId(val)) {
			ctx.addIssue({
				code: "custom",
				message: message,
				params: { statusCode: 404 },
			});
		}
	});

export const createIdParamSchema = (
	message: string,
	paramName: string = "id",
) =>
	z.object({
		[paramName]: objectIdSchema(message),
	});
