import { NextResponse } from "next/server";
import { signupSchema } from "../../../../validations/auth";
import { createUser, findUserByEmail } from "../../../../services/userService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signupSchema.parse(body);
    const existing = await findUserByEmail(parsed.email);
    if (existing)
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 },
      );

    const user = await createUser({
      name: parsed.name,
      email: parsed.email,
      password: parsed.password,
    });

    return NextResponse.json(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
