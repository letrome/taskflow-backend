import z from "zod";
import { createIdParamSchema } from "./common.js";

export const createTagSchema = z.object({
	name: z.string({ error: "Name is required" }).min(1, "Name is required"),
});

export const patchTagSchema = z
	.object({
		name: z.string({ error: "Name is required" }).min(1, "Name is required"),
		project: z
			.string({ error: "Project is required" })
			.min(1, "Project is required"),
	})
	.partial();

export type CreateTagDTO = z.infer<typeof createTagSchema>;
export type PatchTagDTO = z.infer<typeof patchTagSchema>;

export const tagIdSchema = createIdParamSchema("Tag not found");
