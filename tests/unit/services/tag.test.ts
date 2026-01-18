import { ConflictError, NotFoundError } from "@src/core/errors.js";
import Tag, { type ITag } from "@src/services/models/tag.js";
import {
	createTag,
	deleteTag,
	getTag,
	getTagsForProject,
	patchTag,
} from "@src/services/tag.js";
import mongoose from "mongoose";
import { describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("@src/core/logger.js");
vi.mock("@src/services/models/tag.js", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@src/services/models/tag.js")>();
	const TagMock = vi.fn();
	TagMock.prototype.save = vi.fn();
	return {
		...actual,
		default: TagMock,
	};
});

describe("Tag Service", () => {
	describe("createTag", () => {
		it("should create a tag successfully", async () => {
			const tagData = { name: "Bug" };
			const projectId = "project-id";

			const saveMock = vi.fn().mockResolvedValue({
				_id: "tag-id",
				name: "Bug",
				project: projectId,
			});

			vi.mocked(Tag).mockImplementation(
				class {
					save = saveMock;
				} as unknown as typeof Tag,
			);

			const result = await createTag(tagData, projectId);

			expect(result).toHaveProperty("_id", "tag-id");
			expect(result.name).toBe("Bug");
		});

		it("should throw ConflictError on duplicate key error", async () => {
			const tagData = { name: "Bug" };
			const projectId = "project-id";

			const duplicateError = {
				code: 11000,
			};

			const saveMock = vi.fn().mockRejectedValue(duplicateError);
			vi.mocked(Tag).mockImplementation(
				class {
					save = saveMock;
				} as unknown as typeof Tag,
			);

			await expect(createTag(tagData, projectId)).rejects.toThrow(
				ConflictError,
			);
		});

		it("should rethrow other errors", async () => {
			const tagData = { name: "Bug" };
			const projectId = "project-id";
			const error = new Error("DB Error");

			const saveMock = vi.fn().mockRejectedValue(error);
			vi.mocked(Tag).mockImplementation(
				class {
					save = saveMock;
				} as unknown as typeof Tag,
			);

			await expect(createTag(tagData, projectId)).rejects.toThrow(error);
		});
	});

	describe("getTag", () => {
		it("should return tag if found", async () => {
			const tag = { _id: "tag-id", name: "Bug" };
			vi.mocked(Tag).findById = vi.fn().mockResolvedValue(tag);

			const result = await getTag("tag-id");
			expect(result).toEqual(tag);
		});

		it("should throw NotFoundError if tag not found", async () => {
			vi.mocked(Tag).findById = vi.fn().mockResolvedValue(null);
			await expect(getTag("tag-id")).rejects.toThrow(NotFoundError);
		});

		it("should throw NotFoundError on CastError (invalid ID)", async () => {
			const castError = { name: "CastError" };
			vi.mocked(Tag).findById = vi.fn().mockRejectedValue(castError);
			await expect(getTag("invalid-id")).rejects.toThrow(NotFoundError);
		});

		it("should rethrow other errors", async () => {
			const error = new Error("DB Error");
			vi.mocked(Tag).findById = vi.fn().mockRejectedValue(error);
			await expect(getTag("tag-id")).rejects.toThrow(error);
		});
	});

	describe("getTagsForProject", () => {
		it("should return tags for project", async () => {
			const tags = [
				{ _id: "t1", name: "Bug" },
				{ _id: "t2", name: "Feature" },
			];
			vi.mocked(Tag).find = vi.fn().mockResolvedValue(tags);

			const result = await getTagsForProject("project-id");
			expect(result).toEqual(tags);
			expect(Tag.find).toHaveBeenCalledWith({ project: "project-id" });
		});

		it("should throw NotFoundError on CastError (invalid project ID)", async () => {
			const castError = { name: "CastError" };
			vi.mocked(Tag).find = vi.fn().mockRejectedValue(castError);
			await expect(getTagsForProject("invalid-id")).rejects.toThrow(
				NotFoundError,
			);
		});

		it("should rethrow other errors", async () => {
			const error = new Error("DB Error");
			vi.mocked(Tag).find = vi.fn().mockRejectedValue(error);
			await expect(getTagsForProject("project-id")).rejects.toThrow(error);
		});
	});

	describe("patchTag", () => {
		it("should update tag name", async () => {
			const tagMock = {
				name: "Old",
				project: "project-id",
				save: vi.fn().mockResolvedValue({ name: "New", project: "project-id" }),
			} as unknown as ITag;

			const result = await patchTag(tagMock, { name: "New" });
			expect(result.name).toBe("New");
			expect(tagMock.name).toBe("New");
			expect(tagMock.save).toHaveBeenCalled();
		});

		it("should update tag project", async () => {
			const oldProjectId = new mongoose.Types.ObjectId();
			const newProjectId = new mongoose.Types.ObjectId();

			const tagMock = {
				name: "Bug",
				project: oldProjectId,
				save: vi.fn().mockResolvedValue({ name: "Bug", project: newProjectId }),
			} as unknown as ITag;

			await patchTag(tagMock, { project: newProjectId.toString() });
			expect(tagMock.project.toString()).toBe(newProjectId.toString());
			expect(tagMock.save).toHaveBeenCalled();
		});

		it("should throw NotFoundError if updatedTag is null (rare race condition)", async () => {
			const tagMock = {
				name: "Old",
				save: vi.fn().mockResolvedValue(null),
			} as unknown as ITag;

			await expect(patchTag(tagMock, { name: "New" })).rejects.toThrow(
				NotFoundError,
			);
		});

		it("should throw ConflictError on duplicate name", async () => {
			const tagMock = {
				name: "Old",
				save: vi.fn().mockRejectedValue({ code: 11000 }),
			} as unknown as ITag;

			await expect(patchTag(tagMock, { name: "New" })).rejects.toThrow(
				ConflictError,
			);
		});

		it("should throw NotFoundError on CastError", async () => {
			const tagMock = {
				name: "Old",
				save: vi.fn().mockRejectedValue({ name: "CastError" }),
			} as unknown as ITag;

			await expect(patchTag(tagMock, { name: "New" })).rejects.toThrow(
				NotFoundError,
			);
		});
	});

	describe("deleteTag", () => {
		it("should delete tag", async () => {
			const tag = { _id: "tag-id" };
			vi.mocked(Tag).findByIdAndDelete = vi.fn().mockResolvedValue(tag);

			const result = await deleteTag("tag-id");
			expect(result).toEqual(tag);
		});

		it("should throw NotFoundError if tag not found", async () => {
			vi.mocked(Tag).findByIdAndDelete = vi.fn().mockResolvedValue(null);
			await expect(deleteTag("tag-id")).rejects.toThrow(NotFoundError);
		});

		it("should throw NotFoundError on CastError", async () => {
			vi.mocked(Tag).findByIdAndDelete = vi
				.fn()
				.mockRejectedValue({ name: "CastError" });
			await expect(deleteTag("invalid-id")).rejects.toThrow(NotFoundError);
		});
	});
});
