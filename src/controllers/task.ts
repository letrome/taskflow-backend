import { NotFoundError } from "@src/core/errors.js";
import type { ITask } from "@src/services/models/task.js";
import * as projectService from "@src/services/project.js";
import * as taskService from "@src/services/task.js";
import * as userService from "@src/services/user.js";
import type { AuthenticatedRequest } from "@src/types/authenticated-request.js";
import type { Response } from "express";
import type { PatchTaskDTO, TaskState } from "./schemas/task.js";

export const getTask = async (
	req: AuthenticatedRequest<{ id: string }>,
	res: Response,
) => {
	const task_id = req.params.id;
	const user_id = req.auth.userId;

	const task = await taskService.getTask(task_id);
	await checkUserCanReadOrUpdateTask(task, user_id);

	res.status(200).json(task);
};

export const patchTask = async (
	req: AuthenticatedRequest<
		{ id: string },
		Record<string, never>,
		PatchTaskDTO
	>,
	res: Response,
) => {
	const task_id = req.params.id;
	const user_id = req.auth.userId;

	const task = await taskService.getTask(task_id);
	await checkUserCanReadOrUpdateTask(task, user_id);

	const updatedTask = await taskService.patchTask(task_id, req.body);

	res.status(200).json(updatedTask);
};

export const setTaskStatus = async (
	req: AuthenticatedRequest<{ id: string; state: TaskState }>,
	res: Response,
) => {
	const task_id = req.params.id;
	const state = req.params.state;
	const user_id = req.auth.userId;

	const task = await taskService.getTask(task_id);
	await checkUserCanReadOrUpdateTask(task, user_id);

	const updatedTask = await taskService.patchTask(task_id, { state });

	res.status(200).json(updatedTask);
};

const checkUserCanReadOrUpdateTask = async (task: ITask, user_id: string) => {
	try {
		const user = await userService.getUser(user_id);
		const project_id = task.project.toString();
		await projectService.getProjectForUser(project_id, user);
	} catch (error) {
		if (error instanceof NotFoundError) {
			throw new NotFoundError("Task not found");
		}
		throw error;
	}
};
