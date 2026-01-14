import app from "@src/app.js";
import {
	MongoDBContainer,
	type StartedMongoDBContainer,
} from "@testcontainers/mongodb";
import mongoose from "mongoose";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { postUser } from "../helpers/user.js";

describe("Integration Tests Auth", () => {
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

	describe("POST /auth/register", () => {
		it("should return 201 Created", async () => {
			const response = await request(app).post("/auth/register").send({
				email: "newuser@test.com",
				password: "password",
				first_name: "John",
				last_name: "Doe",
			});
			expect(response.status).toBe(201);
			expect(response.body).toEqual({
				email: "newuser@test.com",
				id: expect.any(String),
				first_name: "John",
				last_name: "Doe",
				roles: ["ROLE_USER"],
				created_at: expect.any(String),
			});
		});

		it("should return 409 Conflict if email already exists", async () => {
			// First create a user
			await request(app).post("/auth/register").send({
				email: "conflict@test.com",
				password: "password",
				first_name: "Jane",
				last_name: "Doe",
			});

			// Try to create again
			const response = await request(app).post("/auth/register").send({
				email: "conflict@test.com",
				password: "password",
				first_name: "Jane",
				last_name: "Doe",
			});

			expect(response.status).toBe(409);
			expect(response.body.message).toBe("Email already exists");
		});

		it("should return 400 Bad Request for invalid email", async () => {
			const response = await request(app).post("/auth/register").send({
				email: "invalid-email",
				password: "password",
				first_name: "Invalid",
				last_name: "Email",
			});

			expect(response.status).toBe(400);
			expect(response.body.message).toBe("Invalid email format");
		});
	});

	describe("POST /auth/login", () => {
		it("should return 200 OK with token", async () => {
			// Create user to login
			const email = `login-${Date.now()}@test.com`;
			await request(app).post("/auth/register").send({
				email,
				password: "password123",
				first_name: "Login",
				last_name: "User",
			});

			const response = await request(app).post("/auth/login").send({
				email,
				password: "password123",
			});

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("token");
			expect(typeof response.body.token).toBe("string");
		});

		it("should return 401 Unauthorized for wrong password", async () => {
			// Create user
			const email = `wrongpass-${Date.now()}@test.com`;
			await request(app).post("/auth/register").send({
				email,
				password: "correctpassword",
				first_name: "Wrong",
				last_name: "Pass",
			});

			const response = await request(app).post("/auth/login").send({
				email,
				password: "wrongpassword",
			});

			expect(response.status).toBe(401);
			expect(response.body.message).toBe("Invalid email/password combination");
		});

		it("should return 401 Unauthorized for non-existent user", async () => {
			const response = await request(app).post("/auth/login").send({
				email: "nonexistent@test.com",
				password: "password",
			});

			expect(response.status).toBe(401); // Or 404 depending on implementation, usually 401/403 for security to not leak user existence
		});

		it("should return 400 Bad Request for missing fields", async () => {
			const response = await request(app).post("/auth/login").send({
				email: "missing@test.com",
				// password missing
			});

			expect(response.status).toBe(400);
		});
	});

	describe("GET /users/me", () => {
		it("should return 401 Unauthorized if token is invalid", async () => {
			const response = await request(app)
				.get("/users/me")
				.set("Authorization", "Bearer invalid-token");
			expect(response.status).toBe(401);
		});

		it("should return 200 OK if token is valid", async () => {
			const user = await postUser(app);

			const loginResponse = await request(app).post("/auth/login").send({
				email: user.email,
				password: user.password,
			});

			const token = loginResponse.body.token;

			const response = await request(app)
				.get("/users/me")
				.set("Authorization", `Bearer ${token}`);
			expect(response.status).toBe(200);
			expect(response.body.email).toBe(user.email);
		});
	});
});
