import type {
	CreateTagDTO,
	PatchTagDTO,
} from "@src/controllers/schemas/tag.js";
import { ConflictError, NotFoundError } from "@src/core/errors.js";
import logger from "@src/core/logger.js";
import { isDuplicateError } from "@src/core/utils.js";
import Tag, { type ITag } from "@src/services/models/tag.js";
import mongoose from "mongoose";

export const createTag = async (
	tagData: CreateTagDTO,
	projectId: string,
): Promise<ITag> => {
	try {
		const tag = new Tag({
			name: tagData.name,
			project: projectId,
		});

		const savedTag = await tag.save();
		return savedTag;
	} catch (error) {
		if (isDuplicateError(error)) {
			logger.warn(error, "Duplicate tag name x project - Conflict");
			throw new ConflictError("Tag name already exists for this project");
		}
		throw error;
	}
};

export const getTag = async (tagId: string): Promise<ITag> => {
	const tag = await Tag.findById(tagId);
	if (!tag) {
		throw new NotFoundError("Tag not found");
	}
	return tag;
};

export const getTagsForProject = async (projectId: string): Promise<ITag[]> => {
	return await Tag.find({ project: projectId });
};

export const patchTag = async (
	tag: ITag,
	tagData: PatchTagDTO,
): Promise<ITag> => {
	if (!tagData) {
		return tag;
	}

	try {
		tag.name = tagData.name ?? tag.name;
		if (tagData.project) {
			tag.project = new mongoose.Types.ObjectId(tagData.project);
		}

		const updatedTag = await tag.save();

		if (!updatedTag) {
			throw new NotFoundError("Tag not found");
		}
		return updatedTag;
	} catch (error) {
		if (isDuplicateError(error)) {
			logger.warn(error, "Duplicate tag name x project - Conflict");
			throw new ConflictError("Tag name already exists for this project");
		}

		throw error;
	}
};

export const deleteTag = async (tagId: string): Promise<ITag> => {
	const tag = await Tag.findByIdAndDelete(tagId);
	if (!tag) {
		throw new NotFoundError("Tag not found");
	}
	return tag;
};

export const checkTagExistForProject = async (
	tag_id: string,
	project_id: string,
) => {
	const tag = await getTag(tag_id);
	if (!tag || tag.project.toString() !== project_id) {
		throw new NotFoundError("Tag not found");
	}
};
