import { Roles } from "@src/services/models/user.js";
import { z } from "zod";
import { createIdParamSchema } from "./common.js";

export const createUserSchema = z.object({
	email: z.email("Invalid email format"),
	password: z.string().min(8, "Password must be at least 8 characters long"),
	first_name: z.string().min(1, "First name is required"),
	last_name: z.string().min(1, "Last name is required"),
	roles: z.array(z.enum(Roles)).optional(),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;

export const userIdSchema = createIdParamSchema("User not found");
