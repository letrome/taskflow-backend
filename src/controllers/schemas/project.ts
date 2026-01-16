import { Status } from "@src/services/models/project.js";
import z from "zod";

const transformToDate =
	(fieldName: string) => (str: string | undefined, ctx: z.RefinementCtx) => {
		if (!str) return undefined;
		const date = new Date(str);
		if (Number.isNaN(date.getTime())) {
			ctx.addIssue({
				code: "custom",
				message: `${fieldName} must be a valid date`,
			});
			return z.NEVER;
		}
		return date;
	};

const futureDateSchema = (fieldName: string) =>
	z.date().min(new Date(), { message: `${fieldName} must be in the future` });

export const createOrUpdateProjectSchema = z.object({
	title: z.string({ error: "Title is required" }).min(1, "Title is required"),
	description: z
		.string({ error: "Description is required" })
		.min(1, "Description is required"),
	start_date: z
		.string({ message: "Start date is required" })
		.transform(transformToDate("Start date"))
		.pipe(futureDateSchema("Start date")),
	end_date: z
		.string({ message: "End date is required" })
		.optional()
		.transform(transformToDate("End date"))
		.pipe(futureDateSchema("End date").optional()),
	status: z.enum(Status).default(Status.ACTIVE),
	members: z.array(z.string()).default([]),
});

export const patchProjectSchema = z.object({
	title: z
		.string({ error: "Title is required" })
		.min(1, "Title is required")
		.optional(),
	description: z
		.string({ error: "Description is required" })
		.min(1, "Description is required")
		.optional(),
	start_date: z
		.string({ message: "Start date is required" })
		.min(1, "Start date is required")
		.optional()
		.transform(transformToDate("Start date"))
		.pipe(futureDateSchema("Start date").optional()),
	end_date: z
		.string({ message: "End date is required" })
		.min(1, "End date is required")
		.optional()
		.transform(transformToDate("End date"))
		.pipe(futureDateSchema("End date").optional()),
	status: z
		.string()
		.refine((val) => val !== "", { message: "Status is required" })
		.pipe(z.enum(Status))
		.optional(),
	members: z.array(z.string()).optional(),
});

export type CreateOrUpdateProjectDTO = z.infer<
	typeof createOrUpdateProjectSchema
>;
export type PatchProjectDTO = z.infer<typeof patchProjectSchema>;
