import { z } from "zod";

export const loginSchema = z.object({
	email: z
		.string({ error: "Email is required" })
		.min(1, "Email is required")
		.pipe(z.email({ error: "Invalid email format" })),
	password: z
		.string({ error: "Password is required" })
		.min(1, "Password is required")
		.min(8, "Password must be at least 8 characters long"),
});

export const registerSchema = z.object({
	email: z
		.string({ error: "Email is required" })
		.min(1, "Email is required")
		.pipe(z.email({ error: "Invalid email format" })),
	password: z
		.string({ error: "Password is required" })
		.min(1, "Password is required")
		.min(8, "Password must be at least 8 characters long"),
	first_name: z
		.string({ error: "First name is required" })
		.min(1, "First name is required"),
	last_name: z
		.string({ error: "Last name is required" })
		.min(1, "Last name is required"),
});

export type LoginSchemaDto = z.infer<typeof loginSchema>;
export type RegisterSchemaDto = z.infer<typeof registerSchema>;
