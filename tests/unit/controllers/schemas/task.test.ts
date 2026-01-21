import {
	createTaskSchema,
	patchTaskSchema,
	TaskPriority,
	TaskState,
	taskStateParamSchema,
} from "@src/controllers/schemas/task.js";
import { describe, expect, it } from "vitest";

describe("Task Schemas", () => {
	describe("createTaskSchema", () => {
		it("should validate a valid task", () => {
			const input = {
				title: "Task Title",
				description: "Task Description",
				due_date: "2023-12-31",
				priority: "HIGH",
				state: "OPEN",
			};
			const result = createTaskSchema.safeParse(input);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.title).toBe(input.title);
				expect(result.data.priority).toBe(TaskPriority.HIGH);
			}
		});

		it("should validate a valid task with case insensitive enums", () => {
			const input = {
				title: "Task Title",
				description: "Task Description",
				priority: "medium", // lowercase
				state: "in_progress", // lowercase
			};
			const result = createTaskSchema.safeParse(input);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.priority).toBe(TaskPriority.MEDIUM);
				expect(result.data.state).toBe(TaskState.IN_PROGRESS);
			}
		});

		it("should use default values for missing optional fields", () => {
			const input = {
				title: "Task Title",
				description: "Task Description",
			};
			const result = createTaskSchema.safeParse(input);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.priority).toBe(TaskPriority.MEDIUM);
				expect(result.data.state).toBe(TaskState.OPEN);
				expect(result.data.tags).toEqual([]);
			}
		});

		it("should fail if title is missing", () => {
			const input = {
				description: "Task Description",
			};
			const result = createTaskSchema.safeParse(input);
			expect(result.success).toBe(false);
		});

		it("should fail if invalid date format", () => {
			const input = {
				title: "Task Title",
				description: "Task Description",
				due_date: "invalid-date",
			};
			const result = createTaskSchema.safeParse(input);
			expect(result.success).toBe(false);
		});

		it("should fail if invalid enum value", () => {
			const input = {
				title: "Task Title",
				description: "Task Description",
				priority: "INVALID",
			};
			const result = createTaskSchema.safeParse(input);
			expect(result.success).toBe(false);
		});
	});

	describe("patchTaskSchema", () => {
		it("should validate partial updates", () => {
			const input = {
				title: "Updated Title",
			};
			const result = patchTaskSchema.safeParse(input);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.title).toBe("Updated Title");
				expect(result.data.description).toBeUndefined();
			}
		});

		it("should validate case insensitive enums in patch", () => {
			const input = {
				priority: "low",
			};
			const result = patchTaskSchema.safeParse(input);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.priority).toBe(TaskPriority.LOW);
			}
		});

		it("should fail for invalid types", () => {
			const input = {
				title: 123,
			};
			const result = patchTaskSchema.safeParse(input);
			expect(result.success).toBe(false);
		});
	});

	describe("taskStateParamSchema", () => {
		it("should validate valid state", () => {
			const input = { state: "OPEN" };
			const result = taskStateParamSchema.safeParse(input);
			expect(result.success).toBe(true);
		});

		it("should validate case insensitive state", () => {
			const input = { state: "closed" };
			const result = taskStateParamSchema.safeParse(input);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.state).toBe(TaskState.CLOSED);
			}
		});

		it("should fail for invalid state", () => {
			const input = { state: "INVALID" };
			const result = taskStateParamSchema.safeParse(input);
			expect(result.success).toBe(false);
		});
	});
});
