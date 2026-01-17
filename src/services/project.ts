import type {
	CreateOrUpdateProjectDTO,
	PatchProjectDTO,
} from "@src/controllers/schemas/project.js";
import { NotFoundError } from "@src/core/errors.js";
import { isDatabaseIDFormatError } from "@src/core/utils.js";
import mongoose from "mongoose";
import Project, { type IProject } from "./models/project.js";
import { type IUser, Roles } from "./models/user.js";

export const createProject = async (
	projectData: CreateOrUpdateProjectDTO,
	user_id: string,
): Promise<IProject> => {
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
		if (isDatabaseIDFormatError(error)) {
			throw new NotFoundError("Project not found");
		}

		throw error;
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
		if (isDatabaseIDFormatError(error)) {
			throw new NotFoundError("Project not found");
		}
		throw error;
	}
};

export const patchProject = async (
	id: string,
	user: IUser,
	projectData: PatchProjectDTO,
): Promise<IProject> => {
	try {
		const project = await Project.findById(id);
		if (
			!project ||
			(!user.roles.includes(Roles.ROLE_MANAGER) &&
				project.created_by.toString() !== user._id.toString())
		) {
			throw new NotFoundError("Project not found");
		}

		project.title = projectData.title ?? project.title;
		project.description = projectData.description ?? project.description;
		project.start_date = projectData.start_date ?? project.start_date;
		project.end_date = projectData.end_date ?? project.end_date;
		project.status = projectData.status ?? project.status;
		project.members = projectData.members
			? projectData.members.map((id) => new mongoose.Types.ObjectId(id))
			: project.members;

		return await project.save();
		// biome-ignore lint/suspicious/noExplicitAny: Error handling needs access to this
	} catch (error: any) {
		if (isDatabaseIDFormatError(error)) {
			throw new NotFoundError("Project not found");
		}
		throw error;
	}
};

export const deleteProject = async (
	id: string,
	user: IUser,
): Promise<IProject> => {
	try {
		const project = await getProjectForUser(id, user);
		await project.deleteOne();
		return project;
		// biome-ignore lint/suspicious/noExplicitAny: Error handling needs access to this
	} catch (error: any) {
		if (isDatabaseIDFormatError(error)) {
			throw new NotFoundError("Project not found");
		}
		throw error;
	}
};

export const addProjectMember = async (
	id: string,
	user: IUser,
	projectMembers: IUser[],
): Promise<IProject> => {
	const project = await getProjectForUser(id, user);
	if (!canUserEditProject(user, project)) {
		throw new NotFoundError("Project not found");
	}

	project.members.push(...projectMembers.map((member) => member._id));
	return await project.save();
};

export const removeProjectMember = async (
	id: string,
	user: IUser,
	memberId: string,
): Promise<IProject> => {
	const project = await getProjectForUser(id, user);
	if (!canUserEditProject(user, project)) {
		throw new NotFoundError("Project not found");
	}
	if (!project.members.some((member) => member.toString() === memberId)) {
		throw new NotFoundError("User not found");
	}
	project.members = project.members.filter(
		(member) => member.toString() !== memberId,
	);
	return await project.save();
};

const canUserEditProject = (user: IUser, project: IProject) => {
	return (
		user.roles.includes(Roles.ROLE_MANAGER) ||
		project.created_by.toString() === user._id.toString()
	);
};
