import { TaskState } from "@src/controllers/schemas/task.js";
import {
	deleteTask,
	getTask,
	patchTask,
	setTaskStatus,
} from "@src/controllers/task.js";
import { ForbiddenError } from "@src/core/errors.js";
import type { IProject } from "@src/services/models/project.js";
import type { ITask } from "@src/services/models/task.js";
import type { IUser } from "@src/services/models/user.js";
import * as projectService from "@src/services/project.js";
import * as taskService from "@src/services/task.js";
import * as userService from "@src/services/user.js";
import type { AuthenticatedRequest } from "@src/types/authenticated-request.js";
import type { Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock services
vi.mock("@src/services/task.js");
vi.mock("@src/services/project.js");
vi.mock("@src/services/user.js");

describe("Task Controller", () => {
	let req: Partial<AuthenticatedRequest>;
	let res: Partial<Response>;
	// biome-ignore lint/suspicious/noExplicitAny: mock
	let jsonMock: any;
	// biome-ignore lint/suspicious/noExplicitAny: mock
	let statusMock: any;

	const mockTask = {
		_id: "task-id",
		title: "Test Task",
		description: "Test Description",
		priority: "MEDIUM",
		state: "OPEN",
		project: "project-id",
		assignee: "user-id",
		tags: [],
	} as unknown as ITask;

	const mockProject = {
		_id: "project-id",
		members: ["user-id"],
	};

	const mockUser = {
		_id: "user-id",
	};

	beforeEach(() => {
		vi.clearAllMocks();
		jsonMock = vi.fn();
		statusMock = vi.fn().mockReturnValue({ json: jsonMock });
		res = {
			json: jsonMock,
			status: statusMock,
		};
		req = {
			auth: { userId: "user-id" },
			params: {},
			body: {},
		};
	});

	describe("getTask", () => {
		it("should return task if user is authorized", async () => {
			req.params = { id: "task-id" };
			vi.mocked(taskService.getTask).mockResolvedValue(mockTask);
			// Mock permission check helpers implicitly by mocking services they call
			// checkUserCanReadOrUpdateTask calls:
			// 1. getTask(taskId) -> returns mockTask
			// 2. userService.getUser(userId) -> returns mockUser
			// 3. projectService.getProjectForUser(projectId, userId) -> returns mockProject

			vi.mocked(userService.getUser).mockResolvedValue(
				mockUser as unknown as IUser,
			);

			vi.mocked(projectService.getProjectForUser).mockResolvedValue(
				mockProject as unknown as IProject,
			);

			await getTask(req as AuthenticatedRequest, res as Response);

			expect(taskService.getTask).toHaveBeenCalledWith("task-id");
			expect(res.json).toHaveBeenCalledWith(mockTask);
		});

		it("should throw ForbiddenError if user checks fail (simulated by failing getProjectForUser)", async () => {
			// If getProjectForUser returns null, usually ForbiddenError is thrown by the helper
			// But wait, getProjectForUser returns project or null.
			// Logic in controller:
			// const task = await taskService.getTask(req.params.id);
			// await checkUserCanReadOrUpdateTask(req.auth.userId, task);

			// checkUserCanReadOrUpdateTask:
			// const user = await userService.getUser(userId);
			// const project = await projectService.getProjectForUser(task.project.toString(), userId);
			// if (!project) throw new ForbiddenError("User is not a member of the project");

			// If user is assignee, they have access regardless of project membership (based on implementation found)
			// So we must ensure user is NOT assignee
			const anotherUserId = "another-user-id";
			req.auth = { userId: anotherUserId, roles: [] };

			req.params = { id: "task-id" };
			// Mock task with different assignee
			const taskWithDifferentAssignee = { ...mockTask, assignee: "user-id" };

			vi.mocked(taskService.getTask).mockResolvedValue(
				taskWithDifferentAssignee as ITask,
			);

			vi.mocked(userService.getUser).mockResolvedValue(
				mockUser as unknown as IUser,
			);
			vi.mocked(projectService.getProjectForUser).mockRejectedValue(
				new ForbiddenError("User is not a member of the project"),
			);

			await expect(
				getTask(req as AuthenticatedRequest, res as Response),
			).rejects.toThrow(ForbiddenError);
		});
	});

	describe("patchTask", () => {
		it("should patch task if authorized", async () => {
			req.params = { id: "task-id" };
			req.body = { title: "New Title" };

			vi.mocked(userService.getUser).mockResolvedValue(
				mockUser as unknown as IUser,
			);
			vi.mocked(taskService.getTask).mockResolvedValue(mockTask); // For check permission

			vi.mocked(projectService.getProjectForUser).mockResolvedValue(
				mockProject as unknown as IProject,
			);
			vi.mocked(taskService.patchTask).mockResolvedValue({
				...mockTask,
				title: "New Title",
			} as ITask);

			await patchTask(req as AuthenticatedRequest, res as Response);

			expect(taskService.patchTask).toHaveBeenCalledWith("task-id", req.body);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({ title: "New Title" }),
			);
		});
	});

	describe("setTaskStatus", () => {
		it("should set task status", async () => {
			req.params = { id: "task-id", state: "IN_PROGRESS" };

			vi.mocked(userService.getUser).mockResolvedValue(
				mockUser as unknown as IUser,
			);
			vi.mocked(taskService.getTask).mockResolvedValue(mockTask);

			vi.mocked(projectService.getProjectForUser).mockResolvedValue(
				mockProject as unknown as IProject,
			);
			vi.mocked(taskService.patchTask).mockResolvedValue({
				...mockTask,
				state: "IN_PROGRESS",
			} as ITask); // setTaskStatus calls patchTask internally or uses specific method?
			// Checking controller implementation: setTaskStatus calls taskService.patchTask(id, { state })

			await setTaskStatus(req as AuthenticatedRequest, res as Response);

			expect(taskService.patchTask).toHaveBeenCalledWith("task-id", {
				state: TaskState.IN_PROGRESS,
			});
			expect(res.json).toHaveBeenCalled();
		});
	});

	describe("deleteTask", () => {
		it("should delete task if authorized", async () => {
			req.params = { id: "task-id" };

			vi.mocked(userService.getUser).mockResolvedValue(
				mockUser as unknown as IUser,
			);
			vi.mocked(taskService.getTask).mockResolvedValue(mockTask);

			vi.mocked(projectService.getProjectForUser).mockResolvedValue(
				mockProject as unknown as IProject,
			);
			vi.mocked(taskService.deleteTask).mockResolvedValue(mockTask);

			await deleteTask(req as AuthenticatedRequest, res as Response);

			expect(taskService.deleteTask).toHaveBeenCalledWith("task-id");
			expect(res.json).toHaveBeenCalledWith(mockTask);
		});
	});

	// createProjectTask is imported from project.ts controller usually?
	// Ah, createProjectTask is in src/controllers/project.ts, not task.ts.
	// So we don't test it here.
});
