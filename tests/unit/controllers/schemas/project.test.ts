import { createProjectSchema } from "@src/controllers/schemas/project.js";
import { describe, expect, it } from "vitest";

describe("Project Schema Validation", () => {
	it("should parse valid date strings", () => {
		const input = {
			title: "Project title",
			description: "Project description",
			start_date: new Date(Date.now() + 10000).toString(), // Future date
			end_date: new Date(Date.now() + 20000).toString(), // Future date
			status: "ACTIVE",
			members: [],
		};

		const result = createProjectSchema.safeParse(input);
		if (!result.success) {
			console.error(JSON.stringify(result.error.issues, null, 2));
		}
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.start_date).toBeInstanceOf(Date);
		}
	});

	it("should fail on past dates", () => {
		const input = {
			title: "Project title",
			description: "Project description",
			start_date: new Date(Date.now() - 10000).toString(), // Past date
			status: "ACTIVE",
			members: [],
		};
		const result = createProjectSchema.safeParse(input);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toContain(
				"must be in the future",
			);
		}
	});

	it("should fail if start date is missing", () => {
		const input = {
			title: "Project title",
			description: "Project description",
			status: "ACTIVE",
			members: [],
		};
		const result = createProjectSchema.safeParse(input);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toContain(
				"Start date is required",
			);
		}
	});

	it("should fail if start date is invalid", () => {
		const input = {
			title: "Project title",
			description: "Project description",
			start_date: "invalid",
			status: "ACTIVE",
			members: [],
		};
		const result = createProjectSchema.safeParse(input);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toContain(
				"Start date must be a valid date",
			);
		}
	});

	it("should fail if end date is invalid", () => {
		const input = {
			title: "Project title",
			description: "Project description",
			start_date: new Date(Date.now() + 10000).toString(),
			end_date: "invalid",
			status: "ACTIVE",
			members: [],
		};
		const result = createProjectSchema.safeParse(input);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toContain(
				"End date must be a valid date",
			);
		}
	});
});
