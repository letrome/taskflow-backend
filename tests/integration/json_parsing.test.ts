import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../../src/app.js";

describe("JSON Parsing Error Handling", () => {
	it("should return 400 Bad Request for invalid JSON", async () => {
		const response = await request(app)
			.post("/admin/users") // Endpoint doesn't matter much as json parser is global
			.set("Content-Type", "application/json")
			.send('{"invalid": "json", }'); // Trailing comma is invalid JSON

		// Current behavior is 500, we expect 400 after fix
		// Use a conditional expectation or just verify the failure first
		expect(response.status).toBe(400);
	});
});
