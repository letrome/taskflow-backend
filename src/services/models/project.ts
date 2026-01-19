import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

export enum Status {
	ACTIVE = "ACTIVE",
	ARCHIVED = "ARCHIVED",
}

export interface IProject extends mongoose.Document {
	title: string;
	description: string;
	start_date: Date;
	end_date?: Date | undefined;
	status: Status;
	created_by: mongoose.Types.ObjectId;
	members: mongoose.Types.ObjectId[];
}

const projectSchema = new mongoose.Schema<IProject>(
	{
		title: { type: String, required: true },
		description: { type: String, required: true },
		start_date: { type: Date, required: true },
		end_date: { type: Date, required: false },
		status: {
			type: String,
			enum: Object.values(Status),
			default: Status.ACTIVE,
		},
		created_by: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: true,
			validate: {
				validator: async (created_by: mongoose.Types.ObjectId) => {
					const User = mongoose.model("User");
					const count = await User.countDocuments({ _id: created_by });
					return count === 1;
				},
				message: "User does not exist",
			},
		},
		members: {
			type: [mongoose.Types.ObjectId],
			ref: "User",
			required: true,
			validate: {
				validator: async (members: mongoose.Types.ObjectId[]) => {
					const User = mongoose.model("User");
					const count = await User.countDocuments({ _id: { $in: members } });
					return count === members.length;
				},
				message: "One or more members do not exist",
			},
		},
	},
	{
		toJSON: {
			transform: (_doc, ret: Record<string, unknown>) => {
				ret.id = ret._id;
				delete ret._id;
				delete ret.__v;
			},
		},
	},
);

projectSchema.plugin(uniqueValidator);

export default mongoose.model<IProject>("Project", projectSchema);

export const isMemberDoesNotExistError = (error: Error) => {
	return (
		error instanceof mongoose.Error.ValidationError && error.errors.members
	);
};

export const isCreatorDoesNotExistError = (error: Error) => {
	return (
		error instanceof mongoose.Error.ValidationError && error.errors.created_by
	);
};
