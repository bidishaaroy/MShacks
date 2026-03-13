import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";
import { uploadSchema } from "@/lib/validators/forms";
import { getBlobService } from "@/services/blob";
import { getAIProvider } from "@/services/gemini";
import { aiResponseSchema } from "@/lib/validators/ai";
import { runPolicyEngine } from "@/lib/policy/engine";
import { buildAssistantPrompt } from "@/lib/ai/prompt";
import { getDeidService } from "@/services/deid";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = uploadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const repository = getRepository();
  const dashboard = await repository.getDashboardData();
  const blob = getBlobService();
  const ai = getAIProvider();
  const deid = getDeidService();

  const buffer = Buffer.from(parsed.data.payload, "base64");
  const folder = parsed.data.type === "IMAGE" ? "images" : parsed.data.type === "AUDIO" ? "audio" : "documents";
  const uploaded = await blob.upload({
    patientId: parsed.data.patientId,
    folder,
    fileName: parsed.data.fileName,
    contentType: parsed.data.mimeType,
    buffer
  });

  await repository.createUpload({
    patientId: parsed.data.patientId,
    conversationId: parsed.data.conversationId,
    type: parsed.data.type,
    blobUrl: uploaded.url,
    mimeType: parsed.data.mimeType,
    uploadedByRole: session.role
  });

  const mediaSummary =
    parsed.data.type === "IMAGE"
      ? "Patient uploaded an image for non-diagnostic visual summary."
      : "Patient uploaded an audio note. Mock transcript: cough worse at night and asking if clinic should call back.";

  await repository.appendPatientMessage({
    conversationId: parsed.data.conversationId,
    senderType: "PATIENT",
    senderId: session.userId,
    content:
      parsed.data.type === "IMAGE"
        ? `Uploaded photo: ${parsed.data.fileName}`
        : `Uploaded voice note: ${parsed.data.fileName}. Transcript attached for assistant review.`,
    contentType: parsed.data.type === "IMAGE" ? "IMAGE" : "AUDIO"
  });

  const prompt = buildAssistantPrompt({
    carePlan: dashboard.carePlan,
    policies: dashboard.policies,
    recentMessages: dashboard.messages.slice(-8),
    styleNote: dashboard.styleNote
  });

  const draft = aiResponseSchema.parse(
    await ai.generateStructuredResponse({
      prompt,
      userMessage: mediaSummary,
      carePlanSummary: dashboard.carePlan.treatmentPlan,
      clinicPolicies: dashboard.policies.map((policy) => `${policy.title}: ${policy.body}`),
      role: session.role,
      mediaSummary
    })
  );

  const policyResult = runPolicyEngine({
    role: session.role,
    message: mediaSummary,
    carePlan: dashboard.carePlan,
    policies: dashboard.policies,
    draft
  });

  const redacted = await deid.deidentify(policyResult.approved.message_for_user, "redact");

  await repository.appendAIMessage({
    conversationId: parsed.data.conversationId,
    senderType: "AI",
    senderId: null,
    content: `${policyResult.approved.message_for_user}\nReference ID: ${randomUUID().slice(0, 8)}`,
    contentType: "TEXT",
    riskLevel: policyResult.approved.risk_level.toUpperCase() as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    redactedContent: redacted
  });

  if (policyResult.escalation) {
    await repository.saveEscalation({
      patientId: parsed.data.patientId,
      conversationId: parsed.data.conversationId,
      ...policyResult.escalation
    });
  }

  return NextResponse.json({ ok: true, uploaded });
}
