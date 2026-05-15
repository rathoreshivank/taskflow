import { getUserFromRequest } from "../../../../middleware/auth";
import type { RouteContext } from "../../../../types/route";
import {
  getProjectById,
  getProjectRole,
  isProjectMember,
  updateProject,
  deleteProject,
} from "../../../../services/projectService";
import { z } from "zod";

const updateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Project name must be at least 2 characters")
    .max(100, "Project name is too long")
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, "Description is too long")
    .optional(),
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
  const project = await getProjectById(params.id);
  if (!project)
    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  const isMember = await isProjectMember(user._id.toString(), params.id);
  if (!isMember)
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  const userRole = await getProjectRole(user._id.toString(), params.id);
  return new Response(
    JSON.stringify({
      project: {
        ...project,
        userRole,
        currentUserId: user._id.toString(),
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}

export async function PATCH(
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
  const role = await getProjectRole(user._id.toString(), params.id);
  if (role !== "ADMIN")
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  try {
    const body = await req.json();
    const parsed = updateProjectSchema.parse(body);
    const project = await updateProject(params.id, parsed);
    if (!project) {
      return new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ project }), {
      status: 200,
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

export async function DELETE(
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
  const role = await getProjectRole(user._id.toString(), params.id);
  if (role !== "ADMIN")
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  try {
    const project = await getProjectById(params.id);
    if (!project) {
      return new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await deleteProject(params.id);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
