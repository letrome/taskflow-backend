import type {
	CreateUserDTO,
	PatchUserInformationDTO,
	UpdateEmailDTO,
	UpdatePasswordDTO,
	UpdateUserInformationDTO,
} from "@src/controllers/schemas/user.js";
import {
	ConflictError,
	NotFoundError,
	UnauthorizedError,
} from "@src/core/errors.js";
import logger from "@src/core/logger.js";
import { isDuplicateError } from "@src/core/utils.js";
import * as bcrypt from "bcrypt";
import { userRoleToModelRole } from "./mapper.js";
import User, { type IUser } from "./models/user.js";

export const createUser = async (userData: CreateUserDTO): Promise<IUser> => {
	try {
		const hash = await bcrypt.hash(userData.password, 10);
		const user = new User({
			email: userData.email,
			password_hash: hash,
			first_name: userData.first_name,
			last_name: userData.last_name,
			roles: userData.roles.map((role) => userRoleToModelRole[role]),
		});

		const savedUser = await user.save();
		return savedUser;
	} catch (error) {
		if (isDuplicateError(error)) {
			logger.warn(error, "Duplicate email - Conflict");
			throw new ConflictError("Email already exists");
		}
		throw error;
	}
};

export const getUser = async (id: string): Promise<IUser> => {
	const user = await User.findById(id);
	if (!user) {
		throw new NotFoundError("User not found");
	}
	return user;
};

export const updateUserInformation = async (
	id: string,
	userData: UpdateUserInformationDTO,
): Promise<IUser> => {
	const user = await User.findById(id);
	if (!user) {
		throw new NotFoundError("User not found");
	}
	user.first_name = userData.first_name;
	user.last_name = userData.last_name;
	return await user.save();
};

export const patchUserInformation = async (
	id: string,
	userData: PatchUserInformationDTO,
): Promise<IUser> => {
	const user = await User.findById(id);
	if (!user) {
		throw new NotFoundError("User not found");
	}
	user.first_name = userData.first_name ?? user.first_name;
	user.last_name = userData.last_name ?? user.last_name;

	return await user.save();
};

export const deleteUser = async (id: string): Promise<IUser> => {
	const user = await User.findById(id);
	if (!user) {
		throw new NotFoundError("User not found");
	}
	await user.deleteOne();
	return user;
};

export const updatePassword = async (
	id: string,
	userData: UpdatePasswordDTO,
): Promise<IUser> => {
	const user = await User.findById(id).select("+password_hash");
	if (!user) {
		throw new NotFoundError("User not found");
	}
	const db_password_hash = user.password_hash;
	const isPasswordValid = await bcrypt.compare(
		userData.old_password,
		db_password_hash,
	);
	if (!isPasswordValid) {
		throw new UnauthorizedError("Invalid password");
	}
	user.password_hash = await bcrypt.hash(userData.new_password, 10);
	return await user.save();
};

export const updateEmail = async (
	id: string,
	userData: UpdateEmailDTO,
): Promise<IUser> => {
	const user = await User.findById(id).select("+password_hash");
	if (!user) {
		throw new NotFoundError("User not found");
	}
	const db_password_hash = user.password_hash;
	const isPasswordValid = await bcrypt.compare(
		userData.password,
		db_password_hash,
	);
	if (!isPasswordValid) {
		throw new UnauthorizedError("Invalid password");
	}
	user.email = userData.email;
	try {
		return await user.save();
	} catch (error) {
		if (isDuplicateError(error)) {
			logger.warn(error, "Duplicate email - Conflict");
			throw new ConflictError("Email already exists");
		}
		throw error;
	}
};

export const addConsent = async (id: string): Promise<IUser> => {
	const user = await User.findById(id);
	if (!user) {
		throw new NotFoundError("User not found");
	}
	user.consent = true;
	user.last_consent_date = new Date();
	return await user.save();
};

export const removeConsent = async (id: string): Promise<IUser> => {
	const user = await User.findById(id);
	if (!user) {
		throw new NotFoundError("User not found");
	}
	user.consent = false;
	return await user.save();
};
