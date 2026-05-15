import connectToDatabase from "../lib/mongodb";
import Task, { ITask, TaskPriority, TaskStatus } from "../models/Task";
import mongoose from "mongoose";

export type CreateTaskInput = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  assignedTo?: string;
  projectId: string;
  createdBy: string;
};

export type UpdateTaskInput = Partial<
  Pick<
    ITask,
    "title" | "description" | "status" | "priority" | "dueDate" | "assignedTo"
  >
>;

export async function createTask(data: CreateTaskInput) {
  await connectToDatabase();
  return Task.create({
    ...data,
    projectId: new mongoose.Types.ObjectId(data.projectId),
    createdBy: new mongoose.Types.ObjectId(data.createdBy),
    assignedTo: data.assignedTo
      ? new mongoose.Types.ObjectId(data.assignedTo)
      : undefined,
  });
}

export async function getTasks(filter: Record<string, unknown> = {}) {
  await connectToDatabase();
  return Task.find(filter)
    .populate("assignedTo", "name email")
    .populate("projectId", "name");
}

export async function getTaskById(id: string) {
  await connectToDatabase();
  return Task.findById(id)
    .populate("assignedTo", "name email")
    .populate("projectId", "name");
}

export async function updateTask(id: string, payload: UpdateTaskInput) {
  await connectToDatabase();
  return Task.findByIdAndUpdate(id, payload, { new: true });
}

export async function deleteTask(id: string) {
  await connectToDatabase();
  return Task.findByIdAndDelete(id);
}
