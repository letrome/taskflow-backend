import { Status } from "@src/services/models/project.js";
import z from "zod";

export const createProjectSchema = z.object({
	title: z.string({ error: "Title is required" }).min(1, "Title is required"),
	description: z
		.string({ error: "Description is required" })
		.min(1, "Description is required"),
	start_date: z
		.string({ message: "Start date is required" })
		.transform((str, ctx) => {
			const date = new Date(str);
			if (Number.isNaN(date.getTime())) {
				ctx.addIssue({
					code: "custom",
					message: "Start date must be a valid date",
				});
				return z.NEVER;
			}
			return date;
		})
		.pipe(
			z.date().min(new Date(), { message: "Start date must be in the future" }),
		),
	end_date: z
		.string({ message: "End date is required" })
		.optional()
		.transform((str, ctx) => {
			if (!str) return undefined;
			const date = new Date(str);
			if (Number.isNaN(date.getTime())) {
				ctx.addIssue({
					code: "custom",
					message: "End date must be a valid date",
				});
				return z.NEVER;
			}
			return date;
		})
		.pipe(
			z
				.date()
				.min(new Date(), { message: "End date must be in the future" })
				.optional(),
		),
	status: z.enum(Status).default(Status.ACTIVE),
	members: z.array(z.string()).default([]),
});

export type CreateProjectDTO = z.infer<typeof createProjectSchema>;
