import type { Request, Response } from "express";
import { vi } from "vitest";

export const createMockRequest = <T extends Request = Request>(
	data: Partial<T> = {},
): T => {
	return data as T;
};

export const createMockResponse = (): Response => {
	const res = {} as Response;
	res.status = vi.fn().mockReturnValue(res);
	res.json = vi.fn().mockReturnValue(res);
	res.send = vi.fn().mockReturnValue(res);
	res.set = vi.fn().mockReturnValue(res);
	return res;
};
