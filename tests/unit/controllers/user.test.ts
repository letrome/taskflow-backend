import * as userController from "@src/controllers/user.js";
import * as userService from "@src/services/user.js";
import { describe, expect, it, vi } from "vitest";
import { createMockRequest, createMockResponse } from "../test-utils.js";

vi.mock("@src/services/user.js");

describe("User Controller", () => {
	describe("getUser", () => {
		it("should return user by id from params", async () => {
			const mockUser = {
				_id: "user-id",
				email: "test@example.com",
				roles: ["ROLE_USER"],
			};

			// biome-ignore lint/suspicious/noExplicitAny: Mock implementation needs access to this
			vi.mocked(userService.getUser).mockResolvedValue(mockUser as any);

			const request = createMockRequest({
				params: { id: "user-id" },
				auth: { userId: "user-id", roles: ["ROLE_USER"] },
			});
			const response = createMockResponse();

			// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			await userController.getUser(request as any, response);

			expect(userService.getUser).toHaveBeenCalledWith("user-id");
			expect(response.status).toHaveBeenCalledWith(200);
			expect(response.json).toHaveBeenCalledWith(mockUser);
		});

		it("should return user by id from auth if params.id is missing", async () => {
			const mockUser = {
				_id: "user-id",
				email: "test@example.com",
				roles: ["ROLE_USER"],
			};

			// biome-ignore lint/suspicious/noExplicitAny: Mock implementation needs access to this
			vi.mocked(userService.getUser).mockResolvedValue(mockUser as any);

			const request = createMockRequest({
				params: {},
				auth: { userId: "user-id", roles: ["ROLE_USER"] },
			});
			const response = createMockResponse();

			// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			await userController.getUser(request as any, response);

			expect(userService.getUser).toHaveBeenCalledWith("user-id");
			expect(response.status).toHaveBeenCalledWith(200);
			expect(response.json).toHaveBeenCalledWith(mockUser);
		});

		it("should call next with error if service fails", async () => {
			const error = new Error("User not found");
			vi.mocked(userService.getUser).mockRejectedValue(error);

			const request = createMockRequest({
				params: { id: "user-id" },
				auth: { userId: "user-id", roles: ["ROLE_USER"] },
			});
			const response = createMockResponse();

			await expect(
				// biome-ignore lint/suspicious/noExplicitAny: Unit tests
				userController.getUser(request as any, response),
			).rejects.toThrow(error);
		});
	});
});
