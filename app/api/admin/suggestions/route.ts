import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";

const suggestionSchema = z.object({
  suggestionId: z.string()
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = suggestionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const repository = getRepository();
  const dashboard = await repository.getDashboardData();
  const suggestion = await repository.selectAdminSuggestion(parsed.data.suggestionId);

  if (suggestion) {
    await repository.createAdminTask({
      title: suggestion.title,
      status: "OPEN",
      patientId: dashboard.patient.id,
      suggestedBy: "AI"
    });
  }

  return NextResponse.json({ ok: true, suggestion });
}
