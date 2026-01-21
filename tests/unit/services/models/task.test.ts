import Task, { Priority, State, isAssigneeDoesNotExistError, isTagDoesNotExistError } from "@src/services/models/task.js";
import mongoose from "mongoose";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock mongoose model behavior
const mockCountDocuments = vi.fn();

// Mock dependencies
const mockUserModel = {
	countDocuments: mockCountDocuments,
};

const mockTagModel = {
	countDocuments: mockCountDocuments,
};

// We need to intercept the mongoose.model calls inside the validators
// The model implementation calls mongoose.model("User") and mongoose.model("Tag")
vi.spyOn(mongoose, "model").mockImplementation((modelName: string) => {
	if (modelName === "User")
		return mockUserModel as unknown as mongoose.Model<unknown>;
	if (modelName === "Tag")
		return mockTagModel as unknown as mongoose.Model<unknown>;
	// For "Task" and others, return a dummy or the real one if needed,
	// but since we are testing validation logic that uses these models,
	// we mainly care about User and Tag.
	return {
		countDocuments: vi.fn(),
		// Add other methods if needed
	} as unknown as mongoose.Model<unknown>;
});

describe("Task Model", () => {
	// Reset mocks before each test
	beforeEach(() => {
		mockCountDocuments.mockReset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should validate a valid task", async () => {
		// Setup mocks for success
		mockCountDocuments.mockResolvedValue(1); // User exists, Tag exists

		const task = new Task({
			title: "Valid Task",
			description: "Description",
			priority: Priority.MEDIUM,
			state: State.OPEN,
			project: new mongoose.Types.ObjectId(),
			assignee: new mongoose.Types.ObjectId(),
			tags: [new mongoose.Types.ObjectId()],
		});

		const error = await task.validate();
		expect(error).toBeUndefined();
	});

	it("should fail validation if required fields are missing", async () => {
		const task = new Task({}); // Empty object

		let error: mongoose.Error.ValidationError | undefined;
		try {
			await task.validate();
		} catch (e) {
			error = e as mongoose.Error.ValidationError;
		}

		expect(error).toBeDefined();
		expect(error?.errors.title).toBeDefined();
		expect(error?.errors.description).toBeDefined();
		expect(error?.errors.priority).toBeDefined();
		expect(error?.errors.state).toBeDefined();
		expect(error?.errors.project).toBeDefined();
	});

	it("should fail validation if assignee does not exist", async () => {
		mockCountDocuments.mockResolvedValue(0); // User does not exist

		const task = new Task({
			title: "Valid Task",
			description: "Description",
			priority: Priority.MEDIUM,
			state: State.OPEN,
			project: new mongoose.Types.ObjectId(),
			assignee: new mongoose.Types.ObjectId(),
			tags: [],
		});

		let error: mongoose.Error.ValidationError | undefined;
		try {
			await task.validate();
		} catch (e) {
			error = e as mongoose.Error.ValidationError;
		}

		expect(error).toBeDefined();
		if (error) {
			expect(error.errors.assignee).toBeDefined();
			// The validator message in the schema is "Assignee does not exist"
			expect(error.errors.assignee?.message).toBe("Assignee does not exist");
		}
	});

	it("should fail validation if tag does not exist", async () => {
		// First call for assignee (if provided, but here we omit it or assume it passes)
		// If we omit assignee, it's optional so it skips user validation.

		// Setup mock: return 0 for tag count
		mockCountDocuments.mockResolvedValue(0);

		const task = new Task({
			title: "Valid Task",
			description: "Description",
			priority: Priority.MEDIUM,
			state: State.OPEN,
			project: new mongoose.Types.ObjectId(),
			// assignee omitted
			tags: [new mongoose.Types.ObjectId()],
		});

		let error: mongoose.Error.ValidationError | undefined;
		try {
			await task.validate();
		} catch (e) {
			error = e as mongoose.Error.ValidationError;
		}

		expect(error).toBeDefined();
		if (error) {
			expect(error.errors.tags).toBeDefined();
			// The validator message in the schema is "One or more tags do not exist"
			expect(error.errors.tags?.message).toBe("One or more tags do not exist");
		}
	});

	it("should allow empty tags array", async () => {
		mockCountDocuments.mockResolvedValue(0);

		const task = new Task({
			title: "Valid Task",
			description: "Description",
			priority: Priority.MEDIUM,
			state: State.OPEN,
			project: new mongoose.Types.ObjectId(),
			tags: [],
		});

		const error = await task.validate();
		expect(error).toBeUndefined();
	});
});

	describe("Error Helpers", () => {
		it("should identify assignee error", () => {
			const error = new mongoose.Error.ValidationError();
			error.addError("assignee", new mongoose.Error.ValidatorError({ path: "assignee", message: "Assignee does not exist" }));
			expect(isAssigneeDoesNotExistError(error)).toBeTruthy();
		});

		it("should identify tag error", () => {
			const error = new mongoose.Error.ValidationError();
			error.addError("tags", new mongoose.Error.ValidatorError({ path: "tags", message: "One or more tags do not exist" }));
			expect(isTagDoesNotExistError(error)).toBeTruthy();
		});

		it("should return false for unrelated errors", () => {
			const error = new Error("Some other error");
			expect(isAssigneeDoesNotExistError(error)).toBeFalsy();
			expect(isTagDoesNotExistError(error)).toBeFalsy();
		});
	});

