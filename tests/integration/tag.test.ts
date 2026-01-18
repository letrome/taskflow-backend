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
	email: string;
	password?: string;
}

describe("Integration Tests Tag", () => {
	let mongoContainer: StartedMongoDBContainer;
	let token: string;
	let user: TestUser;
	let projectId: string;
	let tagId: string;

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

		// Create a project
		const projectResponse = await request(app)
			.post("/projects")
			.set("Authorization", `Bearer ${token}`)
			.send({
				title: "Tag Project",
				description: "Project for tags",
				start_date: new Date(Date.now() + 86400000).toISOString(),
			});
		projectId = projectResponse.body.id;
	}, 120_000);

	afterAll(async () => {
		await mongoose.disconnect();
		if (mongoContainer) {
			await mongoContainer.stop();
		}
	});

	describe("POST /projects/:id/tags", () => {
		it("should create a tag", async () => {
			const response = await request(app)
				.post(`/projects/${projectId}/tags`)
				.set("Authorization", `Bearer ${token}`)
				.send({
					name: "Bug",
				});

			expect(response.status).toBe(201);
			expect(response.body.name).toBe("Bug");
			expect(response.body.project).toBe(projectId);
			tagId = response.body.id; // Corrected: endpoint returns _id usually but serialized as id? Check controller.
			// Controller returns `createdTag` which is ITag (Mongoose doc). `res.json(createdTag)`.
			// Mongoose objects usually have `_id`. Express json might not transform it unless using a transformer.
			// Let's assume standard object.
			tagId = response.body._id || response.body.id;
		});

		it("should return 409 for duplicate tag name in same project", async () => {
			const response = await request(app)
				.post(`/projects/${projectId}/tags`)
				.set("Authorization", `Bearer ${token}`)
				.send({
					name: "Bug",
				});
			expect(response.status).toBe(409);
		});

		it("should return 404 for invalid project ID", async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const response = await request(app)
				.post(`/projects/${fakeId}/tags`)
				.set("Authorization", `Bearer ${token}`)
				.send({
					name: "Feature",
				});
			expect(response.status).toBe(404);
		});
	});

	describe("GET /projects/:id/tags", () => {
		it("should return tags for project", async () => {
			const response = await request(app)
				.get(`/projects/${projectId}/tags`)
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(Array.isArray(response.body)).toBe(true);
			expect(response.body.length).toBeGreaterThanOrEqual(1);
			expect(response.body[0].name).toBe("Bug");
		});
	});

	describe("PATCH /tags/:id", () => {
		it("should update tag name", async () => {
			const response = await request(app)
				.patch(`/tags/${tagId}`)
				.set("Authorization", `Bearer ${token}`)
				.send({
					name: "Defect",
				});

			expect(response.status).toBe(200);
			expect(response.body.name).toBe("Defect");
		});

		it("should return 404 for non-existent tag", async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const response = await request(app)
				.patch(`/tags/${fakeId}`)
				.set("Authorization", `Bearer ${token}`)
				.send({
					name: "New",
				});
			expect(response.status).toBe(404);
		});
	});

	describe("DELETE /tags/:id", () => {
		it("should delete tag", async () => {
			const response = await request(app)
				.delete(`/tags/${tagId}`)
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(response.body._id || response.body.id).toBe(tagId);
		});

		it("should return 404 for deleted tag", async () => {
			const response = await request(app)
				.patch(`/tags/${tagId}`)
				.set("Authorization", `Bearer ${token}`)
				.send({
					name: "Should Fail",
				});
			expect(response.status).toBe(404);
		});
	});
});
