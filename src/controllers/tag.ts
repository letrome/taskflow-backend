import { BadRequestError } from "@src/core/errors.js";
import logger from "@src/core/logger.js";
import type { IUser } from "@src/services/models/user.js";
import * as projectService from "@src/services/project.js";
import * as tagService from "@src/services/tag.js";
import * as taskService from "@src/services/task.js";
import { getUser } from "@src/services/user.js";
import type { AuthenticatedRequest } from "@src/types/authenticated-request.js";
import type { Response } from "express";
import type { PatchTagDTO } from "./schemas/tag.js";

export const patchTag = async (
	req: AuthenticatedRequest<{ id: string }, Record<string, never>, PatchTagDTO>,
	res: Response,
) => {
	const tag_id = req.params.id;
	const user_id = req.auth.userId;

	const user = await getUser(user_id);
	const tag = await tagService.getTag(tag_id);

	await checkUserCanUpdateProject(tag.project.toString(), user);

	logger.info(`User ${user_id} is updating tag ${tag_id}`);
	if (req.body.project) {
		logger.info(`req.body.project: ${req.body.project}`);
		await checkUserCanUpdateProject(req.body.project, user);
		logger.info("next line");
	}

	const patchedTag = await tagService.patchTag(tag, req.body);
	res.status(200).json(patchedTag);
};

export const deleteTag = async (
	req: AuthenticatedRequest<
		{ id: string },
		Record<string, never>,
		Record<string, never>
	>,
	res: Response,
) => {
	const tag_id = req.params.id;
	const user_id = req.auth.userId;

	const user = await getUser(user_id);
	const tag = await tagService.getTag(tag_id);

	await checkUserCanUpdateProject(tag.project.toString(), user);
	await checkNoTaskIsUsingTag(tag_id);

	const deletedTag = await tagService.deleteTag(tag_id);
	res.status(200).json(deletedTag);
};

const checkUserCanUpdateProject = async (project_id: string, user: IUser) => {
	await projectService.getProjectForUser(project_id, user);
};

const checkNoTaskIsUsingTag = async (tag_id: string) => {
	const task = await taskService.getTasksForTag(tag_id);
	if (task.length > 0) {
		throw new BadRequestError("Tag is used by a task");
	}
};
