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

describe("Integration Tests Project", () => {
	let mongoContainer: StartedMongoDBContainer;
	let token: string;
	let user: TestUser;
	let memberUser: TestUser;
	let createdProjectId: string;

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

		// Create member user
		memberUser = (await postUser(app)) as unknown as TestUser;
	}, 120_000);

	afterAll(async () => {
		await mongoose.disconnect();
		if (mongoContainer) {
			await mongoContainer.stop();
		}
	});

	describe("POST /projects", () => {
		it("should create a project", async () => {
			const response = await request(app)
				.post("/projects")
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "Integration Project",
					description: "Description",
					start_date: new Date(Date.now() + 86400000).toISOString(),
				});

			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty("id");
			expect(response.body.title).toBe("Integration Project");
			expect(response.body.created_by).toBeDefined();
			createdProjectId = response.body.id;
		});

		it("should return 400 for validation error", async () => {
			const response = await request(app)
				.post("/projects")
				.set("Authorization", `Bearer ${token}`)
				.send({
					// Missing title and description
					start_date: new Date().toISOString(),
				});

			expect(response.status).toBe(400);
		});

		it("should return 401 if not authenticated", async () => {
			const response = await request(app).post("/projects").send({
				title: "No Auth Project",
			});

			expect(response.status).toBe(401);
		});
	});

	describe("GET /projects/:id", () => {
		it("should get the project", async () => {
			const response = await request(app)
				.get(`/projects/${createdProjectId}`)
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(response.body.id).toBe(createdProjectId);
			expect(response.body.title).toBe("Integration Project");
		});

		it("should return 404 for non-existent project", async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const response = await request(app)
				.get(`/projects/${fakeId}`)
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(404);
		});

		it("should return 404 for invalid ID format", async () => {
			const response = await request(app)
				.get("/projects/invalid-id")
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(404);
		});
	});

	describe("GET /projects", () => {
		it("should return list of projects", async () => {
			const response = await request(app)
				.get("/projects")
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(Array.isArray(response.body)).toBe(true);
			expect(response.body.length).toBeGreaterThanOrEqual(1);
			// biome-ignore lint/suspicious/noExplicitAny: Integration tests
			const project = response.body.find((p: any) => p.id === createdProjectId);
			expect(project).toBeDefined();
		});
	});

	describe("PUT /projects/:id", () => {
		it("should update project", async () => {
			const response = await request(app)
				.put(`/projects/${createdProjectId}`)
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "Updated Title",
					description: "Updated Description",
					start_date: new Date(Date.now() + 86400000).toISOString(),
					status: "ACTIVE",
					members: [],
				});

			expect(response.status).toBe(200);
			expect(response.body.title).toBe("Updated Title");
			expect(response.body.description).toBe("Updated Description");
		});

		it("should return 404 for non-existent project", async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const response = await request(app)
				.put(`/projects/${fakeId}`)
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "Updated Title",
					description: "Desc",
					start_date: new Date(Date.now() + 86400000).toISOString(),
					status: "ACTIVE",
					members: [],
				});

			expect(response.status).toBe(404);
		});
	});

	describe("PATCH /projects/:id", () => {
		it("should patch project", async () => {
			const response = await request(app)
				.patch(`/projects/${createdProjectId}`)
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "Patched Title",
				});

			expect(response.status).toBe(200);
			expect(response.body.title).toBe("Patched Title");
			// Description should remain unchanged
			expect(response.body.description).toBe("Updated Description");
		});
	});

	describe("DELETE /projects/:id", () => {
		it("should delete project", async () => {
			const response = await request(app)
				.delete(`/projects/${createdProjectId}`)
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(response.body.id).toBe(createdProjectId);
		});

		it("should return 404 for deleted project", async () => {
			const response = await request(app)
				.get(`/projects/${createdProjectId}`)
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(404);
		});
	});

	describe("POST /projects/:id/members", () => {
		it("should add a member to the project", async () => {
			// Need to recreate project since it was deleted in previous tests
			const projectResp = await request(app)
				.post("/projects")
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "New Project",
					description: "Desc",
					start_date: new Date(Date.now() + 86400000).toISOString(),
				});
			createdProjectId = projectResp.body.id;

			const response = await request(app)
				.post(`/projects/${createdProjectId}/members`)
				.set("Authorization", `Bearer ${token}`)
				.send({
					members: [memberUser.id],
				});

			expect(response.status).toBe(200);
			expect(response.body.members).toContain(memberUser.id);
		});

		it("should return 404 for invalid project ID", async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const response = await request(app)
				.post(`/projects/${fakeId}/members`)
				.set("Authorization", `Bearer ${token}`)
				.send({
					members: [memberUser.id],
				});

			expect(response.status).toBe(404);
		});

		it("should return 400/404 for non-existent member ID", async () => {
			const fakeUserId = new mongoose.Types.ObjectId();
			const response = await request(app)
				.post(`/projects/${createdProjectId}/members`)
				.set("Authorization", `Bearer ${token}`)
				.send({
					members: [fakeUserId.toString()],
				});

			expect(response.status).toBe(404);
		});
	});

	describe("DELETE /projects/:id/members/:memberId", () => {
		it("should remove a member from the project", async () => {
			const response = await request(app)
				.delete(`/projects/${createdProjectId}/members/${memberUser.id}`)
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(response.body.members).not.toContain(memberUser.id);
		});

		it("should return 404 for invalid project ID", async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const response = await request(app)
				.delete(`/projects/${fakeId}/members/${memberUser.id}`)
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(404);
		});

		it("should return 404 for member not in project", async () => {
			const response = await request(app)
				.delete(`/projects/${createdProjectId}/members/${memberUser.id}`)
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(404);
		});
	});
});
