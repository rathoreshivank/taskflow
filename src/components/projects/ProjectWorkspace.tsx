"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SectionHeader from "../shared/SectionHeader";

type ProjectMember = {
  memberId: string;
  role: "ADMIN" | "MEMBER";
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
};

type ProjectTask = {
  _id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string | null;
  assignedTo?: {
    _id?: string;
    name?: string;
    email?: string;
  } | null;
};

type ProjectWorkspaceProps = {
  project: {
    _id: string;
    name: string;
    description?: string;
    userRole?: "ADMIN" | "MEMBER" | null;
    currentUserId: string;
    members: ProjectMember[];
  };
  tasks: ProjectTask[];
};

function formatDate(value?: string | null) {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No due date";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export default function ProjectWorkspace({
  project,
  tasks,
}: ProjectWorkspaceProps) {
  const router = useRouter();
  const isAdmin = project.userRole === "ADMIN";
  const [projectName, setProjectName] = useState(project.name);
  const [projectDescription, setProjectDescription] = useState(
    project.description ?? "",
  );
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectDeleteLoading, setProjectDeleteLoading] = useState(false);
  const [projectError, setProjectError] = useState("");
  const [projectSuccess, setProjectSuccess] = useState("");

  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [memberError, setMemberError] = useState("");
  const [memberLoading, setMemberLoading] = useState(false);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState<"LOW" | "MEDIUM" | "HIGH">(
    "MEDIUM",
  );
  const [taskStatus, setTaskStatus] = useState<"TODO" | "IN_PROGRESS" | "DONE">(
    "TODO",
  );
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskAssignedTo, setTaskAssignedTo] = useState("");
  const [taskError, setTaskError] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);
  const [statusDrafts, setStatusDrafts] = useState<Record<string, ProjectTask["status"]>>(
    () =>
      tasks.reduce<Record<string, ProjectTask["status"]>>((accumulator, task) => {
        accumulator[task._id] = task.status;
        return accumulator;
      }, {}),
  );
  const [updatingTaskId, setUpdatingTaskId] = useState("");
  const [updateError, setUpdateError] = useState("");

  async function handleAddMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMemberError("");

    if (!isAdmin) {
      setMemberError("Only project admins can add members.");
      return;
    }

    const normalizedEmail = memberEmail.trim().toLowerCase();
    if (!normalizedEmail) {
      setMemberError("Member email is required.");
      return;
    }

    const isExistingMember = project.members.some(
      (member) => member.user.email.trim().toLowerCase() === normalizedEmail,
    );

    if (isExistingMember) {
      setMemberError("This user is already a member of the project.");
      return;
    }

    setMemberLoading(true);

    try {
      const response = await fetch(`/api/projects/${project._id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          role: memberRole,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Failed to add member");
      }

      setMemberEmail("");
      setMemberRole("MEMBER");
      router.refresh();
    } catch (error) {
      setMemberError(
        error instanceof Error ? error.message : "Failed to add member",
      );
    } finally {
      setMemberLoading(false);
    }
  }

  async function handleCreateTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTaskError("");

    if (!isAdmin) {
      setTaskError("Only project admins can create tasks.");
      return;
    }

    setTaskLoading(true);

    try {
      const payload = {
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        priority: taskPriority,
        status: taskStatus,
        dueDate: taskDueDate || undefined,
        assignedTo: taskAssignedTo || undefined,
      };

      const response = await fetch(`/api/projects/${project._id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create task");
      }

      setTaskTitle("");
      setTaskDescription("");
      setTaskPriority("MEDIUM");
      setTaskStatus("TODO");
      setTaskDueDate("");
      setTaskAssignedTo("");
      router.refresh();
    } catch (error) {
      setTaskError(
        error instanceof Error ? error.message : "Failed to create task",
      );
    } finally {
      setTaskLoading(false);
    }
  }

  async function handleTaskStatusUpdate(taskId: string) {
    setUpdateError("");
    setUpdatingTaskId(taskId);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusDrafts[taskId],
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Failed to update task");
      }

      router.refresh();
    } catch (error) {
      setUpdateError(
        error instanceof Error ? error.message : "Failed to update task",
      );
    } finally {
      setUpdatingTaskId("");
    }
  }

  async function handleProjectUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProjectError("");
    setProjectSuccess("");

    if (!isAdmin) {
      setProjectError("Only project admins can update project details.");
      return;
    }

    const trimmedName = projectName.trim();
    const trimmedDescription = projectDescription.trim();

    if (trimmedName.length < 2) {
      setProjectError("Project name must be at least 2 characters.");
      return;
    }

    setProjectLoading(true);

    try {
      const response = await fetch(`/api/projects/${project._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          description: trimmedDescription,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Failed to update project");
      }

      setProjectSuccess("Project updated.");
      router.refresh();
    } catch (error) {
      setProjectError(
        error instanceof Error ? error.message : "Failed to update project",
      );
    } finally {
      setProjectLoading(false);
    }
  }

  async function handleProjectDelete() {
    setProjectError("");
    setProjectSuccess("");

    if (!isAdmin) {
      setProjectError("Only project admins can delete projects.");
      return;
    }

    const confirmed = window.confirm(
      `Delete "${project.name}"? This will permanently remove the project and all linked tasks.`,
    );
    if (!confirmed) {
      return;
    }

    setProjectDeleteLoading(true);

    try {
      const response = await fetch(`/api/projects/${project._id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete project");
      }

      router.push("/projects");
      router.refresh();
    } catch (error) {
      setProjectError(
        error instanceof Error ? error.message : "Failed to delete project",
      );
    } finally {
      setProjectDeleteLoading(false);
    }
  }

  const myAssignedTasks = tasks.filter(
    (task) => task.assignedTo?._id === project.currentUserId,
  );

  return (
    <>
      {isAdmin ? (
        <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm">
          <SectionHeader
            title="Project"
            subtitle="Update project details or delete the project with all linked tasks"
            actionLabel="Admin"
          />
          <form onSubmit={handleProjectUpdate} className="mt-6 space-y-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
              <label className="block text-sm font-medium text-zinc-700">
                Project name
                <input
                  type="text"
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-orange-300"
                  disabled={projectLoading || projectDeleteLoading}
                  required
                />
              </label>
              <label className="block text-sm font-medium text-zinc-700">
                Description
                <textarea
                  value={projectDescription}
                  onChange={(event) => setProjectDescription(event.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-orange-300"
                  disabled={projectLoading || projectDeleteLoading}
                />
              </label>
            </div>
            {projectError ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {projectError}
              </p>
            ) : null}
            {projectSuccess ? (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {projectSuccess}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={projectLoading || projectDeleteLoading}
                className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {projectLoading ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={handleProjectDelete}
                disabled={projectLoading || projectDeleteLoading}
                className="rounded-full border border-red-200 bg-red-50 px-5 py-2 text-sm font-semibold text-red-700 disabled:opacity-60"
              >
                {projectDeleteLoading ? "Deleting..." : "Delete project"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm">
          <SectionHeader
            title="Team"
            subtitle={`${project.members.length} member${project.members.length === 1 ? "" : "s"}`}
            actionLabel={isAdmin ? "Admin" : "Read only"}
          />
          <div className="mt-6 space-y-3">
            {project.members.map((member) => (
              <div
                key={member.memberId}
                className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {member.user.name}
                  </p>
                  <p className="text-xs text-zinc-500">{member.user.email}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    member.role === "ADMIN"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-zinc-200 text-zinc-700"
                  }`}
                >
                  {member.role}
                </span>
              </div>
            ))}
          </div>

          {isAdmin ? (
            <form onSubmit={handleAddMember} className="mt-6 space-y-3">
              <div className="grid gap-3 md:grid-cols-[1fr_140px]">
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(event) => setMemberEmail(event.target.value)}
                  placeholder="member@email.com"
                  className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-orange-300"
                  disabled={memberLoading}
                  required
                />
                <select
                  value={memberRole}
                  onChange={(event) =>
                    setMemberRole(event.target.value as "ADMIN" | "MEMBER")
                  }
                  className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-orange-300"
                  disabled={memberLoading}
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              {memberError ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {memberError}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={memberLoading}
                className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {memberLoading ? "Adding member..." : "Add member"}
              </button>
            </form>
          ) : null}
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm">
          {isAdmin ? (
            <>
              <SectionHeader
                title="Create Task"
                subtitle="Only project admins can create and assign work"
                actionLabel="Admin"
              />
              <form onSubmit={handleCreateTask} className="mt-6 space-y-3">
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(event) => setTaskTitle(event.target.value)}
                  placeholder="Task title"
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-orange-300"
                  disabled={taskLoading}
                  required
                />
                <textarea
                  value={taskDescription}
                  onChange={(event) => setTaskDescription(event.target.value)}
                  placeholder="Task description"
                  rows={4}
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-orange-300"
                  disabled={taskLoading}
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <select
                    value={taskPriority}
                    onChange={(event) =>
                      setTaskPriority(
                        event.target.value as "LOW" | "MEDIUM" | "HIGH",
                      )
                    }
                    className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-orange-300"
                    disabled={taskLoading}
                  >
                    <option value="LOW">Low priority</option>
                    <option value="MEDIUM">Medium priority</option>
                    <option value="HIGH">High priority</option>
                  </select>
                  <select
                    value={taskStatus}
                    onChange={(event) =>
                      setTaskStatus(
                        event.target.value as "TODO" | "IN_PROGRESS" | "DONE",
                      )
                    }
                    className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-orange-300"
                    disabled={taskLoading}
                  >
                    <option value="TODO">Todo</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(event) => setTaskDueDate(event.target.value)}
                    className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-orange-300"
                    disabled={taskLoading}
                  />
                  <select
                    value={taskAssignedTo}
                    onChange={(event) => setTaskAssignedTo(event.target.value)}
                    className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-orange-300"
                    disabled={taskLoading}
                  >
                    <option value="">Unassigned</option>
                    {project.members.map((member) => (
                      <option key={member.memberId} value={member.user._id}>
                        {member.user.name} ({member.role})
                      </option>
                    ))}
                  </select>
                </div>
                {taskError ? (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {taskError}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={taskLoading}
                  className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {taskLoading ? "Creating task..." : "Create task"}
                </button>
              </form>
            </>
          ) : (
            <>
              <SectionHeader
                title="My Assigned Tasks"
                subtitle="Members can update only their assigned tasks"
                actionLabel="Member"
              />
              {updateError ? (
                <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {updateError}
                </p>
              ) : null}
              {myAssignedTasks.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-zinc-200 bg-white/70 p-6 text-center text-sm text-zinc-500">
                  No tasks are assigned to you in this project.
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {myAssignedTasks.map((task) => (
                    <div
                      key={task._id}
                      className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4"
                    >
                      <p className="text-sm font-semibold text-zinc-900">
                        {task.title}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {task.description || "No description added."}
                      </p>
                      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                        <select
                          value={statusDrafts[task._id] ?? task.status}
                          onChange={(event) =>
                            setStatusDrafts((current) => ({
                              ...current,
                              [task._id]: event.target.value as ProjectTask["status"],
                            }))
                          }
                          className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-orange-300"
                          disabled={updatingTaskId === task._id}
                        >
                          <option value="TODO">Todo</option>
                          <option value="IN_PROGRESS">In progress</option>
                          <option value="DONE">Done</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleTaskStatusUpdate(task._id)}
                          disabled={updatingTaskId === task._id}
                          className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          {updatingTaskId === task._id
                            ? "Updating..."
                            : "Update status"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm">
        <SectionHeader title="Tasks" subtitle="Project backlog" actionLabel="Open" />
        {tasks.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-zinc-200 bg-white/70 p-6 text-center text-sm text-zinc-500">
            No tasks linked to this project yet.
          </div>
        ) : (
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {tasks.map((task) => (
              <article
                key={task._id}
                className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-zinc-900">
                    {task.title}
                  </p>
                  <span className="rounded-full bg-zinc-200 px-2 py-1 text-[11px] font-semibold text-zinc-700">
                    {task.status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  {task.description || "No description added."}
                </p>
                <div className="mt-4 space-y-1 text-xs text-zinc-500">
                  <p>
                    Owner: {task.assignedTo?.name ? task.assignedTo.name : "Unassigned"}
                  </p>
                  <p>Priority: {task.priority}</p>
                  <p>Due: {formatDate(task.dueDate)}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
