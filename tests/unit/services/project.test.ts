import { BadRequestError, NotFoundError } from "@src/core/errors.js";
import Project from "@src/services/models/project.js";
import {
	createProject,
	getProjectForUser,
	getProjectsForUser,
} from "@src/services/project.js";
import { getUser } from "@src/services/user.js";
import { describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("@src/services/user.js");
vi.mock("@src/services/models/project.js", () => {
	const ProjectMock = vi.fn();
	ProjectMock.prototype.save = vi.fn();
	return { default: ProjectMock };
});

describe("Project Service", () => {
	describe("createProject", () => {
		it("should throw BadRequestError when a member does not exist", async () => {
			// Mock getUser to succeed for creator
			// biome-ignore lint/suspicious/noExplicitAny: Mock implementation needs access to this
			vi.mocked(getUser).mockResolvedValueOnce({ _id: "creator-id" } as any);
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
				// biome-ignore lint/suspicious/noExplicitAny: Mock implementation needs access to this
			} as any;

			await expect(createProject(projectData, "creator-id")).rejects.toThrow(
				BadRequestError,
			);

			// Verify getUser was called for the member
			expect(getUser).toHaveBeenCalledWith("invalid-member-id");
		});

		it("should succeed when all users exist", async () => {
			// Mock getUser to succeed for creator and member
			// biome-ignore lint/suspicious/noExplicitAny: Mock implementation needs access to this
			vi.mocked(getUser).mockResolvedValue({ _id: "user-id" } as any);

			const saveMock = vi.fn().mockResolvedValue({ _id: "project-id" });
			// biome-ignore lint/suspicious/noExplicitAny: Mock implementation needs access to this
			vi.mocked(Project).mockImplementation(function (this: any) {
				this.save = saveMock;
				return this;
				// biome-ignore lint/suspicious/noExplicitAny: Mock implementation needs access to this
			} as any);

			const projectData = {
				title: "Test Project",
				members: ["member-id"],
				// biome-ignore lint/suspicious/noExplicitAny: Mock implementation needs access to this
			} as any;

			const result = await createProject(projectData, "creator-id");
			expect(result).toHaveProperty("_id", "project-id");
		});

		it("should throw BadRequestError on Mongoose validation error", async () => {
			// biome-ignore lint/suspicious/noExplicitAny: Mock implementation needs access to this
			vi.mocked(getUser).mockResolvedValue({ _id: "creator-id" } as any);

			const validationError = {
				name: "ValidationError",
				errors: {
					title: { message: "Path `title` is required." },
				},
			};

			const saveMock = vi.fn().mockRejectedValue(validationError);
			// biome-ignore lint/suspicious/noExplicitAny: Mock implementation needs access to this
			vi.mocked(Project).mockImplementation(function (this: any) {
				this.save = saveMock;
				return this;
				// biome-ignore lint/suspicious/noExplicitAny: Mock implementation needs access to this
			} as any);

			const projectData = {
				description: "Missing title",
				// biome-ignore lint/suspicious/noExplicitAny: Mock implementation needs access to this
			} as any;

			await expect(createProject(projectData, "creator-id")).rejects.toThrow(
				BadRequestError,
			);
			await expect(createProject(projectData, "creator-id")).rejects.toThrow(
				/Validation Error: Path `title` is required./,
			);
		});
	});

	describe("getProjectForUser", () => {
		it("should return the project if user is the creator", async () => {
			// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			const user = { _id: "user-id", roles: ["ROLE_USER"] } as any;
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
			// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			const user = { _id: "user-id", roles: ["ROLE_USER"] } as any;
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
			// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			const user = { _id: "manager-id", roles: ["ROLE_MANAGER"] } as any;
			const project = { _id: "project-id", created_by: "other-id" };

			const findByIdMock = vi.fn().mockResolvedValue(project);
			vi.mocked(Project).findById = findByIdMock;

			const result = await getProjectForUser("project-id", user);
			expect(result).toEqual(project);
			expect(findByIdMock).toHaveBeenCalledWith("project-id");
		});

		it("should throw NotFoundError if project is not found", async () => {
			// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			const user = { _id: "user-id", roles: ["ROLE_USER"] } as any;

			vi.mocked(Project).findOne = vi.fn().mockResolvedValue(null);

			await expect(getProjectForUser("project-id", user)).rejects.toThrow(
				NotFoundError,
			);
		});

		it("should throw NotFoundError on CastError (invalid ID)", async () => {
			// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			const user = { _id: "user-id", roles: ["ROLE_USER"] } as any;

			const castError = { name: "CastError" };
			vi.mocked(Project).findOne = vi.fn().mockRejectedValue(castError);

			await expect(getProjectForUser("invalid-id", user)).rejects.toThrow(
				NotFoundError,
			);
		});
	});

	describe("getProjectsForUser", () => {
		it("should return projects where user is creator or member", async () => {
			const userId = "user-id";
			const projects = [
				{ _id: "p1", created_by: "user-id" },
				{ _id: "p2", members: ["user-id"] },
			];

			const findMock = vi.fn().mockResolvedValue(projects);
			vi.mocked(Project).find = findMock;

			const result = await getProjectsForUser(userId);
			expect(result).toEqual(projects);
			expect(findMock).toHaveBeenCalledWith({
				$or: [{ created_by: userId }, { members: userId }],
			});
		});

		it("should return empty array if no projects found", async () => {
			const userId = "user-id";
			vi.mocked(Project).find = vi.fn().mockResolvedValue([]);

			const result = await getProjectsForUser(userId);
			expect(result).toEqual([]);
		});
	});
});
