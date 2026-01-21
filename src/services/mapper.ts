import { ProjectStatus } from "@src/controllers/schemas/project.js";
import { TaskPriority, TaskState } from "@src/controllers/schemas/task.js";
import { UserRole } from "@src/controllers/schemas/user.js";
import { Status } from "./models/project.js";
import { Priority, State } from "./models/task.js";
import { Roles } from "./models/user.js";

export const projectStatusToModelStatus: Record<ProjectStatus, Status> = {
	[ProjectStatus.ACTIVE]: Status.ACTIVE,
	[ProjectStatus.ARCHIVED]: Status.ARCHIVED,
};

export const taskPriorityToModelPriority: Record<TaskPriority, Priority> = {
	[TaskPriority.LOW]: Priority.LOW,
	[TaskPriority.MEDIUM]: Priority.MEDIUM,
	[TaskPriority.HIGH]: Priority.HIGH,
};

export const taskStateToModelState: Record<TaskState, State> = {
	[TaskState.OPEN]: State.OPEN,
	[TaskState.IN_PROGRESS]: State.IN_PROGRESS,
	[TaskState.CLOSED]: State.CLOSED,
};

export const userRoleToModelRole: Record<UserRole, Roles> = {
	[UserRole.ROLE_USER]: Roles.ROLE_USER,
	[UserRole.ROLE_MANAGER]: Roles.ROLE_MANAGER,
};
