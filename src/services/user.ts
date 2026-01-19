import type { CreateUserDTO } from "@src/controllers/schemas/user.js";
import { ConflictError, NotFoundError } from "@src/core/errors.js";
import logger from "@src/core/logger.js";
import { isDuplicateError } from "@src/core/utils.js";
import * as bcrypt from "bcrypt";
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
