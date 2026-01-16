import type { CreateProjectDTO } from "@src/controllers/schemas/project.js";
import * as projectService from "@src/services/project.js";
import * as userService from "@src/services/user.js";
import type { NextFunction, Request, Response } from "express";

export const createProject = async (
	req: Request<Record<string, never>, Record<string, never>, CreateProjectDTO>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const user_id = req.auth?.userId;
		if (!user_id) {
			throw new Error("User ID is required");
		}
		const savedProject = await projectService.createProject(req.body, user_id);
		res.status(201).json(savedProject);
	} catch (error) {
		next(error);
	}
};

export const getProject = async (
	req: Request<{ id: string }>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const project_id = req.params.id;
		const user_id = req.auth?.userId;
		if (!project_id || !user_id) {
			throw new Error("User ID and project_id are required");
		}

		const user = await userService.getUser(user_id);

		const project = await projectService.getProjectForUser(project_id, user);
		res.status(200).json(project);
	} catch (error) {
		next(error);
	}
};

export const getProjects = async (
	req: Request<{ id: string }>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const user_id = req.auth?.userId;
		if (!user_id) {
			throw new Error("User ID is required");
		}

		const projects = await projectService.getProjectsForUser(user_id);
		res.status(200).json(projects);
	} catch (error) {
		next(error);
	}
};
