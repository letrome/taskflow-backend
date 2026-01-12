import * as bcrypt from "bcrypt";
import type { CreateUserDTO } from "../controllers/schemas/user.js";
import {
	ConflictError,
	InternalServerError,
	NotFoundError,
} from "../core/errors.js";
import logger from "../core/logger.js";
import { isDuplicateError } from "../core/utils.js";
import User, { type IUser } from "./models/user.js";

export const createUser = async (userData: CreateUserDTO): Promise<IUser> => {
	try {
		const hash = await bcrypt.hash(userData.password, 10);
		const user = new User({
			email: userData.email,
			password_hash: hash,
			first_name: userData.first_name,
			last_name: userData.last_name,
			roles: userData.roles,
		});

		const savedUser = await user.save();
		return savedUser;
	} catch (error) {
		if (isDuplicateError(error)) {
			logger.warn(error, "Duplicate email - Conflict");
			throw new ConflictError("Email already exists");
		}
		logger.error(error, "Error creating user");
		throw new InternalServerError("Error creating user");
	}
};

export const getUser = async (id: string): Promise<IUser> => {
	try {
		const user = await User.findById(id);
		if (!user) {
			throw new NotFoundError();
		}
		return user;
	} catch (error) {
		if (error instanceof NotFoundError) {
			throw error;
		}
		// If ID is invalid (CastError), treat as User not found
		if (
			error &&
			typeof error === "object" &&
			"name" in error &&
			error.name === "CastError"
		) {
			throw new NotFoundError("User not found");
		}
		logger.error(error, "Error getting user");
		throw new InternalServerError("Error getting user");
	}
};
