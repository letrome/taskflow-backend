import type { Application } from "express";
import request from "supertest";

export const postUser = async (app: Application) => {
	const auth = Buffer.from("admin:test-secret").toString("base64");
	const user = {
		email: `test-${Date.now()}@test.com`,
		password: "password",
		first_name: "First",
		last_name: "Last",
		roles: ["ROLE_USER"],
	};

	const response = await request(app)
		.post("/admin/users")
		.set("Authorization", `Basic ${auth}`)
		.send(user);

	return { ...user, ...response.body };
};
