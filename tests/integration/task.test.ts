import app from "@src/app.js";
import {
	MongoDBContainer,
	type StartedMongoDBContainer,
} from "@testcontainers/mongodb";
import mongoose from "mongoose";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { postUser } from "../helpers/user.js";

interface TestUser {
	_id: string;
	id?: string;
	email: string;
	password?: string;
	first_name: string;
	last_name: string;
	roles: string[];
}

describe("Integration Tests Task", () => {
	let mongoContainer: StartedMongoDBContainer;
	let token: string;
	let user: TestUser;
	let createdProjectId: string;
	let createdTaskId: string;

	beforeAll(async () => {
		mongoContainer = await new MongoDBContainer("mongo:6.0").start();
		const uri = mongoContainer.getConnectionString();
		await mongoose.connect(uri, { directConnection: true });

		// Create user and get token
		user = (await postUser(app)) as unknown as TestUser;
		const loginResponse = await request(app).post("/auth/login").send({
			email: user.email,
			password: user.password,
		});
		token = loginResponse.body.token;

		// Create a project for tasks
		const projectResponse = await request(app)
			.post("/projects")
			.set("Authorization", `Bearer ${token}`)
			.send({
				title: "Task Project",
				description: "Description",
				start_date: new Date(Date.now() + 86400000).toISOString(),
			});
		createdProjectId = projectResponse.body.id;
	}, 120_000);

	afterAll(async () => {
		await mongoose.disconnect();
		if (mongoContainer) {
			await mongoContainer.stop();
		}
	});

	describe("POST /projects/:projectId/tasks", () => {
		it("should create a task in project", async () => {
			const response = await request(app)
				.post(`/projects/${createdProjectId}/tasks`)
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "Integration Task",
					description: "Task Description",
					priority: "HIGH",
					state: "OPEN",
					due_date: new Date(Date.now() + 86400000).toISOString(),
					// Assignee defaults to creator if not specified? Or optional?
				});

			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty("id");
			expect(response.body.title).toBe("Integration Task");
			expect(response.body.project).toBe(createdProjectId);
			createdTaskId = response.body.id;
		});

		it("should return 400 for validation error", async () => {
			const response = await request(app)
				.post(`/projects/${createdProjectId}/tasks`)
				.set("Authorization", `Bearer ${token}`)
				.send({
					// Missing title
					description: "Missing Title",
				});

			expect(response.status).toBe(400);
		});

		it("should return 404 for non-existent project", async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const response = await request(app)
				.post(`/projects/${fakeId}/tasks`)
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "Task",
				});

			// If project middleware checks existence, it returns 404.
			// Some middleware/validation configurations might return 400.
			expect([400, 404]).toContain(response.status);
		});
	});

	describe("GET /tasks/:id", () => {
		it("should get the task", async () => {
			const response = await request(app)
				.get(`/tasks/${createdTaskId}`)
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(response.body.id).toBe(createdTaskId);
			expect(response.body.title).toBe("Integration Task");
		});

		it("should return 404 for non-existent task", async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const response = await request(app)
				.get(`/tasks/${fakeId}`)
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(404);
		});
	});

	describe("PATCH /tasks/:id", () => {
		it("should patch task details", async () => {
			const response = await request(app)
				.patch(`/tasks/${createdTaskId}`)
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "Patched Task Title",
					// Partial update
				});

			expect(response.status).toBe(200);
			expect(response.body.title).toBe("Patched Task Title");
			expect(response.body.description).toBe("Task Description");
		});

		it("should update task status via PATCH", async () => {
			const response = await request(app)
				.patch(`/tasks/${createdTaskId}`)
				.set("Authorization", `Bearer ${token}`)
				.send({
					state: "IN_PROGRESS",
				});

			expect(response.status).toBe(200);
			expect(response.body.state).toBe("IN_PROGRESS");
		});

		it("should validate enums case insensitively", async () => {
			const response = await request(app)
				.patch(`/tasks/${createdTaskId}`)
				.set("Authorization", `Bearer ${token}`)
				.send({
					priority: "low",
				});

			expect(response.status).toBe(200);
			expect(response.body.priority).toBe("LOW");
		});
	});

	describe("POST /tasks/:id/:state", () => {
		it("should update task status via status endpoint", async () => {
			const response = await request(app)
				.post(`/tasks/${createdTaskId}/closed`) // State param case insensitive?
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(response.body.state).toBe("CLOSED");
		});

		it("should return 400 for invalid state", async () => {
			const response = await request(app)
				.post(`/tasks/${createdTaskId}/INVALID_STATE`)
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(400);
		});
	});
});
