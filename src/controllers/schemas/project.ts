import z from "zod";
import { createIdParamSchema } from "./common.js";

export enum ProjectStatus {
	ACTIVE = "ACTIVE",
	ARCHIVED = "ARCHIVED",
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
	status: z
		.preprocess(
			(val) => (typeof val === "string" ? val.toUpperCase() : val),
			z.enum(ProjectStatus),
		)
		.default(ProjectStatus.ACTIVE),
	members: z.array(z.string("Member does not exist")).default([]),
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
		.transform((val) => val.toUpperCase())
		.pipe(z.enum(ProjectStatus))
		.optional(),
	members: z.array(z.string("Member does not exist")).optional(),
});

export const addProjectMemberSchema = z.object({
	members: z.array(z.string("Member does not exist")).default([]),
});

export type CreateOrUpdateProjectDTO = z.infer<
	typeof createOrUpdateProjectSchema
>;
export type PatchProjectDTO = z.infer<typeof patchProjectSchema>;

export type AddProjectMemberDTO = z.infer<typeof addProjectMemberSchema>;

export const projectIdSchema = createIdParamSchema("Project not found");
export const memberIdSchema = createIdParamSchema(
	"Member not found",
	"memberId",
);
