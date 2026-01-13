import { z } from "zod";

export const loginSchema = z.object({
	email: z.email("Invalid email format"),
	password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const registerSchema = z.object({
	email: z.email("Invalid email format"),
	password: z.string().min(8, "Password must be at least 8 characters long"),
	first_name: z.string().min(1, "First name is required"),
	last_name: z.string().min(1, "Last name is required"),
});

export type LoginSchemaDto = z.infer<typeof loginSchema>;
export type RegisterSchemaDto = z.infer<typeof registerSchema>;
