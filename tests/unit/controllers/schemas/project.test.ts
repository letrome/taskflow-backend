import {
	createOrUpdateProjectSchema,
	patchProjectSchema,
} from "@src/controllers/schemas/project.js";
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

		const result = createOrUpdateProjectSchema.safeParse(input);
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
		const result = createOrUpdateProjectSchema.safeParse(input);
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
		const result = createOrUpdateProjectSchema.safeParse(input);
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
		const result = createOrUpdateProjectSchema.safeParse(input);
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
		const result = createOrUpdateProjectSchema.safeParse(input);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toContain(
				"End date must be a valid date",
			);
		}
	});
});

describe("Patch Project Schema Validation", () => {
	it("should parse valid partial input", () => {
		const input = {
			title: "Updated Title",
		};
		const result = patchProjectSchema.safeParse(input);
		expect(result.success).toBe(true);
	});

	it("should parse valid full input", () => {
		const input = {
			title: "Updated Title",
			description: "Updated Description",
			start_date: new Date(Date.now() + 10000).toString(),
			end_date: new Date(Date.now() + 20000).toString(),
			status: "ACTIVE",
			members: ["507f1f77bcf86cd799439011"],
		};
		const result = patchProjectSchema.safeParse(input);
		expect(result.success).toBe(true);
	});

	it("should fail on invalid date", () => {
		const input = {
			start_date: "invalid-date",
		};
		const result = patchProjectSchema.safeParse(input);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toContain(
				"Start date must be a valid date",
			);
		}
	});

	it("should fail on past date", () => {
		const input = {
			start_date: new Date(Date.now() - 10000).toString(),
		};
		const result = patchProjectSchema.safeParse(input);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toContain(
				"must be in the future",
			);
		}
	});

	it("should fail on empty start_date string", () => {
		const input = {
			start_date: "",
		};
		const result = patchProjectSchema.safeParse(input);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toContain(
				"Start date is required",
			);
		}
	});

	it("should fail on empty end_date string", () => {
		const input = {
			end_date: "",
		};
		const result = patchProjectSchema.safeParse(input);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toContain("End date is required");
		}
	});

	it("should fail on empty status string", () => {
		const input = {
			status: "",
		};
		const result = patchProjectSchema.safeParse(input);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe("Status is required");
		}
	});

	it("should allow empty input (all optional)", () => {
		const input = {};
		const result = patchProjectSchema.safeParse(input);
		expect(result.success).toBe(true);
	});
});
