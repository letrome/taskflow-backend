import {
	createUser,
	getHealth,
	getMetrics,
	getUser,
	getVersion,
} from "@src/controllers/admin.js";
import type { CreateUserDTO } from "@src/controllers/schemas/user.js";
import { type IUser, Roles } from "@src/services/models/user.js";
import * as adminService from "@src/services/user.js";
import type { Request } from "express";
import { describe, expect, it, vi } from "vitest";
import { createMockRequest, createMockResponse } from "../test-utils.js";

// Mocks
vi.mock("bcrypt", () => ({
	hash: vi.fn().mockResolvedValue("hashed_password"),
	default: {
		hash: vi.fn().mockResolvedValue("hashed_password"),
	},
}));

vi.mock("@src/services/user.js");

describe("getHealth", () => {
	it("should return a body with status ok", () => {
		const request = createMockRequest();
		const response = createMockResponse();

		getHealth(request, response);

		expect(response.status).toHaveBeenCalledWith(200);
		expect(response.json).toHaveBeenCalledWith({ status: "OK" });
	});
});

describe("getVersion", () => {
	it("should return the version in the package.json", () => {
		const request = createMockRequest();
		const response = createMockResponse();

		getVersion(request, response);

		expect(response.status).toHaveBeenCalledWith(200);
		expect(response.json).toHaveBeenCalledWith({
			version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
		});
	});
});

describe("getMetrics", () => {
	it("should return the metrics", async () => {
		const request = createMockRequest();
		const response = createMockResponse();

		await getMetrics(request, response);

		expect(response.status).toHaveBeenCalledWith(200);
		expect(response.send).toHaveBeenCalled();
	});
});

describe("createUser", () => {
	it("should create a user", async () => {
		vi.mocked(adminService.createUser).mockResolvedValue({
			email: "test@test.com",
			password_hash: "hashed_password",
			first_name: "First",
			last_name: "Last",
			roles: [Roles.ROLE_USER],
		} as unknown as IUser);

		const request = createMockRequest<
			Request<Record<string, never>, Record<string, never>, CreateUserDTO>
		>({
			body: {
				email: "test@test.com",
				password: "password",
				first_name: "First",
				last_name: "Last",
				roles: [Roles.ROLE_USER],
			},
		});
		const response = createMockResponse();

		await createUser(request, response);

		expect(response.status).toHaveBeenCalledWith(201);
		expect(response.json).toHaveBeenCalledWith(
			expect.objectContaining({
				email: "test@test.com",
				password_hash: "hashed_password",
				first_name: "First",
				last_name: "Last",
				roles: ["ROLE_USER"],
			}),
		);
	});

	it("should return a bad request", async () => {
		const request = createMockRequest<
			// biome-ignore lint/suspicious/noExplicitAny: unit test
			Request<Record<string, never>, Record<string, never>, any>
		>({
			body: {
				password: "password",
				first_name: "First",
				last_name: "Last",
				roles: [Roles.ROLE_USER],
			},
		});
		vi.mocked(adminService.createUser).mockRejectedValue(
			new Error("email is empty"),
		);
		const response = createMockResponse();
		await expect(createUser(request, response)).rejects.toThrow(
			"email is empty",
		);
	});
});

describe("getUser", () => {
	it("should get a user", async () => {
		vi.mocked(adminService.getUser).mockResolvedValue({
			email: "test@test.com",
			password_hash: "hashed_password",
			first_name: "First",
			last_name: "Last",
			roles: [Roles.ROLE_USER],
		} as unknown as IUser);

		const request = createMockRequest<Request<{ id: string }>>({
			params: {
				id: "123",
			},
		});

		const response = createMockResponse();

		await getUser(request, response);

		expect(response.status).toHaveBeenCalledWith(200);
		expect(response.json).toHaveBeenCalledWith(
			expect.objectContaining({
				email: "test@test.com",
				password_hash: "hashed_password",
				first_name: "First",
				last_name: "Last",
				roles: [Roles.ROLE_USER],
			}),
		);
	});

	it("should return not found", async () => {
		vi.mocked(adminService.getUser).mockRejectedValue(new Error("not found"));

		const request = createMockRequest<Request<{ id: string }>>({
			params: {
				id: "456",
			},
		});

		const response = createMockResponse();

		await expect(getUser(request, response)).rejects.toThrow("not found");
	});
});
