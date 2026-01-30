import { z } from "zod";
import { createIdParamSchema } from "./common.js";

export enum UserRole {
	ROLE_USER = "ROLE_USER",
	ROLE_MANAGER = "ROLE_MANAGER",
}

export const createUserSchema = z.object({
	email: z.email("Invalid email format"),
	password: z.string().min(8, "Password must be at least 8 characters long"),
	first_name: z.string().min(1, "First name is required"),
	last_name: z.string().min(1, "Last name is required"),
	roles: z
		.array(
			z.preprocess(
				(val) => (typeof val === "string" ? val.toUpperCase() : val),
				z.enum(UserRole),
			),
		)
		.default([UserRole.ROLE_USER]),
});

export const updateUserInformationSchema = z.object({
	first_name: z.string().min(1, "First name is required"),
	last_name: z.string().min(1, "Last name is required"),
});

export const patchUserInformationSchema = z.object({
	first_name: z.string().min(1, "First name is required").optional(),
	last_name: z.string().min(1, "Last name is required").optional(),
});

export const updatePasswordSchema = z.object({
	old_password: z
		.string()
		.min(8, "Password must be at least 8 characters long"),
	new_password: z
		.string()
		.min(8, "Password must be at least 8 characters long"),
});

export const updateEmailSchema = z.object({
	email: z.email("Invalid email format"),
	password: z.string().min(8, "Password must be at least 8 characters long"),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserInformationDTO = z.infer<
	typeof updateUserInformationSchema
>;
export type PatchUserInformationDTO = z.infer<
	typeof patchUserInformationSchema
>;
export type UpdatePasswordDTO = z.infer<typeof updatePasswordSchema>;
export type UpdateEmailDTO = z.infer<typeof updateEmailSchema>;

export const userIdSchema = createIdParamSchema("User not found");
