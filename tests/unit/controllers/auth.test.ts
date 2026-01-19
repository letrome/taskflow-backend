import * as authController from "@src/controllers/auth.js";
import * as authService from "@src/services/auth.js";
import type { Request } from "express";
import { describe, expect, it, vi } from "vitest";
import { createMockRequest, createMockResponse } from "../test-utils.js";

vi.mock("@src/services/auth.js");

describe("Auth Controller", () => {
	describe("register", () => {
		it("should register a user and return 201", async () => {
			const mockUser = {
				_id: "user-id",
				email: "test@example.com",
				first_name: "John",
				last_name: "Doe",
				roles: ["ROLE_USER"],
			};

			// biome-ignore lint/suspicious/noExplicitAny: Mock implementation needs access to this
			vi.mocked(authService.register).mockResolvedValue(mockUser as any);

			const request = createMockRequest<
				Request<
					Record<string, never>,
					Record<string, never>,
					{
						email: string;
						password: string;
						first_name: string;
						last_name: string;
					}
				>
			>({
				body: {
					email: "test@example.com",
					password: "password123",
					first_name: "John",
					last_name: "Doe",
				},
			});
			const response = createMockResponse();
			await authController.register(request, response);

			expect(authService.register).toHaveBeenCalledWith(request.body);
			expect(response.status).toHaveBeenCalledWith(201);
			expect(response.json).toHaveBeenCalledWith(mockUser);
		});

		it("should call next with error if register fails", async () => {
			const error = new Error("Registration failed");
			vi.mocked(authService.register).mockRejectedValue(error);

			const request = createMockRequest<
				Request<
					Record<string, never>,
					Record<string, never>,
					{
						email: string;
						password: string;
						first_name: string;
						last_name: string;
					}
				>
			>({
				body: {
					email: "test@example.com",
					password: "password123",
					first_name: "John",
					last_name: "Doe",
				},
			});
			const response = createMockResponse();
			await expect(authController.register(request, response)).rejects.toThrow(
				error,
			);
		});
	});

	describe("login", () => {
		it("should login a user and return 200", async () => {
			const mockLoginInfo = {
				token: "jwt-token",
				expires_in: "3600 seconds",
			};

			vi.mocked(authService.login).mockResolvedValue(mockLoginInfo);

			const request = createMockRequest<
				Request<
					Record<string, never>,
					Record<string, never>,
					{ email: string; password: string }
				>
			>({
				body: {
					email: "test@example.com",
					password: "password123",
				},
			});
			const response = createMockResponse();
			await authController.login(request, response);

			expect(authService.login).toHaveBeenCalledWith(request.body);
			expect(response.status).toHaveBeenCalledWith(200);
			expect(response.json).toHaveBeenCalledWith(mockLoginInfo);
		});

		it("should call next with error if login fails", async () => {
			const error = new Error("Login failed");
			vi.mocked(authService.login).mockRejectedValue(error);

			const request = createMockRequest<
				Request<
					Record<string, never>,
					Record<string, never>,
					{ email: string; password: string }
				>
			>({
				body: {
					email: "test@example.com",
					password: "password123",
				},
			});
			const response = createMockResponse();
			await expect(authController.login(request, response)).rejects.toThrow(
				error,
			);
		});
	});
});
