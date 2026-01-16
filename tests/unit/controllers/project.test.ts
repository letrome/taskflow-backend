import {
	createProject,
	getProject,
	getProjects,
} from "@src/controllers/project.js";
import * as projectService from "@src/services/project.js";
import * as userService from "@src/services/user.js";
import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

vi.mock("@src/services/project.js");
vi.mock("@src/services/user.js");

describe("Project Controller", () => {
	const mockResponse = () => {
		const res = {} as Response;
		res.status = vi.fn().mockReturnValue(res);
		res.json = vi.fn().mockReturnValue(res);
		return res;
	};

	const mockNext = vi.fn();

	describe("createProject", () => {
		it("should create a project and return 201", async () => {
			const req = {
				body: { title: "Test Project" },
				auth: { userId: "user-id" },
			} as unknown as Request;
			const res = mockResponse();

			const createdProject = { _id: "project-id", ...req.body };
			vi.mocked(projectService.createProject).mockResolvedValue(createdProject);
			// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			await createProject(req as any, res, mockNext);

			expect(projectService.createProject).toHaveBeenCalledWith(
				req.body,
				"user-id",
			);
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith(createdProject);
		});

		it("should throw error if user ID is missing", async () => {
			const req = {
				body: { title: "Test Project" },
				auth: {},
			} as unknown as Request;
			const res = mockResponse();

			// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			await createProject(req as any, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith(new Error("User ID is required"));
		});

		it("should call next with error if service fails", async () => {
			const req = {
				body: { title: "Test Project" },
				auth: { userId: "user-id" },
			} as unknown as Request;
			const res = mockResponse();

			const error = new Error("Service Error");
			vi.mocked(projectService.createProject).mockRejectedValue(error);

			// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			await createProject(req as any, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});

	describe("getProject", () => {
		it("should return project and 200", async () => {
			const req = {
				params: { id: "project-id" },
				auth: { userId: "user-id" },
			} as unknown as Request;
			const res = mockResponse();

			const user = { _id: "user-id" };
			const project = { _id: "project-id" };

			// biome-ignore lint/suspicious/noExplicitAny: Mock implementation needs access to this
			vi.mocked(userService.getUser).mockResolvedValue(user as any);
			vi.mocked(projectService.getProjectForUser).mockResolvedValue(
				// biome-ignore lint/suspicious/noExplicitAny: Mock implementation needs access to this
				project as any,
			);

			// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			await getProject(req as any, res, mockNext);

			expect(userService.getUser).toHaveBeenCalledWith("user-id");
			expect(projectService.getProjectForUser).toHaveBeenCalledWith(
				"project-id",
				user,
			);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(project);
		});

		it("should throw error if params missing", async () => {
			const req = {
				params: {},
				auth: { userId: "user-id" },
			} as unknown as Request;
			const res = mockResponse();

			// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			await getProject(req as any, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith(
				new Error("User ID and project_id are required"),
			);
		});

		it("should call next with error if service fails", async () => {
			const req = {
				params: { id: "project-id" },
				auth: { userId: "user-id" },
			} as unknown as Request;
			const res = mockResponse();

			const error = new Error("Service Error");
			// biome-ignore lint/suspicious/noExplicitAny: Mock implementation needs access to this
			vi.mocked(userService.getUser).mockResolvedValue({} as any);
			vi.mocked(projectService.getProjectForUser).mockRejectedValue(error);

			// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			await getProject(req as any, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});

	describe("getProjects", () => {
		it("should return projects and 200", async () => {
			const req = {
				auth: { userId: "user-id" },
			} as unknown as Request;
			const res = mockResponse();

			const projects = [{ _id: "p1" }, { _id: "p2" }];
			vi.mocked(projectService.getProjectsForUser).mockResolvedValue(
				// biome-ignore lint/suspicious/noExplicitAny: Mock implementation needs access to this
				projects as any,
			);

			// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			await getProjects(req as any, res, mockNext);

			expect(projectService.getProjectsForUser).toHaveBeenCalledWith("user-id");
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(projects);
		});

		it("should throw error if user ID is missing", async () => {
			const req = {
				auth: {},
			} as unknown as Request;
			const res = mockResponse();

			// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			await getProjects(req as any, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith(new Error("User ID is required"));
		});

		it("should call next with error if service fails", async () => {
			const req = {
				auth: { userId: "user-id" },
			} as unknown as Request;
			const res = mockResponse();

			const error = new Error("Service Error");
			vi.mocked(projectService.getProjectsForUser).mockRejectedValue(error);

			// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			await getProjects(req as any, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});
});
