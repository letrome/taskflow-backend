import type { TaskFilterResult } from "./query-builder.js";

declare global {
	namespace Express {
		interface Request {
			auth?: {
				userId: string;
				roles: string[];
			};
			taskQuery?: TaskFilterResult;
			validatedQuery?: unknown;
		}
	}
}
