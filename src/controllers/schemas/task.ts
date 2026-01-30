import z from "zod";
import { createIdParamSchema, objectIdSchema } from "./common.js";

export enum TaskPriority {
	LOW = "LOW",
	MEDIUM = "MEDIUM",
	HIGH = "HIGH",
}

export enum TaskState {
	OPEN = "OPEN",
	IN_PROGRESS = "IN_PROGRESS",
	CLOSED = "CLOSED",
}

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
	priority: z
		.preprocess(
			(val) => (typeof val === "string" ? val.toUpperCase() : val),
			z.enum(TaskPriority),
		)
		.default(TaskPriority.MEDIUM),
	state: z
		.preprocess(
			(val) => (typeof val === "string" ? val.toUpperCase() : val),
			z.enum(TaskState),
		)
		.default(TaskState.OPEN),
	assignee: objectIdSchema("Assignee not found").optional(),
	tags: z.array(objectIdSchema("Tag not found")).default([]),
});

export const patchTaskSchema = z.object({
	title: z
		.string({ error: "Title is required" })
		.min(1, "Title is required")
		.optional(),
	description: z
		.string({ error: "Description is required" })
		.min(1, "Description is required")
		.optional(),
	due_date: z
		.string()
		.min(1, "Due date is required")
		.optional()
		.transform(transformToDate("Due date"))
		.pipe(z.date().optional()),
	priority: z
		.preprocess(
			(val) => (typeof val === "string" ? val.toUpperCase() : val),
			z.enum(TaskPriority),
		)
		.optional(),
	state: z
		.preprocess(
			(val) => (typeof val === "string" ? val.toUpperCase() : val),
			z.enum(TaskState),
		)
		.optional(),
	assignee: objectIdSchema("Assignee not found").optional(),
	tags: z.array(objectIdSchema("Tag not found")).optional(),
});

export type CreateTaskDTO = z.infer<typeof createTaskSchema>;
export type PatchTaskDTO = z.infer<typeof patchTaskSchema>;

export const projectIdSchema = createIdParamSchema("Project not found");
export const taskIdSchema = createIdParamSchema("Task not found");
export const statusSchema = z.enum(TaskState);

export const taskStateParamSchema = z.object({
	state: z.preprocess(
		(val) => (typeof val === "string" ? val.toUpperCase() : val),
		z.enum(TaskState),
	),
});

export const tagIdSchema = createIdParamSchema("Tag not found", "tagId");
