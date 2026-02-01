import { TaskPriority, TaskState } from "@src/controllers/schemas/task.js";
import { BadRequestError, ConflictError } from "@src/core/errors.js";
import Project from "@src/services/models/project.js";
import Tag from "@src/services/models/tag.js";
import Task from "@src/services/models/task.js";
import User from "@src/services/models/user.js";
import { addTaskTag, createTask, removeTaskTag } from "@src/services/task.js";
import {
	MongoDBContainer,
	type StartedMongoDBContainer,
} from "@testcontainers/mongodb";
import mongoose from "mongoose";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("Task Service - Tags", () => {
	let mongoContainer: StartedMongoDBContainer;

	beforeAll(async () => {
		mongoContainer = await new MongoDBContainer("mongo:6.0").start();
		const uri = mongoContainer.getConnectionString();
		await mongoose.connect(uri, { directConnection: true });
	}, 120_000);

	afterAll(async () => {
		await mongoose.disconnect();
		if (mongoContainer) {
			await mongoContainer.stop();
		}
	});

	it("should throw ConflictError when adding a duplicate tag", async () => {
		// Setup
		const user = await User.create({
			email: `test.duplicate.${Date.now()}@test.com`,
			password_hash: "hashed_password",
			first_name: "Test",
			last_name: "User",
		});
		const project = await Project.create({
			title: "Test Project Duplicate",
			description: "Desc",
			created_by: user._id,
			members: [user._id],
			start_date: new Date(),
		});
		const tag = await Tag.create({
			name: "Test Tag Duplicate",
			project: project._id,
		});

		// Use string literals or Enums if available.
		// Based on model definition: Priority.LOW, State.OPEN

		const task = await createTask(
			{
				title: "Test Task Duplicate",
				description: "Desc",
				priority: TaskPriority.LOW,
				state: TaskState.OPEN,
				assignee: user._id.toString(),
				tags: [tag._id.toString()],
			},
			project._id.toString(),
		);

		// Action & Assert
		await expect(
			addTaskTag(task._id.toString(), tag._id.toString()),
		).rejects.toThrow(ConflictError);
	});

	it("should throw BadRequestError when adding a non-existent tag", async () => {
		// Setup
		const user = await User.create({
			email: `test.nonexistent.${Date.now()}@test.com`,
			password_hash: "hashed_password",
			first_name: "Test",
			last_name: "User",
		});
		const project = await Project.create({
			title: "Test Project NonExistent",
			description: "Desc",
			created_by: user._id,
			members: [user._id],
			start_date: new Date(),
		});

		const task = await createTask(
			{
				title: "Test Task NonExistent",
				description: "Desc",
				priority: TaskPriority.LOW,
				state: TaskState.OPEN,
				assignee: user._id.toString(),
				tags: [],
			},
			project._id.toString(),
		);

		const nonExistentTagId = new mongoose.Types.ObjectId().toString();

		// Action & Assert
		await expect(
			addTaskTag(task._id.toString(), nonExistentTagId),
		).rejects.toThrow(BadRequestError);

		await expect(
			addTaskTag(task._id.toString(), nonExistentTagId),
		).rejects.toThrow("Tag does not exist");
	});
	it("should add a tag successfully", async () => {
		// Setup
		const user = await User.create({
			email: `test.success.${Date.now()}@test.com`,
			password_hash: "hashed_password",
			first_name: "Test",
			last_name: "User",
		});
		const project = await Project.create({
			title: "Test Project Success",
			description: "Desc",
			created_by: user._id,
			members: [user._id],
			start_date: new Date(),
		});
		const tag = await Tag.create({
			name: "Test Tag Success",
			project: project._id,
		});

		const task = await createTask(
			{
				title: "Test Task Success",
				description: "Desc",
				priority: TaskPriority.LOW,
				state: TaskState.OPEN,
				assignee: user._id.toString(),
				tags: [],
			},
			project._id.toString(),
		);

		// Action
		const result = await addTaskTag(task._id.toString(), tag._id.toString());

		// Assert
		expect(result).toHaveLength(1);
		expect(result[0]).toBe(tag._id.toString());

		const updatedTask = await Task.findById(task._id);
		expect(updatedTask).toBeDefined();
		// biome-ignore lint/style/noNonNullAssertion: assert above
		expect(updatedTask!.tags).toHaveLength(1);
		// biome-ignore lint/style/noNonNullAssertion: assert above
		expect(updatedTask!.tags[0]!.toString()).toBe(tag._id.toString());
	});

	it("should remove a tag successfully", async () => {
		// Setup
		const user = await User.create({
			email: `test.remove.${Date.now()}@test.com`,
			password_hash: "hashed_password",
			first_name: "Test",
			last_name: "User",
		});
		const project = await Project.create({
			title: "Test Project Remove",
			description: "Desc",
			created_by: user._id,
			members: [user._id],
			start_date: new Date(),
		});
		const tag = await Tag.create({
			name: "Test Tag Remove",
			project: project._id,
		});

		const task = await createTask(
			{
				title: "Test Task Remove",
				description: "Desc",
				priority: TaskPriority.LOW,
				state: TaskState.OPEN,
				assignee: user._id.toString(),
				tags: [tag._id.toString()],
			},
			project._id.toString(),
		);

		// Action
		await removeTaskTag(task._id.toString(), tag._id.toString());

		// Assert
		const updatedTask = await Task.findById(task._id);
		expect(updatedTask).toBeDefined();
		// biome-ignore lint/style/noNonNullAssertion: assert above
		expect(updatedTask!.tags).toHaveLength(0);
	});

	it("should throw BadRequestError when removing a tag not assigned to the task", async () => {
		const user = await User.create({
			email: `test.remove.fail.${Date.now()}@test.com`,
			password_hash: "hashed_password",
			first_name: "Test",
			last_name: "User",
		});
		const project = await Project.create({
			title: "Test Project Remove Fail",
			description: "Desc",
			created_by: user._id,
			members: [user._id],
			start_date: new Date(),
		});
		const tag = await Tag.create({
			name: "Test Tag Remove Fail",
			project: project._id,
		});

		const task = await createTask(
			{
				title: "Test Task Remove Fail",
				description: "Desc",
				priority: TaskPriority.LOW,
				state: TaskState.OPEN,
				assignee: user._id.toString(),
				tags: [],
			},
			project._id.toString(),
		);

		await expect(
			removeTaskTag(task._id.toString(), tag._id.toString()),
		).rejects.toThrow(BadRequestError);
	});
});
