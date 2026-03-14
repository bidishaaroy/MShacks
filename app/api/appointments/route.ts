import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";
import { appointmentSchema } from "@/lib/validators/forms";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = appointmentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const repository = getRepository();
  const currentUser = await repository.getCurrentUser(session.userId);
  const appointment = await repository.createAppointment({
    patientId: parsed.data.patientId,
    scheduledFor: parsed.data.scheduledFor,
    reason: parsed.data.reason,
    status: parsed.data.status,
    assignedTo: parsed.data.assignedTo,
    notes: parsed.data.notes,
    scheduledByRole: session.role,
    scheduledByName: currentUser?.name ?? "Clinic user"
  });

  await repository.saveAuditEvent({
    actorType: session.role,
    actorId: session.userId,
    action: "APPOINTMENT_SCHEDULED",
    metadataJson: {
      patientId: parsed.data.patientId,
      scheduledFor: parsed.data.scheduledFor,
      reason: parsed.data.reason
    }
  });

  return NextResponse.json({ ok: true, appointment });
}
