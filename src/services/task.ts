import type {
	CreateTaskDTO,
	PatchTaskDTO,
} from "@src/controllers/schemas/task.js";
import {
	BadRequestError,
	ConflictError,
	NotFoundError,
} from "@src/core/errors.js";
import logger from "@src/core/logger.js";
import type {
	PaginationQuery,
	PopulateQuery,
	SortQuery,
} from "@src/types/query-builder.js";
import type { FilterQuery, QueryOptions, Types } from "mongoose";
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
	query: FilterQuery<ITask>,
	populate: PopulateQuery,
	sort: SortQuery,
	pagination: PaginationQuery,
): Promise<ITask[]> => {
	const options: QueryOptions<ITask> = {
		sort,
	};
	if (pagination) {
		const p = pagination;
		if (p.limit) {
			options.limit = Number.parseInt(String(p.limit), 10);
		}
		if (p.offset) {
			options.skip = Number.parseInt(String(p.offset), 10);
		}
	}

	// biome-ignore lint/suspicious/noExplicitAny: exactOptionalPropertyTypes mismatch in Mongoose FilterQuery
	const findQuery = Task.find(query as any);
	findQuery.setOptions(options);
	if (Array.isArray(populate)) {
		findQuery.populate(populate);
	}
	return await findQuery;
};

export const getTasksForTag = async (tag_id: string): Promise<ITask[]> => {
	return await Task.find({ tags: tag_id });
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
		task.tags = taskData.tags.map((tag) =>
			stringToObjectId(tag),
		) as Types.Array<Types.ObjectId>;
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

export const addTaskTag = async (
	task_id: string,
	tag_id: string,
): Promise<string[]> => {
	const task = await Task.findById(task_id);
	if (!task) {
		throw new NotFoundError("Task not found");
	}

	const tagObjectId = stringToObjectId(tag_id);
	if (task.tags.some((t) => t.equals(tagObjectId))) {
		throw new ConflictError("Tag already assigned");
	}

	task.tags.push(tagObjectId);

	try {
		const savedTask = await task.save();
		return savedTask.tags.map((tag) => tag.toString());
	} catch (error) {
		if (isTagDoesNotExistError(error as Error)) {
			logger.debug(error);
			throw new BadRequestError("Tag does not exist");
		}
		throw error;
	}
};

export const removeTaskTag = async (
	task_id: string,
	tag_id: string,
): Promise<string[]> => {
	const task = await Task.findById(task_id);
	if (!task) {
		throw new NotFoundError("Task not found");
	}

	if (!task.tags.some((t) => t.equals(stringToObjectId(tag_id)))) {
		throw new BadRequestError("Tag does not exist");
	}

	task.tags.pull(stringToObjectId(tag_id));

	await task.save();
	return [tag_id];
};
