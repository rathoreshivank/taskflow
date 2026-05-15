import mongoose, { Document, Model, Schema } from "mongoose";

// ✅ Project model simple rahega — members alag ProjectMember collection mein hain
// Isse N+1 query problem nahi hogi aur members easily query ho sakenge
export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      minlength: [2, "Project name must be at least 2 characters"],
      maxlength: [100, "Project name too long"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Description too long"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Project must have a creator"],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  },
);

// ✅ Index for faster queries
ProjectSchema.index({ createdBy: 1, createdAt: -1 });

const Project: Model<IProject> =
  (mongoose.models.Project as Model<IProject>) ||
  mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
