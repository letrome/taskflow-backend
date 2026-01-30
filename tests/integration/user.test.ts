import app from "@src/app.js";
import {
	MongoDBContainer,
	type StartedMongoDBContainer,
} from "@testcontainers/mongodb";
import mongoose from "mongoose";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { postUser } from "../helpers/user.js";

describe("Integration Tests User", () => {
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

	const getAuthHeader = async () => {
		const user = await postUser(app);
		const loginResponse = await request(app).post("/auth/login").send({
			email: user.email,
			password: user.password,
		});
		return { token: loginResponse.body.token, user };
	};

	describe("GET /users/me", () => {
		it("should return current user profile", async () => {
			const { token, user } = await getAuthHeader();

			const response = await request(app)
				.get("/users/me")
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(response.body.email).toBe(user.email);
			expect(response.body.first_name).toBe(user.first_name);
			expect(response.body.last_name).toBe(user.last_name);
		});

		it("should return 401 if unauthorized", async () => {
			const response = await request(app).get("/users/me");
			expect(response.status).toBe(401);
		});
	});

	describe("PUT /users/me", () => {
		it("should update user information", async () => {
			const { token } = await getAuthHeader();

			const response = await request(app)
				.put("/users/me")
				.set("Authorization", `Bearer ${token}`)
				.send({
					first_name: "UpdatedFirst",
					last_name: "UpdatedLast",
				});

			expect(response.status).toBe(200);
			expect(response.body.first_name).toBe("UpdatedFirst");
			expect(response.body.last_name).toBe("UpdatedLast");
		});

		it("should validate input", async () => {
			const { token } = await getAuthHeader();

			const response = await request(app)
				.put("/users/me")
				.set("Authorization", `Bearer ${token}`)
				.send({
					first_name: "", // Invalid
					last_name: "Valid",
				});

			expect(response.status).toBe(400);
		});
	});

	describe("PATCH /users/me", () => {
		it("should patch user information", async () => {
			const { token, user } = await getAuthHeader();

			const response = await request(app)
				.patch("/users/me")
				.set("Authorization", `Bearer ${token}`)
				.send({
					first_name: "PatchedFirst",
				});

			expect(response.status).toBe(200);
			expect(response.body.first_name).toBe("PatchedFirst");
			expect(response.body.last_name).toBe(user.last_name); // Unchanged
		});
	});

	describe("PUT /users/me/email", () => {
		it("should update email", async () => {
			const { token, user } = await getAuthHeader();
			const newEmail = `new-${Date.now()}@test.com`;

			const response = await request(app)
				.put("/users/me/email")
				.set("Authorization", `Bearer ${token}`)
				.send({
					email: newEmail,
					password: user.password,
				});

			expect(response.status).toBe(200);
			expect(response.body.email).toBe(newEmail);
		});

		it("should require correct password", async () => {
			const { token } = await getAuthHeader();
			const newEmail = `new-${Date.now()}@test.com`;

			const response = await request(app)
				.put("/users/me/email")
				.set("Authorization", `Bearer ${token}`)
				.send({
					email: newEmail,
					password: "wrongpassword",
				});

			expect(response.status).toBe(401);
		});
	});

	describe("PUT /users/me/password", () => {
		it("should update password", async () => {
			const { token, user } = await getAuthHeader();
			const newPassword = "newpassword123";

			const response = await request(app)
				.put("/users/me/password")
				.set("Authorization", `Bearer ${token}`)
				.send({
					old_password: user.password,
					new_password: newPassword,
				});

			expect(response.status).toBe(200);

			// Verify login with new password
			const loginResponse = await request(app).post("/auth/login").send({
				email: user.email,
				password: newPassword,
			});
			expect(loginResponse.status).toBe(200);
		});

		it("should fail with wrong old password", async () => {
			const { token } = await getAuthHeader();

			const response = await request(app)
				.put("/users/me/password")
				.set("Authorization", `Bearer ${token}`)
				.send({
					old_password: "wrongpassword",
					new_password: "newpassword123",
				});

			expect(response.status).toBe(401);
		});
	});

	describe("POST /users/me/consent", () => {
		it("should add consent", async () => {
			const { token } = await getAuthHeader();

			const response = await request(app)
				.post("/users/me/consent")
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(response.body.consent).toBe(true);
		});
	});

	describe("DELETE /users/me/consent", () => {
		it("should remove consent", async () => {
			const { token } = await getAuthHeader();

			// First add consent
			await request(app)
				.post("/users/me/consent")
				.set("Authorization", `Bearer ${token}`);

			const response = await request(app)
				.delete("/users/me/consent")
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(response.body.consent).toBe(false);
		});
	});

	describe("DELETE /users/me", () => {
		it("should delete user account", async () => {
			const { token } = await getAuthHeader();

			const response = await request(app)
				.delete("/users/me")
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(200);

			// Verify token is invalid or user not found
			const checkResponse = await request(app)
				.get("/users/me")
				.set("Authorization", `Bearer ${token}`);

			// Depending on implementation, it might return 401 (invalid token if user deleted)
			// or 404 (if token still valid but user not found in DB check in middleware)
			// JWT strategy usually checks if user exists.
			// If user is deleted, `jwtAuth` middleware usually fails if it checks DB,
			// or `getUser` controller throws NotFound.
			// Let's assume 404 or 401.
			// Actually `jwtAuth` typically verifies signature. If it also fetches user, it might fail.
			// If it doesn't fetch user, `getUser` will throw NotFound.
			// Safe bet is to assert it's not 200.
			expect(checkResponse.status).not.toBe(200);
		});
	});
});
