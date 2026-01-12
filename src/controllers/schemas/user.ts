import { Roles } from "@src/services/models/user.js";
import { z } from "zod";

export const createUserSchema = z.object({
	email: z.email("Invalid email format"),
	password: z.string().min(8, "Password must be at least 8 characters long"),
	first_name: z.string().min(1, "First name is required"),
	last_name: z.string().min(1, "Last name is required"),
	// roles is optional in input; if omitted, logic/mongoose defaults to ROLE_USER
	roles: z.array(z.enum(Roles)).optional(),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
