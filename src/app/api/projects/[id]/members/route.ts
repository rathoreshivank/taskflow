import { getUserFromRequest } from "../../../../../middleware/auth";
import { getProjectRole } from "../../../../../services/projectService";
import type { RouteContext } from "../../../../../types/route";
import ProjectMember from "../../../../../models/ProjectMember";
import { connectToDatabase } from "../../../../../lib/mongodb";
import { findUserByEmail } from "../../../../../services/userService";
import mongoose from "mongoose";
import { z } from "zod";

const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER"]).optional(),
});

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
  if (projectRole !== "ADMIN")
    return new Response(
      JSON.stringify({
        error: "Forbidden — only project admins can add members",
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      },
    );
  try {
    const body = await req.json();
    const parsed = addMemberSchema.parse(body);
    const normalizedEmail = parsed.email.trim().toLowerCase();
    await connectToDatabase();
    const memberUser = await findUserByEmail(normalizedEmail);
    if (!memberUser)
      return new Response(
        JSON.stringify({ error: "No user found with this email address" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );

    const existingMember = await ProjectMember.findOne({
      userId: memberUser._id,
      projectId: new mongoose.Types.ObjectId(params.id),
    });

    if (existingMember)
      return new Response(
        JSON.stringify({ error: "This user is already a member of the project" }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        },
      );

    const member = await ProjectMember.create({
      userId: new mongoose.Types.ObjectId(memberUser._id),
      projectId: new mongoose.Types.ObjectId(params.id),
      role: parsed.role || "MEMBER",
    });

    const populatedMember = await ProjectMember.findById(member._id).populate(
      "userId",
      "name email avatar",
    );

    return new Response(JSON.stringify({ member: populatedMember }), {
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
