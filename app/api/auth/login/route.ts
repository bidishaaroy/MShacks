import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth/auth";
import { setSession } from "@/lib/auth/session";
import { getDashboardPath } from "@/lib/rbac";
import { loginSchema } from "@/lib/validators/forms";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const user = await authenticateUser(parsed.data.email, parsed.data.password);

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await setSession({ userId: user.id, role: user.role, email: user.email });
  return NextResponse.json({ ok: true, redirectTo: getDashboardPath(user.role) });
}
