import type {
	CreateOrUpdateProjectDTO,
	PatchProjectDTO,
} from "@src/controllers/schemas/project.js";
import { BadRequestError, NotFoundError } from "@src/core/errors.js";
import logger from "@src/core/logger.js";
import mongoose from "mongoose";
import { projectStatusToModelStatus } from "./mapper.js";
import Project, {
	type IProject,
	isCreatorDoesNotExistError,
	isMemberDoesNotExistError,
} from "./models/project.js";
import { type IUser, Roles } from "./models/user.js";

export const createProject = async (
	projectData: CreateOrUpdateProjectDTO,
	user_id: string,
): Promise<IProject> => {
	try {
		const project = new Project({
			title: projectData.title,
			description: projectData.description,
			start_date: projectData.start_date,
			end_date: projectData.end_date,
			status: projectStatusToModelStatus[projectData.status],
			created_by: user_id,
			members: projectData.members,
		});

		const savedProject = await project.save();
		return savedProject;
	} catch (error: unknown) {
		if (isMemberDoesNotExistError(error as Error)) {
			logger.debug(error);
			throw new BadRequestError("Member does not exist");
		}
		if (isCreatorDoesNotExistError(error as Error)) {
			logger.debug(error);
			throw new BadRequestError("Creator does not exist");
		}
		throw error;
	}
};

export const getProjectForUser = async (
	id: string,
	user: IUser,
	includeMembers: boolean = true,
): Promise<IProject> => {
	const project = await getProject(id, user._id, user.roles, includeMembers);

	if (!project) {
		throw new NotFoundError("Project not found");
	}

	return project;
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
		const includeMembers = false;
		const project = await getProjectForUser(id, user, includeMembers);

		project.title = projectData.title;
		project.description = projectData.description;
		project.start_date = projectData.start_date;
		if (projectData.end_date) {
			project.end_date = projectData.end_date;
		} else {
			project.end_date = undefined;
		}
		project.status = projectStatusToModelStatus[projectData.status];

		const uniqueMembers = [...new Set(projectData.members)];
		project.members = uniqueMembers.map(
			(id) => new mongoose.Types.ObjectId(id),
		);

		return await project.save();
	} catch (error) {
		if (isMemberDoesNotExistError(error as Error)) {
			logger.debug(error);
			throw new BadRequestError("Member does not exist");
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
		const includeMembers = false;
		const project = await getProjectForUser(id, user, includeMembers);

		if (!projectData) {
			return project;
		}

		project.title = projectData.title ?? project.title;
		project.description = projectData.description ?? project.description;
		project.start_date = projectData.start_date ?? project.start_date;
		project.end_date = projectData.end_date ?? project.end_date;
		if (projectData.status) {
			project.status = projectStatusToModelStatus[projectData.status];
		}

		if (projectData.members) {
			const uniqueMembers = [...new Set(projectData.members)];
			project.members = uniqueMembers.map(
				(id) => new mongoose.Types.ObjectId(id),
			);
		}

		return await project.save();
	} catch (error) {
		if (isMemberDoesNotExistError(error as Error)) {
			logger.debug(error);
			throw new BadRequestError("Member does not exist");
		}
		throw error;
	}
};

export const deleteProject = async (
	id: string,
	user: IUser,
): Promise<IProject> => {
	const includeMembers = false;
	const project = await getProjectForUser(id, user, includeMembers);
	await project.deleteOne();
	return project;
};

export const addProjectMember = async (
	id: string,
	user: IUser,
	projectMembers: string[],
): Promise<string[]> => {
	try {
		const includeMembers = false;
		const project = await getProjectForUser(id, user, includeMembers);
		if (!project) {
			throw new NotFoundError("Project not found");
		}

		const existingMembersSet = new Set(
			project.members.map((m) => m.toString()),
		);
		const uniqueNewMembers = projectMembers.filter(
			(m) => !existingMembersSet.has(m),
		);
		const uniqueNewMembersSet = new Set(uniqueNewMembers);

		project.members.push(
			...Array.from(uniqueNewMembersSet).map(
				(member) => new mongoose.Types.ObjectId(member),
			),
		);
		const updatedProject = await project.save();
		return updatedProject.members.map((member) => member.toString());
	} catch (error) {
		if (isMemberDoesNotExistError(error as Error)) {
			logger.debug(error);
			throw new BadRequestError("Member does not exist");
		}
		throw error;
	}
};

export const removeProjectMember = async (
	id: string,
	user: IUser,
	memberId: string,
): Promise<string[]> => {
	const includeMembers = false;
	const project = await getProjectForUser(id, user, includeMembers);

	project.members = project.members.filter(
		(member) => member.toString() !== memberId,
	);
	const updatedProject = await project.save();
	return updatedProject.members.map((member) => member.toString());
};

const getProject = async (
	project_id: string,
	user_id: mongoose.Types.ObjectId,
	roles: string[],
	includeMembers: boolean,
) => {
	if (roles.includes(Roles.ROLE_MANAGER)) {
		return Project.findById(project_id);
	}

	if (includeMembers) {
		return Project.findOne({
			_id: project_id,
			$or: [{ created_by: user_id }, { members: user_id }],
		});
	}
	return Project.findOne({
		_id: project_id,
		created_by: user_id,
	});
};
