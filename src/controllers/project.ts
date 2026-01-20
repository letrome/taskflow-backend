import type {
	AddProjectMemberDTO,
	CreateOrUpdateProjectDTO,
} from "@src/controllers/schemas/project.js";
import * as projectService from "@src/services/project.js";
import * as tagService from "@src/services/tag.js";
import * as taskService from "@src/services/task.js";
import * as userService from "@src/services/user.js";
import type { AuthenticatedRequest } from "@src/types/authenticated-request.js";
import type { Response } from "express";
import type { CreateTaskDTO } from "../../dist/controllers/schemas/task.js";
import type { CreateTagDTO } from "./schemas/tag.js";

export const createProject = async (
	req: AuthenticatedRequest<
		Record<string, never>,
		Record<string, never>,
		CreateOrUpdateProjectDTO
	>,
	res: Response,
) => {
	const user_id = req.auth.userId;

	const savedProject = await projectService.createProject(req.body, user_id);
	res.status(201).json(savedProject);
};

export const getProject = async (
	req: AuthenticatedRequest<{ id: string }>,
	res: Response,
) => {
	const project_id = req.params.id;
	const user_id = req.auth?.userId;

	const user = await userService.getUser(user_id);

	const project = await projectService.getProjectForUser(project_id, user);
	res.status(200).json(project);
};

export const getProjects = async (
	req: AuthenticatedRequest<{ id: string }>,
	res: Response,
) => {
	const user_id = req.auth.userId;

	const user = await userService.getUser(user_id);
	const projects = await projectService.getProjectsForUser(user);
	res.status(200).json(projects);
};

export const updateProject = async (
	req: AuthenticatedRequest<
		{ id: string },
		Record<string, never>,
		CreateOrUpdateProjectDTO
	>,
	res: Response,
) => {
	const project_id = req.params.id;
	const user_id = req.auth.userId;

	const user = await userService.getUser(user_id);
	const updatedProject = await projectService.updateProject(
		project_id,
		user,
		req.body,
	);
	res.status(200).json(updatedProject);
};

export const patchProject = async (
	req: AuthenticatedRequest<
		{ id: string },
		Record<string, never>,
		CreateOrUpdateProjectDTO
	>,
	res: Response,
) => {
	const project_id = req.params.id;
	const user_id = req.auth.userId;

	const user = await userService.getUser(user_id);

	const patchedProject = await projectService.patchProject(
		project_id,
		user,
		req.body,
	);
	res.status(200).json(patchedProject);
};

export const deleteProject = async (
	req: AuthenticatedRequest<{ id: string }>,
	res: Response,
) => {
	const project_id = req.params.id;
	const user_id = req.auth.userId;

	const user = await userService.getUser(user_id);
	const deletedProject = await projectService.deleteProject(project_id, user);
	res.status(200).json(deletedProject);
};

export const addProjectMember = async (
	req: AuthenticatedRequest<
		{ id: string },
		Record<string, never>,
		AddProjectMemberDTO
	>,
	res: Response,
) => {
	const project_id = req.params.id;
	const user_id = req.auth.userId;

	const user = await userService.getUser(user_id);
	const updatedProjectMembers = await projectService.addProjectMember(
		project_id,
		user,
		req.body.members,
	);
	res.status(200).json(updatedProjectMembers);
};

export const removeProjectMember = async (
	req: AuthenticatedRequest<{ id: string; memberId: string }>,
	res: Response,
) => {
	const projectId = req.params.id;
	const memberId = req.params.memberId;
	const userId = req.auth.userId;

	const user = await userService.getUser(userId);
	const updatedProjectMembers = await projectService.removeProjectMember(
		projectId,
		user,
		memberId,
	);
	res.status(200).json(updatedProjectMembers);
};

export const createProjectTag = async (
	req: AuthenticatedRequest<
		{ id: string },
		Record<string, never>,
		CreateTagDTO
	>,
	res: Response,
) => {
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
};

export const getProjectTags = async (
	req: AuthenticatedRequest<{ id: string }>,
	res: Response,
) => {
	const project_id = req.params.id;
	if (!project_id) {
		throw new Error("Project ID is required");
	}

	const tags = await tagService.getTagsForProject(project_id);
	res.status(200).json(tags);
};

export const createProjectTask = async (
	req: AuthenticatedRequest<
		{ id: string },
		Record<string, never>,
		CreateTaskDTO
	>,
	res: Response,
) => {
	const project_id = req.params.id;
	const user_id = req.auth.userId;

	// Check if user has the right to create a task (must be creator, member or manager)
	const user = await userService.getUser(user_id);
	await projectService.getProjectForUser(project_id, user);

	const createdTask = await taskService.createTask(req.body, project_id);
	res.status(201).json(createdTask);
};

export const getProjectTasks = async (
	req: AuthenticatedRequest<{ id: string }>,
	res: Response,
) => {
	const project_id = req.params.id;
	const user_id = req.auth.userId;

	// Check if user has the right to create a task (must be creator, member or manager)
	const user = await userService.getUser(user_id);
	await projectService.getProjectForUser(project_id, user);

	const tasks = await taskService.getTasksForProject(project_id);
	res.status(200).json(tasks);
};
