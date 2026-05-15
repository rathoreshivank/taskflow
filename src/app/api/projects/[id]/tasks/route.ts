import { z } from "zod";
import { getUserFromRequest } from "../../../../../middleware/auth";
import {
  getProjectRole,
  isProjectMember,
} from "../../../../../services/projectService";
import { createTask, getTaskById, getTasks } from "../../../../../services/taskService";
import type { RouteContext } from "../../../../../types/route";

const createProjectTaskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.coerce.date().optional(),
  assignedTo: z.string().optional(),
});

export async function GET(req: Request, context: RouteContext<{ id: string }>) {
  const params = await context.params;
  if (!params?.id)
    return new Response(JSON.stringify({ error: "Invalid project id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  const user = await getUserFromRequest(req);
  if (!user)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  const projectRole = await getProjectRole(user._id.toString(), params.id);
  if (!projectRole)
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const filter: Record<string, unknown> = { projectId: params.id };
  if (status) filter.status = status;

  const tasks = await getTasks(filter);
  return new Response(JSON.stringify({ tasks }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(
  req: Request,
  context: RouteContext<{ id: string }>,
) {
  const params = await context.params;
  if (!params?.id)
    return new Response(JSON.stringify({ error: "Invalid project id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  const user = await getUserFromRequest(req);
  if (!user)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  const projectRole = await getProjectRole(user._id.toString(), params.id);
  if (!projectRole)
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  if (projectRole !== "ADMIN")
    return new Response(
      JSON.stringify({ error: "Only project admins can create tasks" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      },
    );

  try {
    const body = await req.json();
    const parsed = createProjectTaskSchema.parse(body);
    if (parsed.assignedTo) {
      const isAssigneeMember = await isProjectMember(parsed.assignedTo, params.id);
      if (!isAssigneeMember) {
        return new Response(
          JSON.stringify({ error: "Assignee must be a member of this project" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }

    const createdTask = await createTask({
      ...parsed,
      projectId: params.id,
      createdBy: user._id.toString(),
    });
    const task = await getTaskById(createdTask._id.toString());

    return new Response(JSON.stringify({ task }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bad Request";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
