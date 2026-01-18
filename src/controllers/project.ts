import type {
	AddProjectMemberDTO,
	CreateOrUpdateProjectDTO,
} from "@src/controllers/schemas/project.js";
import * as projectService from "@src/services/project.js";
import * as tagService from "@src/services/tag.js";
import * as userService from "@src/services/user.js";
import type { NextFunction, Request, Response } from "express";
import type { CreateTagDTO } from "./schemas/tag.js";

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

		// Check if user and members exists
		await userService.getUser(user_id);
		await fetchProjectMembers(req.body.members);

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

		// Check if user and members exists
		const user = await userService.getUser(user_id);
		await fetchProjectMembers(req.body.members);

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

		const user = await userService.getUser(user_id);
		const deletedProject = await projectService.deleteProject(project_id, user);
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
		const projectMembers = await fetchProjectMembers(req.body.members);
		const updatedProject = await projectService.addProjectMember(
			project_id,
			user,
			projectMembers,
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

const fetchProjectMembers = async (members: string[]) => {
	if (members && members.length > 0) {
		return await Promise.all(
			members.map((member_id) => userService.getUser(member_id)),
		);
	}
	return [];
};

export const createProjectTag = async (
	req: Request<{ id: string }, Record<string, never>, CreateTagDTO>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const project_id = req.params.id;
		const user_id = req.auth?.userId;
		if (!user_id || !project_id) {
			throw new Error("User ID and project_id are required");
		}

		// Check if user has the right to create a tag (must be creator, member or manager)
		const user = await userService.getUser(user_id);
		await projectService.getProjectForUser(project_id, user);

		const createdTag = await tagService.createTag(req.body, project_id);
		res.status(201).json(createdTag);
	} catch (error) {
		next(error);
	}
};

export const getProjectTags = async (
	req: Request<{ id: string }>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const project_id = req.params.id;
		if (!project_id) {
			throw new Error("Project ID is required");
		}

		const tags = await tagService.getTagsForProject(project_id);
		res.status(200).json(tags);
	} catch (error) {
		next(error);
	}
};
