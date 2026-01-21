import type {
	CreateTaskDTO,
	PatchTaskDTO,
} from "@src/controllers/schemas/task.js";
import { BadRequestError, NotFoundError } from "@src/core/errors.js";
import logger from "@src/core/logger.js";

import {
	stringToObjectId,
	taskPriorityToModelPriority,
	taskStateToModelState,
} from "./mapper.js";
import Task, {
	type ITask,
	isAssigneeDoesNotExistError,
	isTagDoesNotExistError,
} from "./models/task.js";

export const createTask = async (
	taskData: CreateTaskDTO,
	project_id: string,
): Promise<ITask> => {
	try {
		const task = new Task({
			title: taskData.title,
			description: taskData.description,
			due_date: taskData.due_date,
			priority: taskPriorityToModelPriority[taskData.priority],
			state: taskStateToModelState[taskData.state],
			project: project_id,
			assignee: taskData.assignee,
			tags: taskData.tags,
		});

		return await task.save();
	} catch (error) {
		if (isAssigneeDoesNotExistError(error as Error)) {
			logger.debug(error);
			throw new BadRequestError("Assignee does not exist");
		}
		if (isTagDoesNotExistError(error as Error)) {
			logger.debug(error);
			throw new BadRequestError("Tag does not exist");
		}
		throw error;
	}
};

export const getTasksForProject = async (
	project_id: string,
): Promise<ITask[]> => {
	return await Task.find({ project: project_id });
};

export const getTask = async (task_id: string): Promise<ITask> => {
	const task = await Task.findById(task_id);
	if (!task) {
		throw new NotFoundError("Task not found");
	}

	return task;
};

export const patchTask = async (
	task_id: string,
	taskData: PatchTaskDTO,
): Promise<ITask> => {
	const task = await Task.findById(task_id);
	if (!task) {
		throw new NotFoundError("Task not found");
	}

	if (!taskData) {
		return task;
	}

	task.title = taskData.title || task.title;
	task.description = taskData.description || task.description;
	task.due_date = taskData.due_date || task.due_date;
	task.priority = taskData.priority
		? taskPriorityToModelPriority[taskData.priority]
		: task.priority;
	task.state = taskData.state
		? taskStateToModelState[taskData.state]
		: task.state;
	if (taskData.assignee) {
		task.assignee = stringToObjectId(taskData.assignee);
	}
	if (taskData.tags) {
		task.tags = taskData.tags.map((tag) => stringToObjectId(tag));
	}

	return await task.save();
};

export const deleteTask = async (task_id: string): Promise<ITask> => {
	const task = await Task.findByIdAndDelete(task_id);
	if (!task) {
		throw new NotFoundError("Task not found");
	}

	return task;
};
