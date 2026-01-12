import * as bcrypt from "bcrypt";
import type { CreateUserDTO } from "../controllers/schemas/user.js";
import { ConflictError, InternalServerError } from "../core/errors.js";
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
