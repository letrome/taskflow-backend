import { deleteTag, patchTag } from "@src/controllers/tag.js";
import * as projectService from "@src/services/project.js";
import * as tagService from "@src/services/tag.js";
import * as taskService from "@src/services/task.js";
import * as userService from "@src/services/user.js";
import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

vi.mock("@src/services/project.js");
vi.mock("@src/services/tag.js");
vi.mock("@src/services/user.js");
vi.mock("@src/services/task.js");

describe("Tag Controller", () => {
	const mockResponse = () => {
		const res = {} as Response;
		res.status = vi.fn().mockReturnValue(res);
		res.json = vi.fn().mockReturnValue(res);
		return res;
	};

	const mockNext = vi.fn();

	describe("patchTag", () => {
		it("should patch a tag and return 200", async () => {
			const req = {
				params: { id: "tag-id" },
				body: { name: "Updated Tag" },
				auth: { userId: "user-id" },
			} as unknown as Request;
			const res = mockResponse();

			const user = { _id: "user-id" };
			const prevTag = { _id: "tag-id", project: "project-id" };
			const patchedTag = { _id: "tag-id", name: "Updated Tag" };

			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(userService.getUser).mockResolvedValue(user as any);
			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(tagService.getTag).mockResolvedValue(prevTag as any);
			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(tagService.patchTag).mockResolvedValue(patchedTag as any);

			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			await patchTag(req as any, res);

			expect(userService.getUser).toHaveBeenCalledWith("user-id");
			expect(tagService.getTag).toHaveBeenCalledWith("tag-id");
			expect(projectService.getProjectForUser).toHaveBeenCalledWith(
				"project-id",
				user,
			);
			expect(tagService.patchTag).toHaveBeenCalledWith(prevTag, req.body);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(patchedTag);
		});

		it("should validate project access if moving tag", async () => {
			const req = {
				params: { id: "tag-id" },
				body: { project: "new-project-id" },
				auth: { userId: "user-id" },
			} as unknown as Request;
			const res = mockResponse();

			const user = { _id: "user-id" };
			const prevTag = { _id: "tag-id", project: "old-project-id" };

			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(userService.getUser).mockResolvedValue(user as any);
			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(tagService.getTag).mockResolvedValue(prevTag as any);

			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			await patchTag(req as any, res);

			expect(projectService.getProjectForUser).toHaveBeenCalledWith(
				"old-project-id",
				user,
			);
			expect(projectService.getProjectForUser).toHaveBeenCalledWith(
				"new-project-id",
				user,
			);
		});

		it("should call next with error if service fails", async () => {
			const req = {
				params: { id: "tag-id" },
				auth: { userId: "user-id" },
			} as unknown as Request;
			const res = mockResponse();

			const error = new Error("Service Error");
			vi.mocked(userService.getUser).mockRejectedValue(error);

			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			await expect(patchTag(req as any, res)).rejects.toThrow(error);
			expect(mockNext).not.toHaveBeenCalled();
		});
	});

	describe("deleteTag", () => {
		it("should delete a tag and return 200", async () => {
			const req = {
				params: { id: "tag-id" },
				auth: { userId: "user-id" },
			} as unknown as Request;
			const res = mockResponse();

			const user = { _id: "user-id" };
			const tag = { _id: "tag-id", project: "project-id" };

			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(userService.getUser).mockResolvedValue(user as any);
			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(tagService.getTag).mockResolvedValue(tag as any);
			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(tagService.deleteTag).mockResolvedValue(tag as any);
			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(taskService.getTasksForTag).mockResolvedValue([] as any);

			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			await deleteTag(req as any, res);

			expect(userService.getUser).toHaveBeenCalledWith("user-id");
			expect(tagService.getTag).toHaveBeenCalledWith("tag-id");
			expect(projectService.getProjectForUser).toHaveBeenCalledWith(
				"project-id",
				user,
			);
			expect(tagService.deleteTag).toHaveBeenCalledWith("tag-id");
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(tag);
		});

		it("should call next with error if service fails", async () => {
			const req = {
				params: { id: "tag-id" },
				auth: { userId: "user-id" },
			} as unknown as Request;
			const res = mockResponse();

			const error = new Error("Service Error");
			vi.mocked(userService.getUser).mockRejectedValue(error);

			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			await expect(deleteTag(req as any, res)).rejects.toThrow(error);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should throw BadRequestError if tag is used by a task", async () => {
			const req = {
				params: { id: "tag-id" },
				auth: { userId: "user-id" },
			} as unknown as Request;
			const res = mockResponse();

			const user = { _id: "user-id" };
			const tag = { _id: "tag-id", project: "project-id" };

			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(userService.getUser).mockResolvedValue(user as any);
			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(tagService.getTag).mockResolvedValue(tag as any);
			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			vi.mocked(taskService.getTasksForTag).mockResolvedValue([{ _id: "task-id" }] as any);

			// biome-ignore lint/suspicious/noExplicitAny: Mocking
			await expect(deleteTag(req as any, res)).rejects.toThrow(
				"Tag is used by a task",
			);
		});
	});
});
