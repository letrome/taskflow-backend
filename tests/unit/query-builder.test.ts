import { TaskPriority, TaskState } from "@src/controllers/schemas/task.js";
import {
	parseQuery,
	queryBuilderMiddleware,
} from "@src/middlewares/query-builder.js";
import type { ValidatedTaskQuery } from "@src/types/query-builder.js";
import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Query Builder Middleware", () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(() => {
		req = {
			params: { id: "proj123" },
			validatedQuery: {} as ValidatedTaskQuery,
		};
		res = {};
		next = vi.fn();
	});

	it("should parse query and attach taskQuery to request", () => {
		req.validatedQuery = {
			offset: 0,
			limit: 10,
		} as ValidatedTaskQuery;

		queryBuilderMiddleware(req as Request, res as Response, next);

		expect(req.taskQuery).toBeDefined();
		expect(req.taskQuery?.pagination.limit).toBe(10);
		expect(req.taskQuery?.pagination.offset).toBe(0);
		expect(next).toHaveBeenCalled();
	});

	it("should handle array param for project id", () => {
		// biome-ignore lint/suspicious/noExplicitAny: Simulating bad input
		req.params = { id: ["proj123"] as any };

		queryBuilderMiddleware(req as Request, res as Response, next);

		// Check if internal call used the first element, hard to check directly without mocking parseQuery
		// But we can check if it didn't crash and result has correct project filter
		expect(req.taskQuery?.query.project).toBe("proj123");
	});

	it("should handle missing validatedQuery gracefully (fallback to empty)", () => {
		req.validatedQuery = undefined;

		queryBuilderMiddleware(req as Request, res as Response, next);

		expect(req.taskQuery).toBeDefined();
		expect(next).toHaveBeenCalled();
	});
});

describe("Parse Query Logic", () => {
	const projectId = "proj123";

	it("should return default filter structure", () => {
		const query: ValidatedTaskQuery = {
			offset: 0,
			limit: 50,
		};
		const result = parseQuery(query, projectId);

		expect(result.query.project).toBe(projectId);
		expect(result.pagination).toEqual({ offset: 0, limit: 50 });
		expect(result.sort).toBeUndefined();
		expect(result.populate).toBe(false);
	});

	describe("Filtering", () => {
		it("should filter by priority", () => {
			const result = parseQuery(
				{ priority: [TaskPriority.HIGH] } as ValidatedTaskQuery,
				projectId,
			);
			expect(result.query.priority).toEqual({ $in: ["HIGH"] });
		});

		it("should filter by state", () => {
			const result = parseQuery(
				{
					state: [TaskState.OPEN, TaskState.IN_PROGRESS],
				} as ValidatedTaskQuery,
				projectId,
			);
			expect(result.query.state).toEqual({ $in: ["OPEN", "IN_PROGRESS"] });
		});

		it("should filter by tags", () => {
			const result = parseQuery(
				{ tags: ["tag1", "tag2"] } as ValidatedTaskQuery,
				projectId,
			);
			expect(result.query.tags).toEqual({ $in: ["tag1", "tag2"] });
		});

		it("should filter by search term", () => {
			const result = parseQuery(
				{ search: "bug" } as ValidatedTaskQuery,
				projectId,
			);
			expect(result.query.title).toEqual({ $regex: "bug", $options: "i" });
		});

		describe("Date Filtering", () => {
			it("should filter by exact dates (should not happen with current schema but logic supports ranges)", () => {
				// The middleware logic handles gte/lte from `due_date` object or `due_date_from/to`
				const date = new Date("2023-01-01");
				const result = parseQuery(
					{ due_date_from: date } as ValidatedTaskQuery,
					projectId,
				);
				expect(result.query.due_date).toEqual({ $gte: date });
			});

			it("should filter by due_date object", () => {
				const from = new Date("2023-01-01");
				const to = new Date("2023-01-31");
				const result = parseQuery(
					{ due_date: { gte: from, lte: to } } as ValidatedTaskQuery,
					projectId,
				);
				expect(result.query.due_date).toEqual({ $gte: from, $lte: to });
			});

			it("should filter by due_date_from and due_date_to", () => {
				const from = new Date("2023-01-01");
				const to = new Date("2023-01-31");
				const result = parseQuery(
					{ due_date_from: from, due_date_to: to } as ValidatedTaskQuery,
					projectId,
				);
				expect(result.query.due_date).toEqual({ $gte: from, $lte: to });
			});
		});
	});

	describe("Pagination", () => {
		it("should set offset and limit", () => {
			const result = parseQuery(
				{ offset: 10, limit: 20 } as ValidatedTaskQuery,
				projectId,
			);
			expect(result.pagination).toEqual({ offset: 10, limit: 20 });
		});
	});

	describe("Sorting", () => {
		it("should parse sort string", () => {
			const result = parseQuery(
				{ sort: "title,-due_date" } as ValidatedTaskQuery,
				projectId,
			);
			expect(result.sort).toEqual({ title: 1, due_date: -1 });
		});

		it("should handle single sort field", () => {
			const result = parseQuery(
				{ sort: "-priority" } as ValidatedTaskQuery,
				projectId,
			);
			expect(result.sort).toEqual({ priority: -1 });
		});
	});

	describe("Population", () => {
		it("should enable populate when true", () => {
			const result = parseQuery(
				{ populate: true } as ValidatedTaskQuery,
				projectId,
			);
			expect(result.populate).toEqual(["assignee", "tags"]);
		});

		it("should not populate when false or undefined", () => {
			const result = parseQuery(
				{ populate: false } as ValidatedTaskQuery,
				projectId,
			);
			expect(result.populate).toBe(false);
		});
	});
});
