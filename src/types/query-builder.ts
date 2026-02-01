import type { TaskPriority, TaskState } from "@src/controllers/schemas/task.js";
import type { ITask } from "@src/services/models/task.js";
import type { FilterQuery } from "mongoose";

export interface PaginationQuery {
	offset?: string | number;
	limit?: string | number;
}

export type SortQuery = Record<string, 1 | -1> | undefined;

export type PopulateQuery = boolean | string[];

export interface TaskFilterResult {
	query: FilterQuery<ITask>;
	pagination: PaginationQuery;
	sort: SortQuery;
	populate: PopulateQuery;
}

export interface ValidatedTaskQuery {
	offset: number;
	limit: number;
	search?: string;
	priority?: TaskPriority[];
	state?: TaskState[];
	tags?: string[];
	due_date?: {
		gte?: Date;
		lte?: Date;
	};
	due_date_from?: Date;
	due_date_to?: Date;
	sort?: string;
	populate?: boolean;
}
