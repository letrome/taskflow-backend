import { UserRole } from "@src/controllers/schemas/user.js";
import {
	ConflictError,
	NotFoundError,
	UnauthorizedError,
} from "@src/core/errors.js";
import type { IUser } from "@src/services/models/user.js";
import User from "@src/services/models/user.js";
import {
	addConsent,
	createUser,
	deleteUser,
	getUser,
	patchUserInformation,
	removeConsent,
	updateEmail,
	updatePassword,
	updateUserInformation,
} from "@src/services/user.js";
import bcrypt from "bcrypt";
import { describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("bcrypt");

// Mock Mongoose model
vi.mock("@src/services/models/user.js", () => {
	const UserMock = vi.fn();
	UserMock.prototype.save = vi.fn();
	UserMock.prototype.deleteOne = vi.fn();
	// Assign static method to the mock
	Object.assign(UserMock, { findById: vi.fn() });
	return { default: UserMock, Roles: { ROLE_USER: "ROLE_USER" } };
});

describe("User Service", () => {
	describe("createUser", () => {
		const mockUserData = {
			email: "test@example.com",
			password: "password123",
			first_name: "John",
			last_name: "Doe",
			roles: [UserRole.ROLE_USER],
		};

		it("should hash password and create user", async () => {
			vi.mocked(bcrypt.hash).mockResolvedValue("hashed_password" as never);

			const saveMock = vi.fn().mockResolvedValue({
				...mockUserData,
				password_hash: "hashed_password",
				id: "new-user-id",
			});

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

		it("should throw error on generic error", async () => {
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

			await expect(createUser(mockUserData)).rejects.toThrow("DB Error");
		});
	});

	describe("getUser", () => {
		it("should return user if found", async () => {
			const mockUser = { id: "user-id", email: "test@example.com" };
			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(User.findById).mockResolvedValue(mockUser as any);

			const result = await getUser("user-id");

			expect(User.findById).toHaveBeenCalledWith("user-id");
			expect(result).toEqual(mockUser);
		});

		it("should throw NotFoundError if user not found", async () => {
			vi.mocked(User.findById).mockResolvedValue(null);
			await expect(getUser("non-existent-id")).rejects.toThrow(NotFoundError);
		});
	});

	describe("updateUserInformation", () => {
		it("should update user information", async () => {
			const mockUser = {
				first_name: "Original",
				last_name: "Name",
				save: vi.fn().mockResolvedValue({
					first_name: "Updated",
					last_name: "User",
				}),
			};
			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(User.findById).mockResolvedValue(mockUser as any);

			const result = await updateUserInformation("user-id", {
				first_name: "Updated",
				last_name: "User",
			});

			expect(mockUser.first_name).toBe("Updated");
			expect(mockUser.last_name).toBe("User");
			expect(mockUser.save).toHaveBeenCalled();
			expect(result.first_name).toBe("Updated");
		});

		it("should throw NotFoundError if user not found", async () => {
			vi.mocked(User.findById).mockResolvedValue(null);
			await expect(
				updateUserInformation("user-id", {
					first_name: "Updated",
					last_name: "User",
				}),
			).rejects.toThrow(NotFoundError);
		});
	});

	describe("patchUserInformation", () => {
		it("should patch user information", async () => {
			const mockUser = {
				first_name: "Original",
				last_name: "Name",
				save: vi.fn().mockResolvedValue({
					first_name: "Updated",
					last_name: "Name",
				}),
			};
			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(User.findById).mockResolvedValue(mockUser as any);

			const result = await patchUserInformation("user-id", {
				first_name: "Updated",
			});

			expect(mockUser.first_name).toBe("Updated");
			expect(mockUser.last_name).toBe("Name"); // Should remain unchanged
			expect(mockUser.save).toHaveBeenCalled();
			expect(result.first_name).toBe("Updated");
		});

		it("should throw NotFoundError if user not found", async () => {
			vi.mocked(User.findById).mockResolvedValue(null);
			await expect(
				patchUserInformation("user-id", { first_name: "Updated" }),
			).rejects.toThrow(NotFoundError);
		});
	});

	describe("deleteUser", () => {
		it("should delete user", async () => {
			const mockUser = {
				id: "user-id",
				deleteOne: vi.fn(),
			};
			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(User.findById).mockResolvedValue(mockUser as any);

			const result = await deleteUser("user-id");

			expect(User.findById).toHaveBeenCalledWith("user-id");
			expect(mockUser.deleteOne).toHaveBeenCalled();
			expect(result).toEqual(mockUser);
		});

		it("should throw NotFoundError if user not found", async () => {
			vi.mocked(User.findById).mockResolvedValue(null);
			await expect(deleteUser("user-id")).rejects.toThrow(NotFoundError);
		});
	});

	describe("updatePassword", () => {
		it("should update password if old password matches", async () => {
			const mockUser = {
				id: "user-id",
				password_hash: "hashed_old_password",
				save: vi.fn().mockResolvedValue(true),
				// Custom select mock isn't possible directly with simple mock,
				// so we assume findById returns an object with select method?
				// Or since we mock findById directly, we need to handle chain.
			};

			// Mock chainable select
			const mockQuery = {
				select: vi.fn().mockResolvedValue(mockUser),
			};
			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(User.findById).mockReturnValue(mockQuery as any);

			vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
			vi.mocked(bcrypt.hash).mockResolvedValue("hashed_new_password" as never);

			await updatePassword("user-id", {
				old_password: "oldPassword",
				new_password: "newPassword",
			});

			expect(bcrypt.compare).toHaveBeenCalledWith(
				"oldPassword",
				"hashed_old_password",
			);
			expect(bcrypt.hash).toHaveBeenCalledWith("newPassword", 10);
			expect(mockUser.save).toHaveBeenCalled();
		});

		it("should throw UnauthorizedError if old password does not match", async () => {
			const mockUser = {
				password_hash: "hashed_old_password",
			};
			const mockQuery = {
				select: vi.fn().mockResolvedValue(mockUser),
			};
			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(User.findById).mockReturnValue(mockQuery as any);
			vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

			await expect(
				updatePassword("user-id", {
					old_password: "wrongPassword",
					new_password: "newPassword",
				}),
			).rejects.toThrow(UnauthorizedError);
		});

		it("should throw NotFoundError if user not found", async () => {
			const mockQuery = {
				select: vi.fn().mockResolvedValue(null),
			};
			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(User.findById).mockReturnValue(mockQuery as any);

			await expect(
				updatePassword("user-id", {
					old_password: "old",
					new_password: "new",
				}),
			).rejects.toThrow(NotFoundError);
		});
	});

	describe("updateEmail", () => {
		it("should update email if password matches", async () => {
			const mockUser = {
				password_hash: "hashed_password",
				email: "old@example.com",
				save: vi.fn().mockResolvedValue({ email: "new@example.com" }),
			};
			const mockQuery = {
				select: vi.fn().mockResolvedValue(mockUser),
			};
			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(User.findById).mockReturnValue(mockQuery as any);
			vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

			const result = await updateEmail("user-id", {
				email: "new@example.com",
				password: "password",
			});

			expect(mockUser.email).toBe("new@example.com");
			expect(mockUser.save).toHaveBeenCalled();
			expect(result.email).toBe("new@example.com");
		});

		it("should throw UnauthorizedError if password does not match", async () => {
			const mockUser = {
				password_hash: "hashed_password",
			};
			const mockQuery = {
				select: vi.fn().mockResolvedValue(mockUser),
			};
			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(User.findById).mockReturnValue(mockQuery as any);
			vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

			await expect(
				updateEmail("user-id", {
					email: "new@example.com",
					password: "wrong",
				}),
			).rejects.toThrow(UnauthorizedError);
		});

		it("should throw ConflictError on duplicate email", async () => {
			const mockUser = {
				password_hash: "hashed_password",
				email: "old@example.com",
				save: vi
					.fn()
					.mockRejectedValue({ name: "MongoServerError", code: 11000 }),
			};
			const mockQuery = {
				select: vi.fn().mockResolvedValue(mockUser),
			};
			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(User.findById).mockReturnValue(mockQuery as any);
			vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

			await expect(
				updateEmail("user-id", {
					email: "existing@example.com",
					password: "password",
				}),
			).rejects.toThrow(ConflictError);
		});
	});

	describe("addConsent", () => {
		it("should add consent", async () => {
			const mockUser = {
				consent: false,
				save: vi.fn().mockResolvedValue({ consent: true }),
			};
			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(User.findById).mockResolvedValue(mockUser as any);

			const result = await addConsent("user-id");

			expect(mockUser.consent).toBe(true);
			expect(mockUser.save).toHaveBeenCalled();
			expect(result.consent).toBe(true);
		});

		it("should throw NotFoundError if user not found", async () => {
			vi.mocked(User.findById).mockResolvedValue(null);
			await expect(addConsent("user-id")).rejects.toThrow(NotFoundError);
		});
	});

	describe("removeConsent", () => {
		it("should remove consent", async () => {
			const mockUser = {
				consent: true,
				save: vi.fn().mockResolvedValue({ consent: false }),
			};
			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(User.findById).mockResolvedValue(mockUser as any);

			const result = await removeConsent("user-id");

			expect(mockUser.consent).toBe(false);
			expect(mockUser.save).toHaveBeenCalled();
			expect(result.consent).toBe(false);
		});

		it("should throw NotFoundError if user not found", async () => {
			vi.mocked(User.findById).mockResolvedValue(null);
			await expect(removeConsent("user-id")).rejects.toThrow(NotFoundError);
		});
	});
});
