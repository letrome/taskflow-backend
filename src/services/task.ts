import { BadRequestError, NotFoundError } from "@src/core/errors.js";
import logger from "@src/core/logger.js";
import type { CreateTaskDTO } from "../../dist/controllers/schemas/task.js";
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
			priority: taskData.priority,
			state: taskData.state,
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
