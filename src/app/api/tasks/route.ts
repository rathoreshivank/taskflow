import { getUserFromRequest } from "../../../middleware/auth";
import { getProjectsForUser } from "../../../services/projectService";
import { getTasks } from "../../../services/taskService";

function toProjectName(project: unknown) {
  if (!project || typeof project !== "object") return project;

  const value = project as Record<string, unknown>;
  return {
    ...value,
    name:
      typeof value.name === "string"
        ? value.name
        : typeof value.title === "string"
          ? value.title
          : undefined,
  };
}

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await getProjectsForUser(user._id.toString());
    const projectIds = projects.map((project) => project._id.toString());

    if (projectIds.length === 0) {
      return Response.json({ tasks: [] });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const filter: Record<string, unknown> = {
      projectId: { $in: projectIds },
    };

    if (status) {
      filter.status = status;
    }

    const tasks = await getTasks(filter);
    const normalizedTasks = tasks.map((task) => {
      const value =
        typeof task.toJSON === "function"
          ? (task.toJSON() as Record<string, unknown>)
          : (task as unknown as Record<string, unknown>);

      return {
        ...value,
        projectId: toProjectName(value.projectId),
      };
    });

    return Response.json({ tasks: normalizedTasks });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
