import { TaskPriority, TaskState } from "@src/controllers/schemas/task.js";
import { BadRequestError, NotFoundError } from "@src/core/errors.js";
import Task, {
	type ITask,
	isAssigneeDoesNotExistError,
	isTagDoesNotExistError,
	Priority,
	State,
} from "@src/services/models/task.js";
import {
	createTask,
	deleteTask,
	getTask,
	getTasksForProject,
	patchTask,
} from "@src/services/task.js";
import mongoose from "mongoose";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

// Mock the Task model
vi.mock("@src/services/models/task.js", async () => {
	const actual = await vi.importActual("@src/services/models/task.js");
	// biome-ignore lint/suspicious/noExplicitAny: Mocking static (mongoose model) methods requires casting to any or a complex type
	const MockTask = vi.fn() as any;
	MockTask.find = vi.fn();
	MockTask.findById = vi.fn();
	MockTask.findByIdAndDelete = vi.fn();
	return {
		...actual,
		default: MockTask,
		isAssigneeDoesNotExistError: vi.fn(),
		isTagDoesNotExistError: vi.fn(),
	};
});

describe("Task Service", () => {
	const mockSave = vi.fn();

	// Mock instance of Task
	const mockTaskInstance = {
		save: mockSave,
		title: "Old Title",
		description: "Old Description",
		priority: Priority.MEDIUM,
		state: State.OPEN,
		tags: [],
		project: new mongoose.Types.ObjectId(),
	} as unknown as ITask;

	beforeEach(() => {
		vi.clearAllMocks();
		// Reset MockTask implementation for constructor
		(Task as unknown as Mock).mockImplementation(function (this: unknown) {
			return mockTaskInstance;
		});
	});

	describe("createTask", () => {
		const validTaskData = {
			title: "New Task",
			description: "Description",
			priority: TaskPriority.HIGH,
			state: TaskState.OPEN,
			tags: [],
		};
		const projectId = new mongoose.Types.ObjectId().toString();

		it("should create and save a new task", async () => {
			mockSave.mockResolvedValue(mockTaskInstance);

			const result = await createTask(validTaskData, projectId);

			expect(Task).toHaveBeenCalledWith(
				expect.objectContaining({
					title: validTaskData.title,
					project: projectId, // Passed as string but stored as string or ObjectId depending on schema/mapper
				}),
			);
			expect(mockSave).toHaveBeenCalled();
			expect(result).toBe(mockTaskInstance);
		});

		it("should throw BadRequestError if assignee does not exist", async () => {
			const error = new Error("Validation Error");
			mockSave.mockRejectedValue(error);
			(isAssigneeDoesNotExistError as unknown as Mock).mockReturnValue(true);

			await expect(createTask(validTaskData, projectId)).rejects.toThrow(
				BadRequestError,
			);
			await expect(createTask(validTaskData, projectId)).rejects.toThrow(
				"Assignee does not exist",
			);
		});

		it("should throw BadRequestError if tag does not exist", async () => {
			const error = new Error("Validation Error");
			mockSave.mockRejectedValue(error);
			(isAssigneeDoesNotExistError as unknown as Mock).mockReturnValue(false);
			(isTagDoesNotExistError as unknown as Mock).mockReturnValue(true);

			await expect(createTask(validTaskData, projectId)).rejects.toThrow(
				BadRequestError,
			);
			await expect(createTask(validTaskData, projectId)).rejects.toThrow(
				"Tag does not exist",
			);
		});

		it("should throw other errors", async () => {
			const error = new Error("Database Error");
			mockSave.mockRejectedValue(error);
			(isAssigneeDoesNotExistError as unknown as Mock).mockReturnValue(false);
			(isTagDoesNotExistError as unknown as Mock).mockReturnValue(false);

			await expect(createTask(validTaskData, projectId)).rejects.toThrow(
				"Database Error",
			);
		});
	});

	describe("getTasksForProject", () => {
		it("should return tasks for a project", async () => {
			const tasks = [mockTaskInstance];
			(Task.find as Mock).mockResolvedValue(tasks);
			const projectId = "project-id";

			const result = await getTasksForProject(projectId);

			expect(Task.find).toHaveBeenCalledWith({ project: projectId });
			expect(result).toBe(tasks);
		});
	});

	describe("getTask", () => {
		it("should return a task by id", async () => {
			(Task.findById as Mock).mockResolvedValue(mockTaskInstance);
			const taskId = "task-id";

			const result = await getTask(taskId);

			expect(Task.findById).toHaveBeenCalledWith(taskId);
			expect(result).toBe(mockTaskInstance);
		});

		it("should throw NotFoundError if task not found", async () => {
			(Task.findById as Mock).mockResolvedValue(null);
			const taskId = "task-id";

			await expect(getTask(taskId)).rejects.toThrow(NotFoundError);
		});
	});

	describe("patchTask", () => {
		const taskId = "task-id";

		it("should patch and save task", async () => {
			(Task.findById as Mock).mockResolvedValue(mockTaskInstance);
			mockSave.mockResolvedValue(mockTaskInstance);

			const patchData = {
				title: "New Title",
				priority: TaskPriority.LOW,
			};

			const result = await patchTask(taskId, patchData);

			expect(Task.findById).toHaveBeenCalledWith(taskId);
			expect(mockTaskInstance.title).toBe("New Title"); // Updates the instance
			// Priority is mapped
			// expect(mockTaskInstance.priority).toBe(Priority.LOW);
			expect(mockSave).toHaveBeenCalled();
			expect(result).toBe(mockTaskInstance);
		});

		it("should return task if no data provided", async () => {
			(Task.findById as Mock).mockResolvedValue(mockTaskInstance);
			// @ts-expect-error
			const result = await patchTask(taskId, null);
			expect(result).toBe(mockTaskInstance);
		});

		it("should handle assignee and tags", async () => {
			(Task.findById as Mock).mockResolvedValue(mockTaskInstance);
			mockSave.mockResolvedValue(mockTaskInstance);
			const patchData = {
				assignee: new mongoose.Types.ObjectId().toString(),
				tags: [new mongoose.Types.ObjectId().toString()],
				state: TaskState.IN_PROGRESS,
			};

			await patchTask(taskId, patchData);

			expect(mockTaskInstance.assignee).toBeDefined();
			expect(mockTaskInstance.tags).toHaveLength(1);
			expect(mockTaskInstance.state).toBeDefined();
		});

		it("should throw NotFoundError if task to patch not found", async () => {
			(Task.findById as Mock).mockResolvedValue(null);

			await expect(patchTask(taskId, {})).rejects.toThrow(NotFoundError);
		});
	});

	describe("deleteTask", () => {
		const taskId = "task-id";
		it("should delete task", async () => {
			(Task.findByIdAndDelete as Mock).mockResolvedValue(mockTaskInstance);

			const result = await deleteTask(taskId);

			expect(Task.findByIdAndDelete).toHaveBeenCalledWith(taskId);
			expect(result).toBe(mockTaskInstance);
		});

		it("should throw NotFoundError if task to delete not found", async () => {
			(Task.findByIdAndDelete as Mock).mockResolvedValue(null);

			await expect(deleteTask(taskId)).rejects.toThrow(NotFoundError);
		});
	});
});
