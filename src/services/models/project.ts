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
	end_date: Date;
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
		created_by: { type: mongoose.Types.ObjectId, required: true },
		members: { type: [mongoose.Types.ObjectId], required: true },
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
