import mongoose, { Document, Model, Schema } from "mongoose";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  projectId: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId | null;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [200, "Title too long"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2000, "Description too long"],
    },
    status: {
      type: String,
      enum: {
        values: ["TODO", "IN_PROGRESS", "DONE"],
        message: "Status must be TODO, IN_PROGRESS, or DONE",
      },
      default: "TODO",
    },
    priority: {
      type: String,
      enum: {
        values: ["LOW", "MEDIUM", "HIGH"],
        message: "Priority must be LOW, MEDIUM, or HIGH",
      },
      default: "MEDIUM",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Task must belong to a project"],
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task must have a creator"],
    },
  },
  { timestamps: true },
);

// ✅ Dashboard query ke liye: "my overdue tasks"
TaskSchema.index({ assignedTo: 1, status: 1, dueDate: 1 });

// ✅ Project detail page ke liye: "all tasks in this project"
TaskSchema.index({ projectId: 1, status: 1 });

// ✅ Dashboard stat: tasks created by me
TaskSchema.index({ createdBy: 1 });

const Task: Model<ITask> =
  (mongoose.models.Task as Model<ITask>) ||
  mongoose.model<ITask>("Task", TaskSchema);

export default Task;
