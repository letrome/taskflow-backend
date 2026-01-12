import User, { Roles } from "@src/services/models/user.js";
import { describe, expect, it } from "vitest";

describe("User Model", () => {
	it("should pass validation with valid data", () => {
		const user = new User({
			email: "test@example.com",
			password_hash: "hashedpassword",
			first_name: "John",
			last_name: "Doe",
			roles: [Roles.ROLE_USER],
		});

		const error = user.validateSync();
		expect(error).toBeUndefined();
	});

	it("should fail validation if required fields are missing", () => {
		const user = new User({}); // Empty object

		const error = user.validateSync();
		expect(error).toBeDefined();
		expect(error?.errors.email).toBeDefined();
		expect(error?.errors.password_hash).toBeDefined();
		expect(error?.errors.first_name).toBeDefined();
		expect(error?.errors.last_name).toBeDefined();
	});

	it("should fail validation if roles contain invalid value", () => {
		const user = new User({
			email: "test@example.com",
			password_hash: "hashedpassword",
			first_name: "John",
			last_name: "Doe",
			roles: ["INVALID_ROLE"],
		});

		const error = user.validateSync();
		expect(error).toBeDefined();
		expect(error?.errors["roles.0"]).toBeDefined();
	});

	it("should default to ROLE_USER if roles is not provided", () => {
		const user = new User({
			email: "test@example.com",
			password_hash: "hashedpassword",
			first_name: "John",
			last_name: "Doe",
		});

		const error = user.validateSync();
		expect(error).toBeUndefined();
		expect(user.roles).toContain(Roles.ROLE_USER);
	});
});
