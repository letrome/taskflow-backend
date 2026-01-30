import type { IUser } from "@src/services/models/user.js";
import * as userService from "@src/services/user.js";
import type { AuthenticatedRequest } from "@src/types/authenticated-request.js";
import type { Response } from "express";
import type {
	PatchUserInformationDTO,
	UpdateEmailDTO,
	UpdatePasswordDTO,
	UpdateUserInformationDTO,
} from "./schemas/user.js";

export const getUser = async (
	req: AuthenticatedRequest<{ id: string }>,
	res: Response<IUser>,
) => {
	const id = req.auth.userId;
	const user = await userService.getUser(id);
	res.status(200).json(user);
};

export const updateUserInformation = async (
	req: AuthenticatedRequest<
		{ id: string },
		Record<string, never>,
		UpdateUserInformationDTO
	>,
	res: Response<IUser>,
) => {
	const id = req.auth.userId;
	const user = await userService.updateUserInformation(id, req.body);
	res.status(200).json(user);
};

export const patchUserInformation = async (
	req: AuthenticatedRequest<
		{ id: string },
		Record<string, never>,
		PatchUserInformationDTO
	>,
	res: Response<IUser>,
) => {
	const id = req.auth.userId;
	const user = await userService.patchUserInformation(id, req.body);
	res.status(200).json(user);
};

export const deleteUser = async (
	req: AuthenticatedRequest<{ id: string }>,
	res: Response<IUser>,
) => {
	const id = req.auth.userId;
	const user = await userService.deleteUser(id);
	res.status(200).json(user);
};

export const updatePassword = async (
	req: AuthenticatedRequest<
		{ id: string },
		Record<string, never>,
		UpdatePasswordDTO
	>,
	res: Response<IUser>,
) => {
	const id = req.auth.userId;
	const user = await userService.updatePassword(id, req.body);
	res.status(200).json(user);
};

export const updateEmail = async (
	req: AuthenticatedRequest<
		{ id: string },
		Record<string, never>,
		UpdateEmailDTO
	>,
	res: Response<IUser>,
) => {
	const id = req.auth.userId;
	const user = await userService.updateEmail(id, req.body);
	res.status(200).json(user);
};

export const addConsent = async (
	req: AuthenticatedRequest<{ id: string }>,
	res: Response<IUser>,
) => {
	const id = req.auth.userId;
	const user = await userService.addConsent(id);
	res.status(200).json(user);
};

export const removeConsent = async (
	req: AuthenticatedRequest<{ id: string }>,
	res: Response<IUser>,
) => {
	const id = req.auth.userId;
	const user = await userService.removeConsent(id);
	res.status(200).json(user);
};
