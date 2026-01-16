import type { CreateOrUpdateProjectDTO } from "@src/controllers/schemas/project.js";
import {
	BadRequestError,
	InternalServerError,
	NotFoundError,
} from "@src/core/errors.js";
import Project from "@src/services/models/project.js";
import { type IUser, Roles } from "@src/services/models/user.js";
import {
	createProject,
	deleteProject,
	getProjectForUser,
	getProjectsForUser,
	patchProject,
	updateProject,
} from "@src/services/project.js";
import { getUser } from "@src/services/user.js";
import { describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("@src/services/user.js");
vi.mock("@src/core/logger.js");
vi.mock("@src/services/models/project.js", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@src/services/models/project.js")>();
	const ProjectMock = vi.fn();
	ProjectMock.prototype.save = vi.fn();
	return {
		...actual,
		default: ProjectMock,
	};
});

describe("Project Service", () => {
	describe("createProject", () => {
		it("should throw BadRequestError when a member does not exist", async () => {
			// Mock getUser to succeed for creator
			vi.mocked(getUser).mockResolvedValueOnce({
				_id: "creator-id",
			} as unknown as IUser);
			// Mock getUser to fail for member
			vi.mocked(getUser).mockRejectedValueOnce(
				new NotFoundError("User not found"),
			);

			const projectData = {
				title: "Test Project",
				description: "Desc",
				start_date: new Date(),
				end_date: new Date(),
				status: "active",
				members: ["invalid-member-id"],
			};

			await expect(
				createProject(
					projectData as unknown as CreateOrUpdateProjectDTO,
					"creator-id",
				),
			).rejects.toThrow(BadRequestError);

			// Verify getUser was called for the member
			expect(getUser).toHaveBeenCalledWith("invalid-member-id");
		});

		it("should succeed when all users exist", async () => {
			// Mock getUser to succeed for creator and member
			vi.mocked(getUser).mockResolvedValue({
				_id: "user-id",
			} as unknown as IUser);

			const saveMock = vi.fn().mockResolvedValue({ _id: "project-id" });
			vi.mocked(Project).mockImplementation(
				class {
					save = saveMock;
				} as unknown as typeof Project,
			);

			const projectData = {
				title: "Test Project",
				members: ["member-id"],
			};

			const result = await createProject(
				projectData as unknown as CreateOrUpdateProjectDTO,
				"creator-id",
			);
			expect(result).toHaveProperty("_id", "project-id");
		});

		it("should throw BadRequestError on Mongoose validation error", async () => {
			vi.mocked(getUser).mockResolvedValue({
				_id: "creator-id",
			} as unknown as IUser);

			const validationError = {
				name: "ValidationError",
				errors: {
					title: { message: "Path `title` is required." },
				},
			};

			const saveMock = vi.fn().mockRejectedValue(validationError);
			vi.mocked(Project).mockImplementation(
				class {
					save = saveMock;
				} as unknown as typeof Project,
			);

			const projectData = {
				description: "Missing title",
			};

			await expect(
				createProject(
					projectData as unknown as CreateOrUpdateProjectDTO,
					"creator-id",
				),
			).rejects.toThrow(BadRequestError);
			await expect(
				createProject(
					projectData as unknown as CreateOrUpdateProjectDTO,
					"creator-id",
				),
			).rejects.toThrow(/Validation Error: Path `title` is required./);
		});

		it("should throw InternalServerError on generic error", async () => {
			vi.mocked(getUser).mockResolvedValue({
				_id: "creator-id",
			} as unknown as IUser);

			const genericError = new Error("Database fail");
			const saveMock = vi.fn().mockRejectedValue(genericError);
			vi.mocked(Project).mockImplementation(
				class {
					save = saveMock;
				} as unknown as typeof Project,
			);

			const projectData = {
				title: "Test Project",
			};

			await expect(
				createProject(
					projectData as unknown as CreateOrUpdateProjectDTO,
					"creator-id",
				),
			).rejects.toThrow(InternalServerError);
		});
	});

	describe("getProjectForUser", () => {
		it("should return the project if user is the creator", async () => {
			const user = {
				_id: "user-id",
				roles: ["ROLE_USER"],
			} as unknown as IUser;
			const project = { _id: "project-id", created_by: "user-id" };

			const findOneMock = vi.fn().mockResolvedValue(project);
			vi.mocked(Project).findOne = findOneMock;

			const result = await getProjectForUser("project-id", user);
			expect(result).toEqual(project);
			expect(findOneMock).toHaveBeenCalledWith({
				_id: "project-id",
				$or: [{ created_by: "user-id" }, { members: "user-id" }],
			});
		});

		it("should return the project if user is a member", async () => {
			const user = {
				_id: "user-id",
				roles: ["ROLE_USER"],
			} as unknown as IUser;
			const project = {
				_id: "project-id",
				created_by: "other-id",
				members: ["user-id"],
			};

			const findOneMock = vi.fn().mockResolvedValue(project);
			vi.mocked(Project).findOne = findOneMock;

			const result = await getProjectForUser("project-id", user);
			expect(result).toEqual(project);
		});

		it("should return the project if user is a manager", async () => {
			const user = {
				_id: "manager-id",
				roles: ["ROLE_MANAGER"],
			} as unknown as IUser;
			const project = { _id: "project-id", created_by: "other-id" };

			const findByIdMock = vi.fn().mockResolvedValue(project);
			vi.mocked(Project).findById = findByIdMock;

			const result = await getProjectForUser("project-id", user);
			expect(result).toEqual(project);
			expect(findByIdMock).toHaveBeenCalledWith("project-id");
		});

		it("should throw NotFoundError if project is not found", async () => {
			const user = {
				_id: "user-id",
				roles: ["ROLE_USER"],
			} as unknown as IUser;

			vi.mocked(Project).findOne = vi.fn().mockResolvedValue(null);

			await expect(getProjectForUser("project-id", user)).rejects.toThrow(
				NotFoundError,
			);
		});

		it("should throw NotFoundError on CastError (invalid ID)", async () => {
			const user = {
				_id: "user-id",
				roles: ["ROLE_USER"],
			} as unknown as IUser;

			const castError = { name: "CastError" };
			vi.mocked(Project).findOne = vi.fn().mockRejectedValue(castError);

			await expect(getProjectForUser("invalid-id", user)).rejects.toThrow(
				NotFoundError,
			);
		});

		it("should throw InternalServerError on generic error", async () => {
			const user = {
				_id: "user-id",
				roles: ["ROLE_USER"],
			} as unknown as IUser;

			const genericError = new Error("DB Error");
			vi.mocked(Project).findOne = vi.fn().mockRejectedValue(genericError);

			await expect(getProjectForUser("project-id", user)).rejects.toThrow(
				InternalServerError,
			);
		});
	});

	describe("getProjectsForUser", () => {
		it("should return projects where user is creator or member", async () => {
			const iuser: IUser = {
				_id: "user-id",
				roles: [Roles.ROLE_USER],
			} as unknown as IUser;
			const projects = [
				{ _id: "p1", created_by: "user-id" },
				{ _id: "p2", members: ["user-id"] },
			];

			const findMock = vi.fn().mockResolvedValue(projects);
			vi.mocked(Project).find = findMock;

			const result = await getProjectsForUser(iuser);
			expect(result).toEqual(projects);
			expect(findMock).toHaveBeenCalledWith({
				$or: [{ created_by: iuser._id }, { members: iuser._id }],
			});
		});

		it("should return all projects if user is a manager", async () => {
			const iuser: IUser = {
				_id: "manager-id",
				roles: [Roles.ROLE_MANAGER],
			} as unknown as IUser;
			const projects = [
				{ _id: "p1", created_by: "user-id" },
				{ _id: "p2", members: ["other-id"] },
			];

			const findMock = vi.fn().mockResolvedValue(projects);
			vi.mocked(Project).find = findMock;

			const result = await getProjectsForUser(iuser);
			expect(result).toEqual(projects);
			expect(findMock).toHaveBeenCalledWith({});
		});

		it("should return empty array if no projects found", async () => {
			const iuser = {
				_id: "user-id",
				roles: [Roles.ROLE_USER],
			} as unknown as IUser;
			vi.mocked(Project).find = vi.fn().mockResolvedValue([]);

			const result = await getProjectsForUser(iuser);
			expect(result).toEqual([]);
		});
	});

	describe("updateProject", () => {
		it("should update project if user is authorized", async () => {
			// user is authorized (creator)
			const user = {
				_id: "user-id",
				roles: [Roles.ROLE_USER],
			} as unknown as IUser;
			const projectData = { title: "Updated Title", members: [] };

			const projectMock = {
				_id: "project-id",
				created_by: "user-id",
				title: "Old Title",
				// Using mockResolvedValue for save
				save: vi.fn().mockResolvedValue({
					_id: "project-id",
					...projectData,
				}),
			};

			vi.mocked(Project).findById = vi.fn().mockResolvedValue(projectMock);
			vi.mocked(getUser).mockResolvedValue({
				_id: "user-id",
			} as unknown as IUser);

			const result = await updateProject(
				"project-id",
				user,
				projectData as unknown as CreateOrUpdateProjectDTO,
			);
			expect(result.title).toBe("Updated Title");
			expect(projectMock.save).toHaveBeenCalled();
		});

		it("should update project with end_date", async () => {
			const user = {
				_id: "user-id",
				roles: [Roles.ROLE_USER],
			} as unknown as IUser;
			const endDate = new Date();
			const projectData = { title: "Updated", members: [], end_date: endDate };

			const projectMock = {
				_id: "project-id",
				created_by: "user-id",
				title: "Old",
				save: vi.fn().mockResolvedValue({ ...projectData }),
			};

			vi.mocked(Project).findById = vi.fn().mockResolvedValue(projectMock);
			vi.mocked(getUser).mockResolvedValue({
				_id: "user-id",
			} as unknown as IUser);

			const result = await updateProject(
				"project-id",
				user,
				projectData as unknown as CreateOrUpdateProjectDTO,
			);
			expect(result.end_date).toEqual(endDate);
		});

		it("should update project with members", async () => {
			const user = {
				_id: "user-id",
				roles: [Roles.ROLE_USER],
			} as unknown as IUser;
			const memberId = "507f1f77bcf86cd799439011";
			const projectData = { title: "Updated", members: [memberId] };

			const projectMock = {
				_id: "project-id",
				created_by: "user-id",
				title: "Old",
				members: [],
				save: vi.fn().mockResolvedValue({ ...projectData }),
			};

			vi.mocked(Project).findById = vi.fn().mockResolvedValue(projectMock);
			vi.mocked(getUser).mockResolvedValue({
				_id: memberId,
			} as unknown as IUser);

			const result = await updateProject(
				"project-id",
				user,
				projectData as unknown as CreateOrUpdateProjectDTO,
			);
			expect(getUser).toHaveBeenCalledWith(memberId);
			expect(result.members).toEqual([memberId]);
		});

		it("should throw BadRequestError if updating with non-existent member", async () => {
			const user = {
				_id: "user-id",
				roles: [Roles.ROLE_USER],
			} as unknown as IUser;
			const projectData = { title: "Updated", members: ["invalid-id"] };

			// getUser throws NotFoundError for invalid-id
			vi.mocked(getUser).mockRejectedValue(new NotFoundError("User not found"));

			await expect(
				updateProject(
					"project-id",
					user,
					projectData as unknown as CreateOrUpdateProjectDTO,
				),
			).rejects.toThrow(BadRequestError);
			await expect(
				updateProject(
					"project-id",
					user,
					projectData as unknown as CreateOrUpdateProjectDTO,
				),
			).rejects.toThrow("One or more members do not exist");
		});

		it("should throw BadRequestError on Mongoose validation error during update", async () => {
			const user = {
				_id: "user-id",
				roles: [Roles.ROLE_USER],
			} as unknown as IUser;
			const projectData = { title: "Updated", members: [] };

			const projectMock = {
				_id: "project-id",
				created_by: "user-id",
				save: vi.fn().mockRejectedValue({
					name: "ValidationError",
					errors: {
						title: { message: "Title invalid" },
					},
				}),
			};

			vi.mocked(Project).findById = vi.fn().mockResolvedValue(projectMock);
			vi.mocked(getUser).mockResolvedValue({
				_id: "user-id",
			} as unknown as IUser);

			await expect(
				updateProject(
					"project-id",
					user,
					projectData as unknown as CreateOrUpdateProjectDTO,
				),
			).rejects.toThrow(BadRequestError);
			await expect(
				updateProject(
					"project-id",
					user,
					projectData as unknown as CreateOrUpdateProjectDTO,
				),
			).rejects.toThrow(/Validation Error: Title invalid/);
		});

		it("should throw NotFoundError on CastError", async () => {
			const user = {
				_id: "user-id",
				roles: [Roles.ROLE_USER],
			} as unknown as IUser;
			vi.mocked(getUser).mockResolvedValue({
				_id: "user-id",
			} as unknown as IUser);

			const castError = { name: "CastError" };
			vi.mocked(Project).findById = vi.fn().mockRejectedValue(castError);

			await expect(
				updateProject("invalid-id", user, {
					title: "New",
				} as unknown as CreateOrUpdateProjectDTO),
			).rejects.toThrow(NotFoundError);
		});

		it("should throw NotFoundError if project not found or not authorized", async () => {
			const user = {
				_id: "user-id",
				roles: [Roles.ROLE_USER],
			} as unknown as IUser;

			vi.mocked(Project).findById = vi.fn().mockResolvedValue(null);
			vi.mocked(getUser).mockResolvedValue({
				_id: "user-id",
			} as unknown as IUser);

			await expect(
				updateProject("project-id", user, {
					title: "New",
				} as unknown as CreateOrUpdateProjectDTO),
			).rejects.toThrow(NotFoundError);
		});

		it("should throw InternalServerError on generic error", async () => {
			const user = {
				_id: "user-id",
				roles: [Roles.ROLE_USER],
			} as unknown as IUser;
			vi.mocked(getUser).mockResolvedValue({
				_id: "user-id",
			} as unknown as IUser);

			const genericError = new Error("DB fail");
			vi.mocked(Project).findById = vi.fn().mockRejectedValue(genericError);

			await expect(
				updateProject("project-id", user, {
					title: "New",
				} as unknown as CreateOrUpdateProjectDTO),
			).rejects.toThrow(InternalServerError);
		});
	});

	describe("patchProject", () => {
		it("should partially update project", async () => {
			const user = {
				_id: "user-id",
				roles: [Roles.ROLE_USER],
			} as unknown as IUser;
			const projectMock = {
				_id: "project-id",
				created_by: "user-id",
				title: "Old Title",
				description: "Old Desc",
				save: vi.fn().mockResolvedValue({
					_id: "project-id",
					title: "New Title",
					description: "Old Desc",
				}),
			};

			vi.mocked(Project).findById = vi.fn().mockResolvedValue(projectMock);
			vi.mocked(getUser).mockResolvedValue({
				_id: "user-id",
			} as unknown as IUser);

			const result = await patchProject("project-id", user, {
				title: "New Title",
			});
			expect(result.title).toBe("New Title");
			expect(projectMock.title).toBe("New Title");
			expect(projectMock.save).toHaveBeenCalled();
		});

		it("should patch project members", async () => {
			const user = {
				_id: "user-id",
				roles: [Roles.ROLE_USER],
			} as unknown as IUser;
			const memberId = "507f1f77bcf86cd799439011";
			const projectMock = {
				_id: "project-id",
				created_by: "user-id",
				members: [],
				save: vi.fn().mockResolvedValue({
					_id: "project-id",
					members: [memberId],
				}),
			};

			vi.mocked(Project).findById = vi.fn().mockResolvedValue(projectMock);
			vi.mocked(getUser).mockResolvedValue({
				_id: memberId,
			} as unknown as IUser);

			const result = await patchProject("project-id", user, {
				members: [memberId],
			});
			expect(getUser).toHaveBeenCalledWith(memberId);
			expect(result.members).toEqual([memberId]);
		});

		it("should throw NotFoundError on CastError", async () => {
			const user = {
				_id: "user-id",
				roles: [Roles.ROLE_USER],
			} as unknown as IUser;
			vi.mocked(getUser).mockResolvedValue({
				_id: "user-id",
			} as unknown as IUser);

			const castError = { name: "CastError" };
			vi.mocked(Project).findById = vi.fn().mockRejectedValue(castError);

			await expect(
				patchProject("invalid-id", user, { title: "New" }),
			).rejects.toThrow(NotFoundError);
		});

		it("should rethrow NotFoundError", async () => {
			const user = {
				_id: "user-id",
				roles: [Roles.ROLE_USER],
			} as unknown as IUser;
			vi.mocked(getUser).mockResolvedValue({
				_id: "user-id",
			} as unknown as IUser);
			vi.mocked(Project).findById = vi.fn().mockResolvedValue(null);

			await expect(patchProject("p1", user, { title: "New" })).rejects.toThrow(
				NotFoundError,
			);
		});

		it("should throw InternalServerError on generic error", async () => {
			const user = {
				_id: "user-id",
				roles: [Roles.ROLE_USER],
			} as unknown as IUser;
			vi.mocked(getUser).mockResolvedValue({
				_id: "user-id",
			} as unknown as IUser);

			const genericError = new Error("Database failure");
			vi.mocked(Project).findById = vi.fn().mockRejectedValue(genericError);

			await expect(patchProject("p1", user, { title: "New" })).rejects.toThrow(
				InternalServerError,
			);
		});
	});

	describe("deleteProject", () => {
		it("should delete project if authorized", async () => {
			const user = {
				_id: "user-id",
				roles: [Roles.ROLE_USER],
			} as unknown as IUser;
			const deleteOneMock = vi.fn().mockResolvedValue({});
			const projectMock = {
				_id: "project-id",
				created_by: "user-id",
				deleteOne: deleteOneMock,
			};

			vi.mocked(getUser).mockResolvedValue(user);
			vi.mocked(Project).findOne = vi.fn().mockResolvedValue(projectMock);

			const result = await deleteProject("project-id", "user-id");
			expect(result).toEqual(projectMock);
			expect(deleteOneMock).toHaveBeenCalled();
		});

		it("should throw NotFoundError if project not found", async () => {
			const user = {
				_id: "user-id",
				roles: [Roles.ROLE_USER],
			} as unknown as IUser;
			vi.mocked(getUser).mockResolvedValue(user);
			vi.mocked(Project).findOne = vi.fn().mockResolvedValue(null);

			await expect(deleteProject("project-id", "user-id")).rejects.toThrow(
				NotFoundError,
			);
		});

		it("should throw NotFoundError on CastError", async () => {
			const user = {
				_id: "user-id",
				roles: [Roles.ROLE_USER],
			} as unknown as IUser;
			vi.mocked(getUser).mockResolvedValue(user);

			const castError = { name: "CastError" };
			vi.mocked(getUser).mockRejectedValueOnce(castError);

			await expect(deleteProject("p1", "invalid-user-id")).rejects.toThrow(
				NotFoundError,
			);
		});

		it("should throw InternalServerError on generic error", async () => {
			const user = {
				_id: "user-id",
				roles: [Roles.ROLE_USER],
			} as unknown as IUser;
			vi.mocked(getUser).mockResolvedValue(user);

			const genericError = new Error("Database failure");
			vi.mocked(Project).findOne = vi.fn().mockRejectedValue(genericError);

			await expect(deleteProject("p1", "user-id")).rejects.toThrow(
				InternalServerError,
			);
		});
	});
});
