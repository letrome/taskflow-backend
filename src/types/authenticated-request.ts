import type { Request } from "express";

export interface AuthenticatedRequest<
	P = Record<string, string>,
	ResBody = unknown,
	ReqBody = unknown,
	ReqQuery = Record<string, string | string[] | undefined>,
	Locals extends Record<string, unknown> = Record<string, unknown>,
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
	auth: {
		userId: string;
		roles: string[];
	};
}
