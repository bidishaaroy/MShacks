import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";

const checklistSchema = z.object({
  itemId: z.string(),
  done: z.boolean()
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = checklistSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const item = await getRepository().updateChecklistItem(parsed.data.itemId, parsed.data.done);
  return NextResponse.json({ ok: true, item });
}
