import type {
	AddProjectMemberDTO,
	CreateOrUpdateProjectDTO,
} from "@src/controllers/schemas/project.js";
import * as projectService from "@src/services/project.js";
import * as userService from "@src/services/user.js";
import type { NextFunction, Request, Response } from "express";

export const createProject = async (
	req: Request<
		Record<string, never>,
		Record<string, never>,
		CreateOrUpdateProjectDTO
	>,
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

		const user = await userService.getUser(user_id);
		const projects = await projectService.getProjectsForUser(user);
		res.status(200).json(projects);
	} catch (error) {
		next(error);
	}
};

export const updateProject = async (
	req: Request<{ id: string }, Record<string, never>, CreateOrUpdateProjectDTO>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const project_id = req.params.id;
		const user_id = req.auth?.userId;
		if (!user_id || !project_id) {
			throw new Error("User ID and project_id are required");
		}
		const user = await userService.getUser(user_id);
		const updatedProject = await projectService.updateProject(
			project_id,
			user,
			req.body,
		);
		res.status(200).json(updatedProject);
	} catch (error) {
		next(error);
	}
};

export const patchProject = async (
	req: Request<{ id: string }, Record<string, never>, CreateOrUpdateProjectDTO>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const project_id = req.params.id;
		const user_id = req.auth?.userId;
		if (!user_id || !project_id) {
			throw new Error("User ID and project_id are required");
		}
		const user = await userService.getUser(user_id);
		const patchedProject = await projectService.patchProject(
			project_id,
			user,
			req.body,
		);
		res.status(200).json(patchedProject);
	} catch (error) {
		next(error);
	}
};

export const deleteProject = async (
	req: Request<{ id: string }>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const project_id = req.params.id;
		const user_id = req.auth?.userId;
		if (!user_id || !project_id) {
			throw new Error("User ID and project_id are required");
		}
		const deletedProject = await projectService.deleteProject(
			project_id,
			user_id,
		);
		res.status(200).json(deletedProject);
	} catch (error) {
		next(error);
	}
};

export const addProjectMember = async (
	req: Request<{ id: string }, Record<string, never>, AddProjectMemberDTO>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const project_id = req.params.id;
		const user_id = req.auth?.userId;
		if (!user_id || !project_id) {
			throw new Error("User ID and project_id are required");
		}
		const user = await userService.getUser(user_id);
		const updatedProject = await projectService.addProjectMember(
			project_id,
			user,
			req.body,
		);
		res.status(200).json(updatedProject);
	} catch (error) {
		next(error);
	}
};

export const removeProjectMember = async (
	req: Request<{ id: string; memberId: string }>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const projectId = req.params.id;
		const memberId = req.params.memberId;
		const userId = req.auth?.userId;
		if (!userId || !projectId) {
			throw new Error("User ID and project_id are required");
		}
		const user = await userService.getUser(userId);
		const updatedProject = await projectService.removeProjectMember(
			projectId,
			user,
			memberId,
		);
		res.status(200).json(updatedProject);
	} catch (error) {
		next(error);
	}
};
