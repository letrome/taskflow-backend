import * as authService from "@src/services/auth.js";
import type express from "express";

import type { LoginSchemaDto, RegisterSchemaDto } from "./schemas/auth.js";

export const register = async (
	req: express.Request<
		Record<string, never>,
		Record<string, never>,
		RegisterSchemaDto
	>,
	res: express.Response,
) => {
	const user = await authService.register(req.body);
	res.status(201).json(user);
};

export const login = async (
	req: express.Request<
		Record<string, never>,
		Record<string, never>,
		LoginSchemaDto
	>,
	res: express.Response,
) => {
	const loginInfo = await authService.login(req.body);
	res.status(200).json(loginInfo);
};
