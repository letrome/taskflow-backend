import { addTaskTag, removeTaskTag } from "@src/controllers/task.js";
import { ForbiddenError, NotFoundError } from "@src/core/errors.js";
import type { IProject } from "@src/services/models/project.js";
import type { ITask } from "@src/services/models/task.js";
import type { IUser } from "@src/services/models/user.js";
import * as projectService from "@src/services/project.js";
import * as tagService from "@src/services/tag.js";
import * as taskService from "@src/services/task.js";
import * as userService from "@src/services/user.js";
import type { AuthenticatedRequest } from "@src/types/authenticated-request.js";
import type { Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock services
vi.mock("@src/services/task.js");
vi.mock("@src/services/project.js");
vi.mock("@src/services/user.js");
vi.mock("@src/services/tag.js");

describe("Task Controller - Tags", () => {
	let req: Partial<AuthenticatedRequest<{ id: string; tagId: string }>>;
	let res: Partial<Response>;
	// biome-ignore lint/suspicious/noExplicitAny: mock
	let jsonMock: any;
	// biome-ignore lint/suspicious/noExplicitAny: mock
	let statusMock: any;

	const mockTask = {
		_id: "task-id",
		title: "Test Task",
		project: "project-id",
		assignee: "user-id",
		tags: [],
	} as unknown as ITask;

	const mockProject = {
		_id: "project-id",
		members: ["user-id"],
	} as unknown as IProject;

	const mockUser = {
		_id: "user-id",
	} as unknown as IUser;

	beforeEach(() => {
		vi.clearAllMocks();
		jsonMock = vi.fn();
		statusMock = vi.fn().mockReturnValue({ json: jsonMock });
		res = {
			json: jsonMock,
			status: statusMock,
		};
		req = {
			auth: { userId: "user-id", roles: [] },
			params: { id: "task-id", tagId: "tag-id" },
		};
	});

	describe("addTaskTag", () => {
		it("should add tag if authorized and tag exists for project", async () => {
			vi.mocked(taskService.getTask).mockResolvedValue(mockTask);
			vi.mocked(userService.getUser).mockResolvedValue(mockUser);
			vi.mocked(projectService.getProjectForUser).mockResolvedValue(
				mockProject,
			);
			vi.mocked(tagService.checkTagExistForProject).mockResolvedValue(
				undefined,
			);
			vi.mocked(taskService.addTaskTag).mockResolvedValue(["tag-id"]);

			await addTaskTag(
				req as AuthenticatedRequest<{ id: string; tagId: string }>,
				res as Response,
			);

			expect(taskService.getTask).toHaveBeenCalledWith("task-id");
			expect(tagService.checkTagExistForProject).toHaveBeenCalledWith(
				"tag-id",
				"project-id",
			);
			expect(taskService.addTaskTag).toHaveBeenCalledWith("task-id", "tag-id");
			expect(res.status).toHaveBeenCalledWith(200);
			expect(jsonMock).toHaveBeenCalledWith(["tag-id"]);
		});

		it("should throw ForbiddenError if user checks fail", async () => {
			vi.mocked(taskService.getTask).mockResolvedValue(mockTask);
			vi.mocked(userService.getUser).mockResolvedValue(mockUser);
			vi.mocked(projectService.getProjectForUser).mockRejectedValue(
				new ForbiddenError("Access denied"),
			);

			await expect(
				addTaskTag(
					req as AuthenticatedRequest<{ id: string; tagId: string }>,
					res as Response,
				),
			).rejects.toThrow(ForbiddenError);

			expect(taskService.addTaskTag).not.toHaveBeenCalled();
		});

		it("should fail if tag does not exist for project", async () => {
			vi.mocked(taskService.getTask).mockResolvedValue(mockTask);
			vi.mocked(userService.getUser).mockResolvedValue(mockUser);
			vi.mocked(projectService.getProjectForUser).mockResolvedValue(
				mockProject,
			);
			vi.mocked(tagService.checkTagExistForProject).mockRejectedValue(
				new NotFoundError("Tag not found"),
			);

			await expect(
				addTaskTag(
					req as AuthenticatedRequest<{ id: string; tagId: string }>,
					res as Response,
				),
			).rejects.toThrow(NotFoundError);
			expect(taskService.addTaskTag).not.toHaveBeenCalled();
		});
	});

	describe("removeTaskTag", () => {
		it("should remove tag if authorized", async () => {
			vi.mocked(taskService.getTask).mockResolvedValue(mockTask);
			vi.mocked(userService.getUser).mockResolvedValue(mockUser);
			vi.mocked(projectService.getProjectForUser).mockResolvedValue(
				mockProject,
			);
			vi.mocked(taskService.removeTaskTag).mockResolvedValue([]);

			await removeTaskTag(
				req as AuthenticatedRequest<{ id: string; tagId: string }>,
				res as Response,
			);

			expect(taskService.removeTaskTag).toHaveBeenCalledWith(
				"task-id",
				"tag-id",
			);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(jsonMock).toHaveBeenCalledWith([]);
		});
	});
});
