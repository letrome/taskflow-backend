import {
	createProject,
	createProjectTag,
	deleteProject,
	getProject,
	getProjects,
	getProjectTags,
	getProjectTasks,
	patchProject,
	updateProject,
} from "@src/controllers/project.js";
import * as projectService from "@src/services/project.js";
import * as tagService from "@src/services/tag.js";
import * as taskService from "@src/services/task.js";
import * as userService from "@src/services/user.js";
import type { Request } from "express";
import { describe, expect, it, vi } from "vitest";
import { createMockRequest, createMockResponse } from "../test-utils.js";

vi.mock("@src/services/project.js");
vi.mock("@src/services/user.js");
vi.mock("@src/services/tag.js");
vi.mock("@src/services/task.js");

describe("Project Controller", () => {
	const mockResponse = createMockResponse;

	const mockNext = vi.fn();
	const next = mockNext;

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
			await createProject(req as any, res);

			expect(projectService.createProject).toHaveBeenCalledWith(
				req.body,
				"user-id",
			);
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith(createdProject);
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
			await expect(createProject(req as any, res)).rejects.toThrow(error);
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
			await getProject(req as any, res);

			expect(userService.getUser).toHaveBeenCalledWith("user-id");
			expect(projectService.getProjectForUser).toHaveBeenCalledWith(
				"project-id",
				user,
			);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(project);
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
			await expect(getProject(req as any, res)).rejects.toThrow(error);
		});
	});

	describe("getProjects", () => {
		it("should return projects and 200", async () => {
			const request = createMockRequest({
				auth: { userId: "user-id", roles: ["ROLE_USER"] },
			});
			const response = createMockResponse();

			const projects = [{ _id: "p1" }, { _id: "p2" }];

			const user = { _id: "user-id" };
			// biome-ignore lint/suspicious/noExplicitAny: Mock implementation needs access to this
			vi.mocked(userService.getUser).mockResolvedValue(user as any);

			vi.mocked(projectService.getProjectsForUser).mockResolvedValue(
				// biome-ignore lint/suspicious/noExplicitAny: Mock implementation needs access to this
				projects as any,
			);

			// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			await getProjects(request as any, response);

			expect(userService.getUser).toHaveBeenCalledWith("user-id");
			expect(projectService.getProjectsForUser).toHaveBeenCalledWith(user);
			expect(response.status).toHaveBeenCalledWith(200);
			expect(response.json).toHaveBeenCalledWith(projects);
			expect(next).not.toHaveBeenCalled();
		});

		it("should call next with error if service fails", async () => {
			const request = createMockRequest({
				auth: { userId: "user-id", roles: ["ROLE_USER"] },
			});
			const response = createMockResponse();

			const error = new Error("Service Error");
			vi.mocked(projectService.getProjectsForUser).mockRejectedValue(error);

			// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			await expect(getProjects(request as any, response)).rejects.toThrow(
				error,
			);
			expect(next).not.toHaveBeenCalled();
		});
	});

	describe("updateProject", () => {
		it("should update project and return 200", async () => {
			const request = createMockRequest({
				params: { id: "p1" },
				body: { title: "Updated" },
				auth: { userId: "user-id", roles: ["ROLE_USER"] },
			});
			const response = createMockResponse();

			// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			const user = { _id: "user-id" } as any;
			vi.mocked(userService.getUser).mockResolvedValue(user);
			vi.mocked(projectService.updateProject).mockResolvedValue({
				_id: "p1",
				title: "Updated",
				// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			} as any);

			// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			await updateProject(request as any, response);

			expect(userService.getUser).toHaveBeenCalledWith("user-id");
			expect(projectService.updateProject).toHaveBeenCalledWith(
				"p1",
				user,
				request.body,
			);
			expect(response.status).toHaveBeenCalledWith(200);
			expect(response.json).toHaveBeenCalled();
			expect(next).not.toHaveBeenCalled();
		});

		it("should call next with error if service fails", async () => {
			const request = createMockRequest({
				params: { id: "p1" },
				body: { title: "Updated" },
				auth: { userId: "user-id", roles: ["ROLE_USER"] },
			});
			const response = createMockResponse();

			const error = new Error("Service Error");
			vi.mocked(userService.getUser).mockRejectedValue(error);

			// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			await expect(updateProject(request as any, response)).rejects.toThrow(
				error,
			);
			expect(next).not.toHaveBeenCalled();
		});
	});

	describe("patchProject", () => {
		it("should patch project and return 200", async () => {
			const request = createMockRequest({
				params: { id: "p1" },
				body: { title: "Patched" },
				auth: { userId: "user-id", roles: ["ROLE_USER"] },
			});
			const response = createMockResponse();

			// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			const user = { _id: "user-id" } as any;
			vi.mocked(userService.getUser).mockResolvedValue(user);
			vi.mocked(projectService.patchProject).mockResolvedValue({
				_id: "p1",
				title: "Patched",
				// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			} as any);

			// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			await patchProject(request as any, response);

			expect(userService.getUser).toHaveBeenCalledWith("user-id");
			expect(projectService.patchProject).toHaveBeenCalledWith(
				"p1",
				user,
				request.body,
			);
			expect(response.status).toHaveBeenCalledWith(200);
			expect(response.json).toHaveBeenCalled();
			expect(next).not.toHaveBeenCalled();
		});

		it("should call next with error if service fails", async () => {
			const request = createMockRequest({
				params: { id: "p1" },
				body: { title: "Patched" },
				auth: { userId: "user-id", roles: ["ROLE_USER"] },
			});
			const response = createMockResponse();

			const error = new Error("Service Error");
			vi.mocked(userService.getUser).mockRejectedValue(error);

			// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			await expect(patchProject(request as any, response)).rejects.toThrow(
				error,
			);
			expect(next).not.toHaveBeenCalled();
		});
	});

	describe("deleteProject", () => {
		it("should delete project and return 200", async () => {
			const request = createMockRequest({
				params: { id: "p1" },
				auth: { userId: "user-id", roles: ["ROLE_USER"] },
			});
			const response = createMockResponse();

			const user = { _id: "user-id" };
			// biome-ignore lint/suspicious/noExplicitAny: Mock implementation needs access to this
			vi.mocked(userService.getUser).mockResolvedValue(user as any);

			vi.mocked(projectService.deleteProject).mockResolvedValue({
				_id: "p1",
				// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			} as any);

			// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			await deleteProject(request as any, response);

			expect(userService.getUser).toHaveBeenCalledWith("user-id");
			expect(projectService.deleteProject).toHaveBeenCalledWith("p1", user);
			expect(response.status).toHaveBeenCalledWith(200);
			expect(response.json).toHaveBeenCalled();
			expect(next).not.toHaveBeenCalled();
		});

		it("should call next with error if service fails", async () => {
			const request = createMockRequest({
				params: { id: "p1" },
				auth: { userId: "user-id", roles: ["ROLE_USER"] },
			});
			const response = createMockResponse();

			const error = new Error("Service Error");
			vi.mocked(projectService.deleteProject).mockRejectedValue(error);

			// biome-ignore lint/suspicious/noExplicitAny: Unit tests
			await expect(deleteProject(request as any, response)).rejects.toThrow(
				error,
			);
			expect(next).not.toHaveBeenCalled();
		});
	});

	describe("createProjectTag", () => {
		it("should create a tag and return 201", async () => {
			const req = createMockRequest({
				params: { id: "p1" },
				body: { name: "Bug" },
				auth: { userId: "user-id" },
			} as unknown as Request);
			const res = mockResponse();

			const user = { _id: "user-id" };
			const tag = { _id: "t1", name: "Bug" };

			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(userService.getUser).mockResolvedValue(user as any);
			vi.mocked(projectService.getProjectForUser).mockResolvedValue({
				_id: "p1",
				// biome-ignore lint/suspicious/noExplicitAny: Mocking
			} as any);
			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(tagService.createTag).mockResolvedValue(tag as any);

			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			await createProjectTag(req as any, res);

			expect(userService.getUser).toHaveBeenCalledWith("user-id");
			expect(projectService.getProjectForUser).toHaveBeenCalledWith("p1", user);
			expect(tagService.createTag).toHaveBeenCalledWith(req.body, "p1");
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith(tag);
		});

		it("should throw error if user/project ID is missing", async () => {
			const req = {
				params: { id: "p1" },
				auth: {},
			} as unknown as Request;
			const res = mockResponse();

			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			await expect(createProjectTag(req as any, res)).rejects.toThrow();
		});

		it("should call next with error if service fails", async () => {
			const req = {
				params: { id: "p1" },
				auth: { userId: "user-id" },
			} as unknown as Request;
			const res = mockResponse();

			const error = new Error("Service Error");
			vi.mocked(userService.getUser).mockRejectedValue(error);

			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			await expect(createProjectTag(req as any, res)).rejects.toThrow(error);
		});
	});

	describe("getProjectTags", () => {
		it("should return tags and 200", async () => {
			const req = {
				params: { id: "p1" },
			} as unknown as Request;
			const res = mockResponse();

			const tags = [{ _id: "t1" }];
			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(tagService.getTagsForProject).mockResolvedValue(tags as any);

			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			await getProjectTags(req as any, res);

			expect(tagService.getTagsForProject).toHaveBeenCalledWith("p1");
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(tags);
		});

		it("should throw error if project ID is missing", async () => {
			const req = {
				params: {},
			} as unknown as Request;
			const res = mockResponse();

			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			await expect(getProjectTags(req as any, res)).rejects.toThrow();
		});

		it("should call next with error if service fails", async () => {
			const req = {
				params: { id: "p1" },
			} as unknown as Request;
			const res = mockResponse();

			const error = new Error("Service Error");
			vi.mocked(tagService.getTagsForProject).mockRejectedValue(error);

			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			await expect(getProjectTags(req as any, res)).rejects.toThrow(error);
		});
	});

	describe("getProjectTasks", () => {
		it("should return project tasks and 200", async () => {
			const req = {
				params: { id: "p1" },
				auth: { userId: "user-id" },
			} as unknown as Request;
			const res = mockResponse();

			const user = { _id: "user-id" };
			const tasks = [{ _id: "task1" }];

			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(userService.getUser).mockResolvedValue(user as any);
			vi.mocked(projectService.getProjectForUser).mockResolvedValue({
				_id: "p1",
				// biome-ignore lint/suspicious/noExplicitAny: Mocking
			} as any);
			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(taskService.getTasksForProject).mockResolvedValue(tasks as any);

			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			await getProjectTasks(req as any, res);

			expect(userService.getUser).toHaveBeenCalledWith("user-id");
			expect(projectService.getProjectForUser).toHaveBeenCalledWith("p1", user);
			expect(taskService.getTasksForProject).toHaveBeenCalledWith(
				{},
				false,
				undefined,
				{},
			);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(tasks);
		});
	});
});
