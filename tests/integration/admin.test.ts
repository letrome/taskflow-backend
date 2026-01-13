import fs from "node:fs";
import path from "node:path";
import app from "@src/app.js";
import {
	MongoDBContainer,
	type StartedMongoDBContainer,
} from "@testcontainers/mongodb";
import mongoose from "mongoose";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("Integration Tests", () => {
	let mongoContainer: StartedMongoDBContainer;

	beforeAll(async () => {
		mongoContainer = await new MongoDBContainer("mongo:6.0").start();
		const uri = mongoContainer.getConnectionString();
		await mongoose.connect(uri, { directConnection: true });
	}, 120000);

	afterAll(async () => {
		await mongoose.disconnect();
		if (mongoContainer) {
			await mongoContainer.stop();
		}
	});

	describe("GET /health", () => {
		it("should return 200 OK", async () => {
			const auth = Buffer.from("admin:test-secret").toString("base64");
			const response = await request(app)
				.get("/health")
				.set("Authorization", `Basic ${auth}`);
			expect(response.status).toBe(200);
			expect(response.body).toEqual({ status: "OK" });
		});
	});

	// Version Check
	describe("GET /version", () => {
		it("should return the current version from package.json", async () => {
			// Read expected version dynamically to ensure test validity over time
			const packagePath = path.resolve(process.cwd(), "package.json");
			const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
			const expectedVersion = packageJson.version;

			const auth = Buffer.from("admin:test-secret").toString("base64");
			const response = await request(app)
				.get("/version")
				.set("Authorization", `Basic ${auth}`);
			expect(response.status).toBe(200);
			expect(response.body).toEqual({ version: expectedVersion });
		});
	});

	// Metrics Check
	describe("GET /metrics", () => {
		it("should return 200 OK", async () => {
			const auth = Buffer.from("admin:test-secret").toString("base64");
			const response = await request(app)
				.get("/metrics")
				.set("Authorization", `Basic ${auth}`);
			expect(response.status).toBe(200);
			expect(response.body).toBeTypeOf("object");
		});
	});

	// Basic Auth Check
	describe("GET /health without auth", () => {
		it("should return 401 Unauthorized", async () => {
			const response = await request(app).get("/health");
			expect(response.status).toBe(401);
		});
	});

	describe("GET /health with wrong auth type", () => {
		it("should return 401 Unauthorized", async () => {
			const response = await request(app)
				.get("/health")
				.set("Authorization", "Invalid test-secret");
			expect(response.status).toBe(401);
		});
	});

	describe("GET /health with wrong bearer secret", () => {
		it("should return 401 Unauthorized", async () => {
			const response = await request(app)
				.get("/health")
				.set("Authorization", "Basic wrong-secret");
			expect(response.status).toBe(401);
		});
	});

	// Create User Check
	describe("POST /users", () => {
		it("should return 201 Created", async () => {
			const auth = Buffer.from("admin:test-secret").toString("base64");
			const response = await request(app)
				.post("/admin/users")
				.set("Authorization", `Basic ${auth}`)
				.send({
					email: "test@test.com",
					password: "password",
					first_name: "First",
					last_name: "Last",
					roles: ["ROLE_USER"],
				});
			expect(response.status).toBe(201);
			expect(response.body).toEqual({
				email: "test@test.com",
				id: expect.any(String),
				first_name: "First",
				last_name: "Last",
				roles: ["ROLE_USER"],
				created_at: expect.any(String),
			});
		});
	});

	describe("POST /users", () => {
		it("should return 409 Conflict if mail is reused", async () => {
			const auth = Buffer.from("admin:test-secret").toString("base64");
			const body = {
				email: "test@test.com",
				password: "password",
				first_name: "First",
				last_name: "Last",
				roles: ["ROLE_USER"],
			};

			await request(app)
				.post("/admin/users")
				.set("Authorization", `Basic ${auth}`)
				.send(body);

			const response = await request(app)
				.post("/admin/users")
				.set("Authorization", `Basic ${auth}`)
				.send(body);
			expect(response.status).toBe(409);
			expect(response.body).toEqual({
				status: "error",
				message: "Email already exists",
			});
		});
	});

	describe("POST /users", () => {
		it("should return 400 Bad Request if mail format is not valid", async () => {
			const auth = Buffer.from("admin:test-secret").toString("base64");
			const body = {
				email: "invalid",
				password: "password",
				first_name: "First",
				last_name: "Last",
				roles: ["ROLE_USER"],
			};

			const response = await request(app)
				.post("/admin/users")
				.set("Authorization", `Basic ${auth}`)
				.send(body);
			expect(response.status).toBe(400);
			expect(response.body.status).toEqual("error");
			expect(response.body.message).toEqual("Invalid email format");
		});
	});

	// Get User Check
	describe("GET /users", () => {
		it("should return 200 OK", async () => {
			const auth = Buffer.from("admin:test-secret").toString("base64");
			const response = await request(app)
				.post("/admin/users")
				.set("Authorization", `Basic ${auth}`)
				.send({
					email: "test2@test.com",
					password: "password",
					first_name: "First",
					last_name: "Last",
					roles: ["ROLE_USER"],
				});

			const id = response.body.id;
			const response2 = await request(app)
				.get(`/admin/users/${id}`)
				.set("Authorization", `Basic ${auth}`);
			expect(response2.status).toBe(200);
			expect(response2.body).toEqual({
				email: "test2@test.com",
				id: id,
				first_name: "First",
				last_name: "Last",
				roles: ["ROLE_USER"],
				created_at: expect.any(String),
			});
		});

		it("should return 404 Not Found", async () => {
			const auth = Buffer.from("admin:test-secret").toString("base64");
			const response = await request(app)
				.get("/admin/users/123")
				.set("Authorization", `Basic ${auth}`);
			expect(response.status).toBe(404);
			expect(response.body.status).toEqual("error");
			expect(response.body.message).toEqual("User not found");
		});
	});
});
