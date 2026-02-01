import { BadRequestError } from "@src/core/errors.js";
import logger from "@src/core/logger.js";
import type { ITask } from "@src/services/models/task.js";
import type {
	TaskFilterResult as TaskQuery,
	ValidatedTaskQuery,
} from "@src/types/query-builder.js";
import type { NextFunction, Request, Response } from "express";
import type { FilterQuery } from "mongoose";

export const queryBuilderMiddleware = (
	req: Request,
	_res: Response,
	next: NextFunction,
) => {
	try {
		const id = req.params.id || "";
		const project_id = (Array.isArray(id) ? id[0] : id) || "";
		// We expect validatedQuery to be present because of validation middleware
		// If not, we fallback to empty object but type safety suggests validatedQuery should be used if available
		const query =
			(req.validatedQuery as ValidatedTaskQuery) || ({} as ValidatedTaskQuery);
		req.taskQuery = parseQuery(query, project_id);
		next();
	} catch (error) {
		logger.debug({ err: error }, "Error parsing query parameters");
		throw new BadRequestError("Invalid query parameters");
	}
};

export const parseQuery = (
	query: ValidatedTaskQuery,
	project_id: string,
): TaskQuery => {
	const filter: TaskQuery = {
		query: buildFilterQuery(query, project_id),
		pagination: buildPagination(query),
		sort: buildSort(query),
		populate: buildPopulate(query),
	};

	return filter;
};

const buildFilterQuery = (
	query: ValidatedTaskQuery,
	project_id: string,
): FilterQuery<ITask> => {
	const filter: FilterQuery<ITask> = {};
	filter.project = project_id;

	if (query.priority && query.priority.length > 0) {
		filter.priority = { $in: query.priority };
	}

	if (query.state && query.state.length > 0) {
		filter.state = { $in: query.state };
	}

	if (query.tags && query.tags.length > 0) {
		filter.tags = { $in: query.tags };
	}

	if (query.due_date || query.due_date_from || query.due_date_to) {
		const dateFilter: Record<string, Date> = {};

		const start = query.due_date_from || query.due_date?.gte;
		const end = query.due_date_to || query.due_date?.lte;

		if (start) {
			dateFilter.$gte = start;
		}
		if (end) {
			dateFilter.$lte = end;
		}

		if (Object.keys(dateFilter).length > 0) {
			filter.due_date = dateFilter;
		}
	}

	if (query.search) {
		filter.title = { $regex: query.search, $options: "i" };
	}

	return filter;
};

const buildPagination = (
	query: ValidatedTaskQuery,
): TaskQuery["pagination"] => {
	const pagination: TaskQuery["pagination"] = {};

	if (query.offset !== undefined) {
		pagination.offset = query.offset;
	}

	if (query.limit !== undefined) {
		pagination.limit = query.limit;
	}

	return pagination;
};

const buildSort = (
	query: ValidatedTaskQuery,
): TaskQuery["sort"] | undefined => {
	if (query.sort) {
		const sort: Record<string, 1 | -1> = {};
		query.sort.split(",").forEach((sortField) => {
			const field = sortField.replace(/^[+-]/, "");
			const direction = sortField.startsWith("-") ? -1 : 1;
			sort[field] = direction;
		});
		return sort;
	}

	return undefined;
};

const buildPopulate = (query: ValidatedTaskQuery): TaskQuery["populate"] => {
	let populate: TaskQuery["populate"] = false;

	if (query.populate === true) {
		populate = ["assignee", "tags"];
	}

	return populate;
};
