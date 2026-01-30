import mongoose from "mongoose";

export enum State {
	OPEN = "OPEN",
	IN_PROGRESS = "IN_PROGRESS",
	CLOSED = "CLOSED",
}

export enum Priority {
	LOW = "LOW",
	MEDIUM = "MEDIUM",
	HIGH = "HIGH",
}

export interface ITask extends mongoose.Document {
	title: string;
	description: string;
	due_date?: Date | undefined;
	priority: Priority;
	state: State;
	project: mongoose.Types.ObjectId;
	assignee?: mongoose.Types.ObjectId;
	tags: mongoose.Types.Array<mongoose.Types.ObjectId>;
}

const taskSchema = new mongoose.Schema<ITask>(
	{
		title: { type: String, required: true },
		description: { type: String, required: true },
		due_date: { type: Date },
		priority: { type: String, enum: Priority, required: true },
		state: { type: String, enum: State, required: true },
		project: { type: mongoose.Types.ObjectId, ref: "Project", required: true },
		assignee: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: false,
			validate: {
				validator: async (assignee: mongoose.Types.ObjectId) => {
					const User = mongoose.model("User");
					const count = await User.countDocuments({ _id: assignee });
					return count === 1;
				},
				message: "Assignee does not exist",
			},
		},
		tags: {
			type: [mongoose.Types.ObjectId],
			ref: "Tag",
			required: false,
			default: [],
			validate: {
				validator: async (tags: mongoose.Types.ObjectId[]) => {
					const Tag = mongoose.model("Tag");
					const count = await Tag.countDocuments({ _id: { $in: tags } });
					return count === tags.length;
				},
				message: "One or more tags do not exist",
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

export default mongoose.model<ITask>("Task", taskSchema);

export const isAssigneeDoesNotExistError = (error: Error) => {
	return (
		error instanceof mongoose.Error.ValidationError && error.errors.assignee
	);
};

export const isTagDoesNotExistError = (error: Error) => {
	return error instanceof mongoose.Error.ValidationError && error.errors.tags;
};
