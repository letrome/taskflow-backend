import z from "zod";
import { createIdParamSchema, objectIdSchema } from "./common.js";

export const createTagSchema = z.object({
	name: z.string({ error: "Name is required" }).min(1, "Name is required"),
});

export const patchTagSchema = z
	.object({
		name: z.string({ error: "Name is required" }).min(1, "Name is required"),
		project: objectIdSchema("Project not found").optional(),
	})
	.partial();

export type CreateTagDTO = z.infer<typeof createTagSchema>;
export type PatchTagDTO = z.infer<typeof patchTagSchema>;

export const tagIdSchema = createIdParamSchema("Tag not found");
