import type {
	LoginSchemaDto,
	RegisterSchemaDto,
} from "@src/controllers/schemas/auth.js";
import { EXPIRES_IN_SECONDS, JWT_SECRET } from "@src/core/config.js";
import { ConflictError, UnauthorizedError } from "@src/core/errors.js";
import logger from "@src/core/logger.js";
import { isDuplicateError } from "@src/core/utils.js";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { ILogin } from "./models/auth.js";
import User, { type IUser, Roles } from "./models/user.js";

export const register = async (userData: RegisterSchemaDto): Promise<IUser> => {
	try {
		const hash = await bcrypt.hash(userData.password, 10);
		const user = new User({
			email: userData.email,
			password_hash: hash,
			first_name: userData.first_name,
			last_name: userData.last_name,
			roles: [Roles.ROLE_USER],
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

export const login = async (
	loginSchemaDto: LoginSchemaDto,
): Promise<ILogin> => {
	try {
		const user = await User.findOne({ email: loginSchemaDto.email });
		if (!user) {
			throw new UnauthorizedError("Invalid email/password combination");
		}
		const isPasswordValid = await bcrypt.compare(
			loginSchemaDto.password,
			user.password_hash,
		);
		if (!isPasswordValid) {
			throw new UnauthorizedError("Invalid email/password combination");
		}

		const token = jwt.sign({ id: user._id, roles: user.roles }, JWT_SECRET, {
			expiresIn: EXPIRES_IN_SECONDS,
		});
		return { token: token, expires_in: `${EXPIRES_IN_SECONDS} seconds` };
	} catch (error) {
		if (error instanceof UnauthorizedError) {
			logger.debug(error);
			throw error;
		}
		throw error;
	}
};
