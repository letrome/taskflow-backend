import * as projectService from "@src/services/project.js";
import * as tagService from "@src/services/tag.js";
import { getUser } from "@src/services/user.js";
import type { NextFunction, Request, Response } from "express";
import type { PatchTagDTO } from "./schemas/tag.js";

export const patchTag = async (
	req: Request<{ id: string }, Record<string, never>, PatchTagDTO>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const tag_id = req.params.id;
		const user_id = req.auth?.userId;
		if (!user_id || !tag_id) {
			throw new Error("User ID and tag ID are required");
		}

		const user = await getUser(user_id);

		// Check if user has the right to update the tag (must be creator, member or manager)
		const prevTag = await tagService.getTag(tag_id);
		await projectService.getProjectForUser(prevTag.project.toString(), user);

		if (req.body.project) {
			// Check if user can move tag to the new project (must be creator, member or manager)
			await projectService.getProjectForUser(req.body.project, user);
		}

		const patchedTag = await tagService.patchTag(prevTag, req.body);
		res.status(200).json(patchedTag);
	} catch (error) {
		next(error);
	}
};

export const deleteTag = async (
	req: Request<{ id: string }, Record<string, never>, Record<string, never>>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const tag_id = req.params.id;
		const user_id = req.auth?.userId;
		if (!user_id || !tag_id) {
			throw new Error("User ID and tag ID are required");
		}

		const user = await getUser(user_id);

		// Check if user has the right to update the tag (must be creator, member or manager)
		const tag = await tagService.getTag(tag_id);
		await projectService.getProjectForUser(tag.project.toString(), user);

		const deletedTag = await tagService.deleteTag(tag_id);
		res.status(200).json(deletedTag);
	} catch (error) {
		next(error);
	}
};
