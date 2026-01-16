import type {
	AddProjectMemberDTO,
	CreateOrUpdateProjectDTO,
	PatchProjectDTO,
} from "@src/controllers/schemas/project.js";
import {
	BadRequestError,
	InternalServerError,
	NotFoundError,
} from "@src/core/errors.js";
import logger from "@src/core/logger.js";
import mongoose from "mongoose";
import Project, { type IProject } from "./models/project.js";
import { type IUser, Roles } from "./models/user.js";
import { getUser } from "./user.js";

export const createProject = async (
	projectData: CreateOrUpdateProjectDTO,
	user_id: string,
): Promise<IProject> => {
	try {
		// Check if user and members exists
		await getUser(user_id);
		await fetchProjectMembers(projectData.members);

		const project = new Project({
			title: projectData.title,
			description: projectData.description,
			start_date: projectData.start_date,
			end_date: projectData.end_date,
			status: projectData.status,
			created_by: user_id,
			members: projectData.members,
		});

		const savedProject = await project.save();
		return savedProject;
		// biome-ignore lint/suspicious/noExplicitAny: Error handling needs access to this
	} catch (error: any) {
		if (error instanceof NotFoundError) {
			throw new BadRequestError("One or more members do not exist");
		}

		if (error.name === "ValidationError") {
			const message = Object.values(
				(error as mongoose.Error.ValidationError).errors,
			)
				.map((val) => val.message)
				.join(", ");
			throw new BadRequestError(`Validation Error: ${message}`);
		}

		logger.error(error, "Error creating project");
		throw new InternalServerError("Error creating project");
	}
};

export const getProjectForUser = async (
	id: string,
	user: IUser,
): Promise<IProject> => {
	try {
		const user_id = user._id.toString();

		const project = user.roles.includes(Roles.ROLE_MANAGER)
			? await Project.findById(id)
			: await Project.findOne({
					_id: id,
					$or: [{ created_by: user_id }, { members: user_id }],
				});

		if (!project) {
			throw new NotFoundError("Project not found");
		}

		return project;
		// biome-ignore lint/suspicious/noExplicitAny: Error handling needs access to this
	} catch (error: any) {
		if (error instanceof NotFoundError) {
			throw error;
		}

		if (isUserIDFormatError(error)) {
			throw new NotFoundError("Project not found");
		}

		logger.error(error, "Error getting project");
		throw new InternalServerError("Internal server error");
	}
};

export const getProjectsForUser = async (user: IUser): Promise<IProject[]> => {
	return user.roles.includes(Roles.ROLE_MANAGER)
		? Project.find({})
		: Project.find({
				$or: [{ created_by: user._id }, { members: user._id }],
			});
};

export const updateProject = async (
	id: string,
	user: IUser,
	projectData: CreateOrUpdateProjectDTO,
): Promise<IProject> => {
	try {
		await fetchProjectMembers(projectData.members);

		const oldProject: IProject | null = await Project.findById(id);
		if (!oldProject || !canUserEditProject(user, oldProject)) {
			throw new NotFoundError("Project not found");
		}

		oldProject.title = projectData.title;
		oldProject.description = projectData.description;
		oldProject.start_date = projectData.start_date;
		if (projectData.end_date) {
			oldProject.end_date = projectData.end_date;
		} else {
			oldProject.end_date = undefined;
		}
		oldProject.status = projectData.status;
		oldProject.members = projectData.members.map(
			(id) => new mongoose.Types.ObjectId(id),
		);

		const updatedProject = await oldProject.save();
		return updatedProject;
		// biome-ignore lint/suspicious/noExplicitAny: Error handling needs access to this
	} catch (error: any) {
		if (
			error instanceof NotFoundError &&
			error.message !== "Project not found"
		) {
			throw new BadRequestError("One or more members do not exist");
		}
		if (
			error instanceof NotFoundError &&
			error.message === "Project not found"
		) {
			throw error;
		}
		if (isUserIDFormatError(error)) {
			throw new NotFoundError("Project not found");
		}

		if (error.name === "ValidationError") {
			console.error(
				"Service Validation Error:",
				JSON.stringify(error, null, 2),
			);
			const message = Object.values(
				(error as mongoose.Error.ValidationError).errors,
			)
				.map((val) => val.message)
				.join(", ");
			throw new BadRequestError(`Validation Error: ${message}`);
		}

		logger.error(error, "Error updating project");
		throw new InternalServerError("Error updating project");
	}
};

