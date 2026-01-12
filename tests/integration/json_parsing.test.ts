import app from "@src/app.js";
import request from "supertest";
import { describe, expect, it } from "vitest";

describe("JSON Parsing Error Handling", () => {
	it("should return 400 Bad Request for invalid JSON", async () => {
		const response = await request(app)
			.post("/admin/users") // Endpoint doesn't matter much as json parser is global
			.set("Content-Type", "application/json")
			.send('{"invalid": "json", }');
		expect(response.status).toBe(400);
	});
});
