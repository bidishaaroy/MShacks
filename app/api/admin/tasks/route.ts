import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";

const adminTaskSchema = z.object({
  taskId: z.string(),
  status: z.enum(["OPEN", "DONE"])
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = adminTaskSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const task = await getRepository().updateAdminTask(parsed.data.taskId, parsed.data.status);
  return NextResponse.json({ ok: true, task });
}
