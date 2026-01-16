import Project, { Status } from "@src/services/models/project.js";
import mongoose from "mongoose";
import { describe, expect, it } from "vitest";

describe("Project Model", () => {
	it("should pass validation with valid data", () => {
		const project = new Project({
			title: "Project Alpha",
			description: "A new project",
			start_date: new Date(),
			status: Status.ACTIVE,
			created_by: new mongoose.Types.ObjectId(),
			members: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
		});

		const error = project.validateSync();
		expect(error).toBeUndefined();
	});

	it("should fail validation if required fields are missing", () => {
		const project = new Project({}); // Empty object

		const error = project.validateSync();
		expect(error).toBeDefined();
		expect(error?.errors.title).toBeDefined();
		expect(error?.errors.description).toBeDefined();
		expect(error?.errors.start_date).toBeDefined();
		expect(error?.errors.created_by).toBeDefined();
	});

	it("should fail validation if status contains invalid value", () => {
		const project = new Project({
			title: "Project Beta",
			description: "Another project",
			start_date: new Date(),
			status: "INVALID_STATUS",
			created_by: new mongoose.Types.ObjectId(),
			members: [],
		});

		const error = project.validateSync();
		expect(error).toBeDefined();
		expect(error?.errors.status).toBeDefined();
	});

	it("should default to ACTIVE if status is not provided", () => {
		const project = new Project({
			title: "Project Gamma",
			description: "Default status check",
			start_date: new Date(),
			created_by: new mongoose.Types.ObjectId(),
			members: [],
		});

		const error = project.validateSync();
		expect(error).toBeUndefined();
		expect(project.status).toBe(Status.ACTIVE);
	});
});
