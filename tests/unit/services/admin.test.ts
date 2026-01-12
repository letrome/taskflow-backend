import {
	ConflictError,
	InternalServerError,
	NotFoundError,
} from "@src/core/errors.js";

import { createUser, getUser } from "@src/services/admin.js";
import type { IUser } from "@src/services/models/user.js";
import User, { Roles } from "@src/services/models/user.js";
import bcrypt from "bcrypt";
import { describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("bcrypt");

// Define types for the mocked User model

// Mock Mongoose model
vi.mock("@src/services/models/user.js", () => {
	const UserMock = vi.fn();
	UserMock.prototype.save = vi.fn();
	// Assign static method to the mock
	Object.assign(UserMock, { findById: vi.fn() });
	return { default: UserMock, Roles: { ROLE_USER: "ROLE_USER" } };
});

describe("Admin Service", () => {
	describe("createUser", () => {
		const mockUserData = {
			email: "test@example.com",
			password: "password123",
			first_name: "John",
			last_name: "Doe",
			roles: [Roles.ROLE_USER],
		};

		it("should hash password and create user", async () => {
			vi.mocked(bcrypt.hash).mockResolvedValue("hashed_password" as never);

			// Mock save to return the user instance (or whatever is needed)
			const saveMock = vi.fn().mockResolvedValue({
				...mockUserData,
				password_hash: "hashed_password",
				id: "new-user-id",
			});

			// Update the mock implementation for this test
			// biome-ignore lint/complexity/useArrowFunction: Used as mock constructor
			vi.mocked(User).mockImplementation(function (data: Partial<IUser>) {
				const mockInstance = {
					...mockUserData,
					...data,
					save: saveMock,
				};
				return mockInstance as unknown as IUser;
			} as unknown as typeof User);

			const result = await createUser(mockUserData);

			expect(bcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 10);
			expect(User).toHaveBeenCalledWith(
				expect.objectContaining({
					email: mockUserData.email,
					password_hash: "hashed_password",
				}),
			);
			expect(saveMock).toHaveBeenCalled();
			expect(result).toHaveProperty("id", "new-user-id");
		});

		it("should throw ConflictError on duplicate email", async () => {
			vi.mocked(bcrypt.hash).mockResolvedValue("hashed_password" as never);

			// Mock save to throw duplicate error
			const duplicateError = { name: "MongoServerError", code: 11000 };

			const saveMock = vi.fn().mockRejectedValue(duplicateError);

			// biome-ignore lint/complexity/useArrowFunction: Used as mock constructor
			vi.mocked(User).mockImplementation(function (data: Partial<IUser>) {
				const mockInstance = {
					...data,
					save: saveMock,
				};
				return mockInstance as unknown as IUser;
			} as unknown as typeof User);

			await expect(createUser(mockUserData)).rejects.toThrow(ConflictError);
		});

		it("should throw InternalServerError on generic error", async () => {
			vi.mocked(bcrypt.hash).mockResolvedValue("hashed_password" as never);

			const saveMock = vi.fn().mockRejectedValue(new Error("DB Error"));

			// biome-ignore lint/complexity/useArrowFunction: Used as mock constructor
			vi.mocked(User).mockImplementation(function (data: Partial<IUser>) {
				const mockInstance = {
					...data,
					save: saveMock,
				};
				return mockInstance as unknown as IUser;
			} as unknown as typeof User);

			await expect(createUser(mockUserData)).rejects.toThrow(
				InternalServerError,
			);
		});
	});

	describe("getUser", () => {
		it("should return user if found", async () => {
			const mockUser = { id: "user-id", email: "test@example.com" };
			// User.findById is static, so we mock it on the class
			vi.mocked(User.findById).mockResolvedValue(mockUser);

			const result = await getUser("user-id");

			expect(User.findById).toHaveBeenCalledWith("user-id");
			expect(result).toEqual(mockUser);
		});

		it("should throw NotFoundError if user not found", async () => {
			vi.mocked(User.findById).mockResolvedValue(null);

			await expect(getUser("non-existent-id")).rejects.toThrow(NotFoundError);
		});

		it("should throw NotFoundError on CastError (invalid ID)", async () => {
			const castError = { name: "CastError" };
			vi.mocked(User.findById).mockRejectedValue(castError);

			await expect(getUser("invalid-id")).rejects.toThrow(NotFoundError);
		});

		it("should throw InternalServerError on generic DB error", async () => {
			vi.mocked(User.findById).mockRejectedValue(
				new Error("DB Connection Failed"),
			);

			await expect(getUser("user-id")).rejects.toThrow(InternalServerError);
		});
	});
});
