import app from "@src/app.js";
import {
	MongoDBContainer,
	type StartedMongoDBContainer,
} from "@testcontainers/mongodb";
import mongoose from "mongoose";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { postUser } from "../helpers/user.js";

describe("Integration Tests Project", () => {
	let mongoContainer: StartedMongoDBContainer;
	let token: string;
	// biome-ignore lint/suspicious/noExplicitAny: Integration tests
	let user: any;
	let createdProjectId: string;

	beforeAll(async () => {
		mongoContainer = await new MongoDBContainer("mongo:6.0").start();
		const uri = mongoContainer.getConnectionString();
		await mongoose.connect(uri, { directConnection: true });

		// Create user and get token
		user = await postUser(app);
		const loginResponse = await request(app).post("/auth/login").send({
			email: user.email,
			password: user.password,
		});
		token = loginResponse.body.token;
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
					start_date: new Date().toISOString(),
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
});
