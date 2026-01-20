import { Priority, State } from "@src/services/models/task.js";
import z from "zod";
import { createIdParamSchema, objectIdSchema } from "./common.js";

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

export const createTaskSchema = z.object({
	title: z.string({ error: "Title is required" }).min(1, "Title is required"),
	description: z
		.string({ error: "Description is required" })
		.min(1, "Description is required"),
	due_date: z
		.string()
		.min(1, "Due date is required")
		.optional()
		.transform(transformToDate("Due date"))
		.pipe(z.date().optional()),
	priority: z.enum(Priority).default(Priority.MEDIUM),
	state: z.enum(State).default(State.OPEN),
	assignee: objectIdSchema("Assignee not found").optional(),
	tags: z.array(objectIdSchema("Tag not found")).default([]),
});

export type CreateTaskDTO = z.infer<typeof createTaskSchema>;

export const projectIdSchema = createIdParamSchema("Project not found");
export const taskIdSchema = createIdParamSchema("Task not found");
