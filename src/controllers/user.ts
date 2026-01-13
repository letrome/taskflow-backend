import * as userService from "@src/services/user.js";
import type { NextFunction, Request, Response } from "express";

export const getUser = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const id = req.params.id ?? req.auth?.userId;
		if (!id) {
			throw new Error("User ID is required");
		}
		const user = await userService.getUser(id);
		res.status(200).json(user);
	} catch (error) {
		next(error);
	}
};
