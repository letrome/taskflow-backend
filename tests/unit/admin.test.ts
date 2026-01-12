import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import {
	createUser,
	getHealth,
	getMetrics,
	getUser,
	getVersion,
} from "../../src/controllers/admin.js";
import type { CreateUserDTO } from "../../src/controllers/schemas/user.js";
import * as adminService from "../../src/services/admin.js";
import type { IUser } from "../../src/services/models/user.js";

// Mocks
vi.mock("bcrypt", () => ({
	hash: vi.fn().mockResolvedValue("hashed_password"),
	default: {
		hash: vi.fn().mockResolvedValue("hashed_password"),
	},
}));

vi.mock("../../src/services/admin.js");

vi.mock("../../src/services/models/user.js", () => {
	return {
		default: class User {
			private readonly _data;
			// biome-ignore lint/suspicious/noExplicitAny: Mocking mongoose model constructor
			constructor(data: any) {
				Object.assign(this, data);
				this._data = data;
				this._data.id = "123";
			}
			save() {
				if (!this._data.email) {
					return Promise.reject(new Error("email is empty"));
				}
				return Promise.resolve(this);
			}

			static findById(id: string) {
				if (id === "123") {
					return Promise.resolve({
						email: "test@test.com",
						password_hash: "hashed_password",
						first_name: "First",
						last_name: "Last",
						roles: ["ROLE_USER"],
					});
				} else {
					return Promise.reject(new Error("not found"));
				}
			}
		},
	};
});

describe("getHealth", () => {
	it("should return a body with status ok", () => {
		const request = {} as Request;
		const response = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		} as unknown as Response;

		getHealth(request, response);

		expect(response.status).toHaveBeenCalledWith(200);
		expect(response.json).toHaveBeenCalledWith({ status: "OK" });
	});
});

describe("getVersion", () => {
	it("should return the version in the package.json", () => {
		const request = {} as Request;
		const response = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		} as unknown as Response;

		getVersion(request, response);

		expect(response.status).toHaveBeenCalledWith(200);
		expect(response.json).toHaveBeenCalledWith({
			version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
		});
	});
});

describe("getMetrics", () => {
	it("should return the metrics", async () => {
		const request = {} as Request;
		const response = {
			set: vi.fn().mockReturnThis(),
			status: vi.fn().mockReturnThis(),
			send: vi.fn(),
		} as unknown as Response;

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
			roles: ["ROLE_USER"],
		} as unknown as IUser);

		const request = {
			body: {
				email: "test@test.com",
				password: "password",
				first_name: "First",
				last_name: "Last",
				roles: ["ROLE_USER"],
			},
		} as unknown as Request<
			Record<string, never>,
			Record<string, never>,
			CreateUserDTO
		>;
		const response = {
			set: vi.fn().mockReturnThis(),
			status: vi.fn().mockReturnThis(),
			send: vi.fn(),
			json: vi.fn(),
		} as unknown as Response;

		const next = vi.fn();
		await createUser(request, response, next);

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
		const request = {
			body: {
				password: "password",
				first_name: "First",
				last_name: "Last",
				roles: ["ROLE_USER"],
			},
		} as unknown as Request<
			Record<string, never>,
			Record<string, never>,
			CreateUserDTO
		>;
		const response = {
			set: vi.fn().mockReturnThis(),
			status: vi.fn().mockReturnThis(),
			send: vi.fn(),
			json: vi.fn(),
		} as unknown as Response;
		const next = vi.fn();

		// Update service mock to throw error that will be caught
		vi.mocked(adminService.createUser).mockRejectedValueOnce(
			new Error("email is empty"),
		);

		await createUser(request, response, next);

		expect(next).toHaveBeenCalledWith(expect.any(Error));
	});
});

describe("getUser", () => {
	it("should get a user", async () => {
		vi.mocked(adminService.getUser).mockResolvedValue({
			email: "test@test.com",
			password_hash: "hashed_password",
			first_name: "First",
			last_name: "Last",
			roles: ["ROLE_USER"],
		} as unknown as IUser);

		const request = {
			params: {
				id: "123",
			},
		} as unknown as Request<{ id: string }>;

		const response = {
			set: vi.fn().mockReturnThis(),
			status: vi.fn().mockReturnThis(),
			send: vi.fn(),
			json: vi.fn(),
		} as unknown as Response;

		const next = vi.fn();
		await getUser(request, response, next);

		expect(response.status).toHaveBeenCalledWith(200);
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

	it("should return not found", async () => {
		vi.mocked(adminService.getUser).mockRejectedValue(new Error("not found"));

		const request = {
			params: {
				id: "456",
			},
		} as unknown as Request<{ id: string }>;

		const response = {
			set: vi.fn().mockReturnThis(),
			status: vi.fn().mockReturnThis(),
			send: vi.fn(),
			json: vi.fn(),
		} as unknown as Response;

		const next = vi.fn();
		await getUser(request, response, next);

		expect(next).toHaveBeenCalledWith(expect.any(Error));
	});
});
