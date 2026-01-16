import type { CreateProjectDTO } from "@src/controllers/schemas/project.js";
import {
	BadRequestError,
	InternalServerError,
	NotFoundError,
} from "@src/core/errors.js";
import logger from "@src/core/logger.js";
import Project, { type IProject } from "./models/project.js";
import { type IUser, Roles } from "./models/user.js";
import { getUser } from "./user.js";

export const createProject = async (
	projectData: CreateProjectDTO,
	user_id: string,
): Promise<IProject> => {
	try {
		await getUser(user_id);
		if (projectData.members && projectData.members.length > 0) {
			await Promise.all(
				projectData.members.map((member_id) => getUser(member_id)),
			);
		}

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
		// biome-ignore lint/suspicious/noExplicitAny: Mock implementation needs access to this
	} catch (error: any) {
		if (error instanceof NotFoundError) {
			throw new BadRequestError("One or more members do not exist");
		}
		if (
			error &&
			typeof error === "object" &&
			"name" in error &&
			error.name === "CastError"
		) {
			throw new BadRequestError("Invalid user ID format");
		}
		if (error.name === "ValidationError") {
			const message = Object.values(error.errors)
				// biome-ignore lint/suspicious/noExplicitAny: Mock implementation needs access to this
				.map((val: any) => val.message)
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
	} catch (error) {
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

		logger.error(error, "Error getting project");
		throw new InternalServerError("Internal server error");
	}
};

export const getProjectsForUser = async (
	user_id: string,
): Promise<IProject[]> => {
	return Project.find({
		$or: [{ created_by: user_id }, { members: user_id }],
	});
};
