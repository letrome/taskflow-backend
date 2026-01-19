import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

export interface ITag extends mongoose.Document {
	name: string;
	project: mongoose.Types.ObjectId;
}

const tagSchema = new mongoose.Schema<ITag>(
	{
		name: { type: String, required: true },
		project: { type: mongoose.Types.ObjectId, ref: "Project", required: true },
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

// Ensure that the same tag name cannot be used more than once in the same project
tagSchema.index({ name: 1, project: 1 }, { unique: true });
tagSchema.plugin(uniqueValidator);

export default mongoose.model<ITag>("Tag", tagSchema);