export const patchProject = async (
	id: string,
	user: IUser,
	projectData: PatchProjectDTO,
): Promise<IProject> => {
	try {
		await getUser(user._id.toString());
		if (projectData.members && projectData.members.length > 0) {
			await Promise.all(
				projectData.members.map((member_id) => getUser(member_id)),
			);
		}

		const oldProject = await Project.findById(id);
		if (
			!oldProject ||
			(!user.roles.includes(Roles.ROLE_MANAGER) &&
				oldProject.created_by.toString() !== user._id.toString())
		) {
			throw new NotFoundError("Project not found");
		}

		oldProject.title = projectData.title ?? oldProject.title;
		oldProject.description = projectData.description ?? oldProject.description;
		oldProject.start_date = projectData.start_date ?? oldProject.start_date;
		oldProject.end_date = projectData.end_date ?? oldProject.end_date;
		oldProject.status = projectData.status ?? oldProject.status;
		oldProject.members = projectData.members
			? projectData.members.map((id) => new mongoose.Types.ObjectId(id))
			: oldProject.members;

		return await oldProject.save();
		// biome-ignore lint/suspicious/noExplicitAny: Error handling needs access to this
	} catch (error: any) {
		if (error instanceof NotFoundError) {
			throw error;
		}

		if (
			error &&
			typeof error === "object" &&
			"name" in error &&
			error.name === "CastError"
		) {
			throw new NotFoundError("Project not found");
		}

		logger.error(error, "Error updating project");
		throw new InternalServerError("Internal server error");
	}
};

export const deleteProject = async (
	id: string,
	user_id: string,
): Promise<IProject> => {
	try {
		const user = await getUser(user_id);
		const project = await getProjectForUser(id, user);
		await project.deleteOne();
		return project;
		// biome-ignore lint/suspicious/noExplicitAny: Error handling needs access to this
	} catch (error: any) {
		if (error instanceof NotFoundError) {
			throw error;
		}

		if (
			error &&
			typeof error === "object" &&
			"name" in error &&
			error.name === "CastError"
		) {
			throw new NotFoundError("Project not found");
		}

		logger.error(error, "Error deleting project");
		throw new InternalServerError("Internal server error");
	}
};

export const addProjectMember = async (
	id: string,
	user: IUser,
	data: AddProjectMemberDTO,
): Promise<IProject> => {
	try {
		const project = await getProjectForUser(id, user);
		if (!canUserEditProject(user, project)) {
			throw new NotFoundError("Project not found");
		}
		const projectMembers = await fetchProjectMembers(data.members);

		project.members.push(...projectMembers.map((member) => member._id));
		return await project.save();
		// biome-ignore lint/suspicious/noExplicitAny: Error handling needs access to this
	} catch (error: any) {
		if (error instanceof NotFoundError) {
			throw error;
		}

		logger.error(error, "Error adding project member");
		throw new InternalServerError("Internal server error");
	}
};

export const removeProjectMember = async (
	id: string,
	user: IUser,
	member_id: string,
): Promise<IProject> => {
	try {
		const project = await getProjectForUser(id, user);
		if (!canUserEditProject(user, project)) {
			throw new NotFoundError("Project not found");
		}
		if (!project.members.some((member) => member.toString() === member_id)) {
			throw new NotFoundError("User not found");
		}
		project.members = project.members.filter(
			(member) => member.toString() !== member_id,
		);
		return await project.save();
		// biome-ignore lint/suspicious/noExplicitAny: Error handling needs access to this
	} catch (error: any) {
		if (error instanceof NotFoundError) {
			throw error;
		}

		logger.error(error, "Error removing project member");
		throw new InternalServerError("Internal server error");
	}
};

const canUserEditProject = (user: IUser, project: IProject) => {
	return (
		user.roles.includes(Roles.ROLE_MANAGER) ||
		project.created_by.toString() === user._id.toString()
	);
};

const fetchProjectMembers = async (members: string[]) => {
	if (members && members.length > 0) {
		return await Promise.all(members.map((member_id) => getUser(member_id)));
	}
	return [];
};

const isUserIDFormatError = (error: Error) => {
	return (
		error &&
		typeof error === "object" &&
		"name" in error &&
		error.name === "CastError"
	);
};
