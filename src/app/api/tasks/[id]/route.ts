import { getUserFromRequest } from "../../../../middleware/auth";
import { getProjectRole } from "../../../../services/projectService";
import type { RouteContext } from "../../../../types/route";
import {
  getTaskById,
  updateTask,
  deleteTask,
} from "../../../../services/taskService";
import mongoose from "mongoose";
import { z } from "zod";

const memberTaskUpdateSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
});

function getTaskProjectId(task: {
  projectId:
    | string
    | mongoose.Types.ObjectId
    | { _id?: mongoose.Types.ObjectId | string | null }
    | null
    | undefined;
}) {
  const projectRef = task.projectId;

  if (!projectRef) return null;
  if (typeof projectRef === "string") return projectRef;
  if (projectRef instanceof mongoose.Types.ObjectId) return projectRef.toString();
  if (typeof projectRef === "object" && "_id" in projectRef) {
    const nestedId = projectRef._id;
    return nestedId ? nestedId.toString() : null;
  }

  return null;
}

export async function GET(req: Request, context: RouteContext<{ id: string }>) {
  const params = await context.params;
  if (!params?.id)
    return new Response(JSON.stringify({ error: "Invalid task id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  const user = await getUserFromRequest(req);
  if (!user)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  const task = await getTaskById(params.id);
  if (!task)
    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  const projectRole = await getProjectRole(
    user._id.toString(),
    getTaskProjectId(task) ?? "",
  );
  if (!projectRole)
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  return new Response(JSON.stringify({ task }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function PATCH(
  req: Request,
  context: RouteContext<{ id: string }>,
) {
  const params = await context.params;
  if (!params?.id)
    return new Response(JSON.stringify({ error: "Invalid task id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  const user = await getUserFromRequest(req);
  if (!user)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  const body = await req.json();
  const task = await getTaskById(params.id);
  if (!task)
    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  const projectRole = await getProjectRole(
    user._id.toString(),
    getTaskProjectId(task) ?? "",
  );
  if (!projectRole)
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  // ADMIN can update any task. MEMBER can only update their own status.
  if (projectRole === "MEMBER") {
    const assignedUserId =
      task.assignedTo &&
      typeof task.assignedTo === "object" &&
      "_id" in task.assignedTo
        ? task.assignedTo._id?.toString()
        : task.assignedTo
        ? String(task.assignedTo)
        : undefined;

    if (assignedUserId !== user._id.toString()) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    const parsed = memberTaskUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Members can only update task status" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    const allowed = { status: parsed.data.status };
    const updated = await updateTask(params.id, allowed);
    return new Response(JSON.stringify({ task: updated }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  const updated = await updateTask(params.id, body);
  return new Response(JSON.stringify({ task: updated }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(
  req: Request,
  context: RouteContext<{ id: string }>,
) {
  const params = await context.params;
  if (!params?.id)
    return new Response(JSON.stringify({ error: "Invalid task id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  const user = await getUserFromRequest(req);
  if (!user)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  const task = await getTaskById(params.id);
  if (!task)
    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  const projectRole = await getProjectRole(
    user._id.toString(),
    getTaskProjectId(task) ?? "",
  );
  if (projectRole !== "ADMIN")
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  await deleteTask(params.id);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
