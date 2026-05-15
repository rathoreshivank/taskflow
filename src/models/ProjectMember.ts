import mongoose, { Document, Model, Schema } from "mongoose";

export type ProjectRole = "ADMIN" | "MEMBER";

// ✅ Ye model hi RBAC ka source of truth hai
// Ek user ek project mein ADMIN ho sakta hai, doosre mein MEMBER
// Unlimited admins per project — koi limit nahi
export interface IProjectMember extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  role: ProjectRole;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectMemberSchema = new Schema<IProjectMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "projectId is required"],
    },
    role: {
      type: String,
      enum: {
        values: ["ADMIN", "MEMBER"],
        message: "Role must be ADMIN or MEMBER",
      },
      default: "MEMBER",
    },
  },
  { timestamps: true },
);

// ✅ Ek user ek project mein ek hi baar ho sakta hai — unique compound index
ProjectMemberSchema.index({ userId: 1, projectId: 1 }, { unique: true });

// ✅ Fast lookup: "is this user a member of this project?"
ProjectMemberSchema.index({ projectId: 1, userId: 1 });

// ✅ Fast lookup: "all projects for this user"
ProjectMemberSchema.index({ userId: 1 });

const ProjectMember: Model<IProjectMember> =
  (mongoose.models.ProjectMember as Model<IProjectMember>) ||
  mongoose.model<IProjectMember>("ProjectMember", ProjectMemberSchema);

export default ProjectMember;
