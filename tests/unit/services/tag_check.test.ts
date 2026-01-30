import { NotFoundError } from "@src/core/errors.js";
import Tag from "@src/services/models/tag.js";
import { checkTagExistForProject } from "@src/services/tag.js";
import mongoose from "mongoose";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

// Mock dependencies
vi.mock("@src/services/models/tag.js", async () => {
	const actual = await vi.importActual("@src/services/models/tag.js");
	// biome-ignore lint/suspicious/noExplicitAny: mock
	const MockTag = vi.fn() as any;
	MockTag.findById = vi.fn();
	return {
		...actual,
		default: MockTag,
	};
});

describe("Tag Service - Checks", () => {
    // Reset mocks before each test to ensure clean state
    beforeEach(() => {
        vi.clearAllMocks();
    });

	describe("checkTagExistForProject", () => {
		it("should return void if tag exists and belongs to project", async () => {
			const tagId = new mongoose.Types.ObjectId().toString();
			const projectId = new mongoose.Types.ObjectId().toString();

			(Tag.findById as Mock).mockResolvedValue({
				_id: tagId,
				project: projectId,
				// biome-ignore lint/suspicious/noExplicitAny: mock
			} as any);

			await expect(
				checkTagExistForProject(tagId, projectId),
			).resolves.not.toThrow();
			expect(Tag.findById).toHaveBeenCalledWith(tagId);
		});

		it("should throw NotFoundError if tag does not exist", async () => {
			const tagId = new mongoose.Types.ObjectId().toString();
			const projectId = "project-id";
			(Tag.findById as Mock).mockResolvedValue(null);

			await expect(checkTagExistForProject(tagId, projectId)).rejects.toThrow(
				NotFoundError,
			);
			expect(Tag.findById).toHaveBeenCalledWith(tagId);
		});

		it("should throw NotFoundError if tag belongs to different project", async () => {
			const tagId = new mongoose.Types.ObjectId().toString();
			const projectId = new mongoose.Types.ObjectId().toString();
            const otherProjectId = new mongoose.Types.ObjectId().toString();

			(Tag.findById as Mock).mockResolvedValue({
				_id: tagId,
				project: otherProjectId,
				// biome-ignore lint/suspicious/noExplicitAny: mock
			} as any);

			await expect(checkTagExistForProject(tagId, projectId)).rejects.toThrow(
				NotFoundError,
			);
			expect(Tag.findById).toHaveBeenCalledWith(tagId);
		});
	});
});
