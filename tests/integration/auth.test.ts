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
