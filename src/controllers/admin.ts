import fs from "node:fs";
import path from "node:path";
import type express from "express";
import client from "prom-client";
import * as adminService from "../services/admin.js";

import type { CreateUserDTO } from "./schemas/user.js";

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

export const getMetrics = async (_: express.Request, res: express.Response) => {
	res.set("Content-Type", client.register.contentType);
	res.status(200).send(await client.register.metrics());
};

export const getHealth = (_: express.Request, res: express.Response) => {
	res.status(200).json({ status: "OK" });
};

export const getVersion = (_: express.Request, res: express.Response) => {
	const packagePath = path.resolve(process.cwd(), "package.json");
	const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
	res.status(200).json({ version: packageJson.version });
};

export const createUser = async (
	req: express.Request<
		Record<string, never>,
		Record<string, never>,
		CreateUserDTO
	>,
	res: express.Response,
	next: express.NextFunction,
) => {
	try {
		const savedUser = await adminService.createUser(req.body);
		res.status(201).json(savedUser);
	} catch (error) {
		next(error);
	}
};

export const getUser = async (
	req: express.Request<{ id: string }>,
	res: express.Response,
	next: express.NextFunction,
) => {
	try {
		const id: string = req.params.id;
		const user = await adminService.getUser(id);
		res.status(200).json(user);
	} catch (error) {
		next(error);
	}
};
