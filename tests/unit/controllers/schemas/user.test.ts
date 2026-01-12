import { createUserSchema } from "@src/controllers/schemas/user.js";
import { describe, expect, it } from "vitest";

describe("createUserSchema", () => {
	it("should validate a correct user", () => {
		const validUser = {
			email: "test@example.com",
			password: "password123",
			first_name: "John",
			last_name: "Doe",
			roles: ["ROLE_USER"],
		};
		const result = createUserSchema.safeParse(validUser);
		expect(result.success).toBe(true);
	});

	it("should validate a correct user without roles", () => {
		const validUser = {
			email: "test@example.com",
			password: "password123",
			first_name: "John",
			last_name: "Doe",
		};
		const result = createUserSchema.safeParse(validUser);
		expect(result.success).toBe(true);
	});

	it("should not validate a user without email", () => {
		const validUser = {
			email: "invalid",
			password: "password123",
			first_name: "John",
			last_name: "Doe",
			roles: ["ROLE_USER"],
		};
		const result = createUserSchema.safeParse(validUser);
		expect(result.success).toBe(false);
	});

	it("should not validate a user with invalid email", () => {
		const validUser = {
			password: "password123",
			first_name: "John",
			last_name: "Doe",
			roles: ["ROLE_USER"],
		};
		const result = createUserSchema.safeParse(validUser);
		expect(result.success).toBe(false);
	});

	it("should not validate a user without password", () => {
		const validUser = {
			email: "test@example.com",
			first_name: "John",
			last_name: "Doe",
			roles: ["ROLE_USER"],
		};
		const result = createUserSchema.safeParse(validUser);
		expect(result.success).toBe(false);
	});

	it("should not validate a user with invalid password", () => {
		const validUser = {
			email: "test@example.com",
			password: "123",
			first_name: "John",
			last_name: "Doe",
			roles: ["ROLE_USER"],
		};
		const result = createUserSchema.safeParse(validUser);
		expect(result.success).toBe(false);
	});

	it("should not validate a user without first_name", () => {
		const validUser = {
			email: "test@example.com",
			password: "password123",
			last_name: "Doe",
			roles: ["ROLE_USER"],
		};
		const result = createUserSchema.safeParse(validUser);
		expect(result.success).toBe(false);
	});

	it("should not validate a user with empty first_name", () => {
		const validUser = {
			email: "test@example.com",
			password: "password123",
			first_name: "",
			last_name: "Doe",
			roles: ["ROLE_USER"],
		};
		const result = createUserSchema.safeParse(validUser);
		expect(result.success).toBe(false);
	});

	it("should not validate a user without last_name", () => {
		const validUser = {
			email: "test@example.com",
			password: "password123",
			first_name: "John",
			roles: ["ROLE_USER"],
		};
		const result = createUserSchema.safeParse(validUser);
		expect(result.success).toBe(false);
	});

	it("should not validate a user with empty last_name", () => {
		const validUser = {
			email: "test@example.com",
			password: "password123",
			first_name: "John",
			last_name: "",
			roles: ["ROLE_USER"],
		};
		const result = createUserSchema.safeParse(validUser);
		expect(result.success).toBe(false);
	});
});
