import {
	BadRequestError,
	ConflictError,
	NotFoundError,
} from "@src/core/errors.js";
import Task, { isTagDoesNotExistError } from "@src/services/models/task.js";
import {
	addTaskTag,
	getTasksForTag,
	removeTaskTag,
} from "@src/services/task.js";
import mongoose from "mongoose";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

// Mock dependencies
vi.mock("@src/services/models/task.js", async () => {
	const actual = await vi.importActual("@src/services/models/task.js");
	// biome-ignore lint/suspicious/noExplicitAny: mock
	const MockTask = vi.fn() as any;
	MockTask.find = vi.fn();
	MockTask.findById = vi.fn();
	return {
		...actual,
		default: MockTask,
		isTagDoesNotExistError: vi.fn(),
	};
});

// Helper to mock mongoose array methods
// biome-ignore lint/suspicious/noExplicitAny: mock
const createMockMongooseArray = (items: any[]) => {
	// biome-ignore lint/suspicious/noExplicitAny: mock
	const arr = [...items] as any;
	arr.push = vi.fn((item) => Array.prototype.push.call(arr, item));
	// biome-ignore lint/suspicious/noExplicitAny: mock
	arr.pull = vi.fn((item: any) => {
		// biome-ignore lint/suspicious/noExplicitAny: mock
		const index = arr.findIndex((i: any) => i.toString() === item.toString());
		if (index > -1) {
			arr.splice(index, 1);
		}
	});
	arr.some = Array.prototype.some.bind(arr);
	arr.map = Array.prototype.map.bind(arr);
	return arr;
};

describe("Task Service - Tags", () => {
	const mockSave = vi.fn();
	const tagId = new mongoose.Types.ObjectId().toString();
	const taskId = "task-id";

	// biome-ignore lint/suspicious/noExplicitAny: mock
	let mockTaskInstance: any;

	beforeEach(() => {
		vi.clearAllMocks();
		mockTaskInstance = {
			_id: taskId,
			tags: createMockMongooseArray([]),
			save: mockSave,
		};
	});

	describe("getTasksForTag", () => {
		it("should return tasks for a tag", async () => {
			const tasks = [mockTaskInstance];
			(Task.find as Mock).mockResolvedValue(tasks);

			const result = await getTasksForTag(tagId);

			// Mongoose query structure: { tags: tagId }
			expect(Task.find).toHaveBeenCalledWith({ tags: tagId });
			expect(result).toBe(tasks);
		});
	});

	describe("addTaskTag", () => {
		it("should add a tag to the task", async () => {
			(Task.findById as Mock).mockResolvedValue(mockTaskInstance);
			mockSave.mockResolvedValue({
				...mockTaskInstance,
				tags: [new mongoose.Types.ObjectId(tagId)],
			});

			const result = await addTaskTag(taskId, tagId);

			expect(Task.findById).toHaveBeenCalledWith(taskId);
			expect(mockTaskInstance.tags.push).toHaveBeenCalled();
			// Check if pushed item is ObjectId of tagId
			expect(mockTaskInstance.tags[0].toString()).toBe(tagId);
			expect(mockSave).toHaveBeenCalled();
			expect(result).toEqual([tagId]);
		});

		it("should throw NotFoundError if task not found", async () => {
			(Task.findById as Mock).mockResolvedValue(null);
			await expect(addTaskTag(taskId, tagId)).rejects.toThrow(NotFoundError);
		});

		it("should throw ConflictError if tag already assigned", async () => {
			mockTaskInstance.tags = createMockMongooseArray([
				new mongoose.Types.ObjectId(tagId),
			]);
			(Task.findById as Mock).mockResolvedValue(mockTaskInstance);

			await expect(addTaskTag(taskId, tagId)).rejects.toThrow(ConflictError);
		});

		it("should throw BadRequestError if tag validation fails on save", async () => {
			(Task.findById as Mock).mockResolvedValue(mockTaskInstance);
			const error = new Error("Tag validation failed");
			mockSave.mockRejectedValue(error);
			(isTagDoesNotExistError as unknown as Mock).mockReturnValue(true);

			await expect(addTaskTag(taskId, tagId)).rejects.toThrow("Tag does not exist");
		});

		it("should rethrow other errors on save", async () => {
			(Task.findById as Mock).mockResolvedValue(mockTaskInstance);
			const error = new Error("Database error");
			mockSave.mockRejectedValue(error);
			(isTagDoesNotExistError as unknown as Mock).mockReturnValue(false);

			await expect(addTaskTag(taskId, tagId)).rejects.toThrow("Database error");
		});
	});

	describe("removeTaskTag", () => {
		it("should remove a tag from the task", async () => {
			mockTaskInstance.tags = createMockMongooseArray([
				new mongoose.Types.ObjectId(tagId),
			]);
			(Task.findById as Mock).mockResolvedValue(mockTaskInstance);
			mockSave.mockResolvedValue(mockTaskInstance);

			const result = await removeTaskTag(taskId, tagId);

			expect(Task.findById).toHaveBeenCalledWith(taskId);
			expect(mockTaskInstance.tags.pull).toHaveBeenCalled();
			expect(mockTaskInstance.save).toHaveBeenCalled();
			expect(result).toEqual([tagId]);
			// Verify item removed from local array mock
			expect(mockTaskInstance.tags.length).toBe(0);
		});

		it("should throw NotFoundError if task not found", async () => {
			(Task.findById as Mock).mockResolvedValue(null);
			await expect(removeTaskTag(taskId, tagId)).rejects.toThrow(NotFoundError);
		});

		it("should throw BadRequestError if tag not in task", async () => {
			// tags empty
			(Task.findById as Mock).mockResolvedValue(mockTaskInstance);
			await expect(removeTaskTag(taskId, tagId)).rejects.toThrow(
				BadRequestError,
			);
			await expect(removeTaskTag(taskId, tagId)).rejects.toThrow(
				"Tag does not exist",
			);
		});
	});
});
