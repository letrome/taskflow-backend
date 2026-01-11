import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

export enum Roles {
	ROLE_USER = "ROLE_USER",
	ROLE_MANAGER = "ROLE_MANAGER",
}

export interface IUser extends mongoose.Document {
	email: string;
	password_hash: string;
	first_name: string;
	last_name: string;
	roles: Roles[];
}

const userSchema = new mongoose.Schema<IUser>(
	{
		email: { type: String, required: true, unique: true },
		password_hash: { type: String, required: true },
		first_name: { type: String, required: true },
		last_name: { type: String, required: true },
		roles: {
			type: [String],
			enum: Object.values(Roles),
			default: [Roles.ROLE_USER],
		},
	},
	{
		toJSON: {
			transform: (_doc, ret: Record<string, unknown>) => {
				ret.id = ret._id;
				delete ret._id;
				delete ret.__v;
				delete ret.password_hash;
			},
		},
	},
);

userSchema.plugin(uniqueValidator);

export default mongoose.model<IUser>("User", userSchema);
