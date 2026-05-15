import { getUserFromRequest } from "../../../../../../middleware/auth";
import type { RouteContext } from "../../../../../../types/route";
import ProjectMember from "../../../../../../models/ProjectMember";
import { getProjectRole } from "../../../../../../services/projectService";
import { z } from "zod";

const updateRoleSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"]),
});

export async function PATCH(
  req: Request,
  context: RouteContext<{ id: string; memberId: string }>,
) {
  const params = await context.params;
  if (!params?.id)
    return new Response(JSON.stringify({ error: "Invalid project id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  if (!params?.memberId)
    return new Response(JSON.stringify({ error: "Invalid member id" }), {
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
  if (projectRole !== "ADMIN") {
    return new Response(
      JSON.stringify({ error: "Only admins can change roles" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const body = await req.json();
  const parsed = updateRoleSchema.parse(body);
  await ProjectMember.findByIdAndUpdate(params.memberId, { role: parsed.role });
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(
  req: Request,
  context: RouteContext<{ id: string; memberId: string }>,
) {
  const params = await context.params;
  if (!params?.id)
    return new Response(JSON.stringify({ error: "Invalid project id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  if (!params?.memberId)
    return new Response(JSON.stringify({ error: "Invalid member id" }), {
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
  if (projectRole !== "ADMIN")
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  await ProjectMember.findByIdAndDelete(params.memberId);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
