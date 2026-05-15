import { z } from "zod";
import { getUserFromRequest } from "../../../middleware/auth";
import {
  createProject,
  getProjectsForUser,
} from "../../../services/projectService";

const createProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Project name must be at least 2 characters")
      .optional(),
    title: z
      .string()
      .trim()
      .min(2, "Project name must be at least 2 characters")
      .optional(),
    description: z.string().optional(),
  })
  .transform((data) => ({
    name: data.name ?? data.title ?? "",
    description: data.description,
  }))
  .refine((data) => data.name.length >= 2, {
    message: "Project name must be at least 2 characters",
    path: ["name"],
  });

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const projects = await getProjectsForUser(user._id.toString());
    return new Response(JSON.stringify({ projects }), {
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

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const parsed = createProjectSchema.parse(body);

    const project = await createProject({
      name: parsed.name,
      description: parsed.description,
      createdBy: user._id.toString(),
    });

    return new Response(JSON.stringify({ project }), {
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
