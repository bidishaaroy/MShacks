import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";

const intakeSchema = z.object({
  escalationId: z.string()
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = intakeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const repository = getRepository();
  const dashboard = await repository.getDashboardData();
  const escalation = dashboard.escalations.find((item) => item.id === parsed.data.escalationId);

  if (!escalation) {
    return NextResponse.json({ error: "Escalation not found" }, { status: 404 });
  }

  await repository.scheduleEscalation(parsed.data.escalationId);

  const currentUser = await repository.getCurrentUser(session.userId);
  await repository.createAppointment({
    patientId: escalation.patientId,
    scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    reason: `Urgent intake review: ${escalation.reason}`,
    status: "URGENT",
    assignedTo: "Dr. Maya Lin",
    notes: "Created from intake queue",
    scheduledByRole: session.role,
    scheduledByName: currentUser?.name ?? "Clinic admin"
  });

  return NextResponse.json({ ok: true });
}
