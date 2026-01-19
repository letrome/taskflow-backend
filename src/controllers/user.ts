import * as userService from "@src/services/user.js";
import type { AuthenticatedRequest } from "@src/types/authenticated-request.js";
import type { Response } from "express";

export const getUser = async (
	req: AuthenticatedRequest<{ id: string }>,
	res: Response,
) => {
	const id = req.auth.userId;
	const user = await userService.getUser(id);
	res.status(200).json(user);
};
