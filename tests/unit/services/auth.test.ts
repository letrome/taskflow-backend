import * as authService from "@src/services/auth.js";
import User from "@src/services/models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { describe, expect, it, vi } from "vitest";

vi.mock("@src/services/models/user.js", () => {
	const UserMock = vi.fn();
	// biome-ignore lint/suspicious/noExplicitAny: Mock implementation needs access to this
	UserMock.prototype.save = vi.fn().mockImplementation(function (this: any) {
		return Promise.resolve(this);
	});
	Object.assign(UserMock, { findById: vi.fn(), findOne: vi.fn() });
	return { default: UserMock, Roles: { ROLE_USER: "ROLE_USER" } };
});

vi.mock("bcrypt");
vi.mock("jsonwebtoken");

describe("Auth Service", () => {
	describe("register", () => {
		it("should register a user", async () => {
			const user = await authService.register({
				email: "test@example.com",
				password: "password123",
				first_name: "John",
				last_name: "Doe",
			});
			expect(user).toBeDefined();
		});

		it("should throw a conflict error when email already exists", async () => {
			vi.mocked(User.prototype.save).mockRejectedValueOnce({ code: 11000 });
			await expect(
				authService.register({
					email: "test@example.com",
					password: "password123",
					first_name: "John",
					last_name: "Doe",
				}),
			).rejects.toThrowError("Email already exists");
		});

		it("should throw a conflict error when email already exists", async () => {
			vi.mocked(User.prototype.save).mockRejectedValueOnce({ code: 11000 });
			await expect(
				authService.register({
					email: "test@example.com",
					password: "password123",
					first_name: "John",
					last_name: "Doe",
				}),
			).rejects.toThrowError("Email already exists");
		});

		it("should throw a internal server error when if a database error occurs", async () => {
			vi.mocked(User.prototype.save).mockRejectedValueOnce({ code: 10000 });
			await expect(
				authService.register({
					email: "test@example.com",
					password: "password123",
					first_name: "John",
					last_name: "Doe",
				}),
			).rejects.toEqual({ code: 10000 });
		});
	});

	describe("login", () => {
		it("should login a user", async () => {
			vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
			vi.mocked(User.findOne).mockResolvedValueOnce({
				_id: "user-id",
				email: "test@example.com",
				password_hash: "hashed_password",
				roles: ["ROLE_USER"],
				// biome-ignore lint/suspicious/noExplicitAny: Mock implementation needs access to this
			} as any);

			const token = await authService.login({
				email: "test@example.com",
				password: "password123",
			});
			expect(token).toBeDefined();
		});

		it("should throw UnauthorizedError when user is not found", async () => {
			vi.mocked(User.findOne).mockResolvedValue(null);

			await expect(
				authService.login({
					email: "test@example.com",
					password: "password123",
				}),
			).rejects.toThrowError("Invalid email/password combination");
		});

		it("should throw UnauthorizedError when password is invalid", async () => {
			vi.mocked(User.findOne).mockResolvedValue({
				_id: "user-id",
				email: "test@example.com",
				password_hash: "hashed_password",
				roles: ["ROLE_USER"],
				// biome-ignore lint/suspicious/noExplicitAny: Mock implementation needs access to this
			} as any);

			vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

			await expect(
				authService.login({
					email: "test@example.com",
					password: "password123",
				}),
			).rejects.toThrowError("Invalid email/password combination");
		});

		it("should throw InternalServerError when jwt sign fails", async () => {
			vi.mocked(User.findOne).mockResolvedValue({
				_id: "user-id",
				email: "test@example.com",
				password_hash: "hashed_password",
				roles: ["ROLE_USER"],
				// biome-ignore lint/suspicious/noExplicitAny: Mock implementation needs access to this
			} as any);

			vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

			vi.mocked(jwt.sign).mockImplementation(() => {
				throw new Error("JWT sign failed");
			});

			await expect(
				authService.login({
					email: "test@example.com",
					password: "password123",
				}),
			).rejects.toThrowError("JWT sign failed");
		});
	});
});
