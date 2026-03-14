import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";

const createEscalationSchema = z.object({
  patientId: z.string(),
  conversationId: z.string(),
  reason: z.string().min(3)
});

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "DOCTOR" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getRepository().getDashboardData();
  return NextResponse.json({ escalations: data.escalations });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = createEscalationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const repository = getRepository();
  const existing = await repository.findRecentEscalation(
    parsed.data.patientId,
    parsed.data.conversationId,
    10 * 60 * 1000
  );

  if (existing) {
    return NextResponse.json(
      { ok: false, duplicate: true, message: "This request has already been escalated recently." },
      { status: 200 }
    );
  }

  const escalation = await repository.saveEscalation({
    patientId: parsed.data.patientId,
    conversationId: parsed.data.conversationId,
    riskLevel: "MEDIUM",
    reason: parsed.data.reason,
    requiresDoctorReview: true,
    requiresAdminFollowup: true,
    emergencyAdvice: false
  });

  const systemMessage =
    "Your request has been escalated to the clinic. A doctor or clinic staff member will review it, and an email follow-up will be sent regarding appointment or next-step guidance.";

  await repository.appendAIMessage({
    conversationId: parsed.data.conversationId,
    senderType: "AI",
    senderId: null,
    content: systemMessage,
    contentType: "SYSTEM",
    riskLevel: "MEDIUM",
    redactedContent: systemMessage
  });

  await repository.saveAuditEvent({
    actorType: session.role,
    actorId: session.userId,
    action: "PATIENT_ESCALATION_REQUESTED",
    metadataJson: {
      patientId: parsed.data.patientId,
      conversationId: parsed.data.conversationId,
      reason: parsed.data.reason
    }
  });

  return NextResponse.json({ ok: true, escalation, message: systemMessage });
}
