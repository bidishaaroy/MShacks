import { NextResponse } from "next/server";
import { buildAssistantFallback } from "@/lib/ai/fallback";
import { getSession } from "@/lib/auth/session";
import { buildAssistantPrompt } from "@/lib/ai/prompt";
import { getRepository } from "@/lib/data/repository";
import { runPolicyEngine } from "@/lib/policy/engine";
import { aiResponseSchema } from "@/lib/validators/ai";
import { sendMessageSchema } from "@/lib/validators/forms";
import { getDeidService } from "@/services/deid";
import { getAIProvider, getMockAIProvider } from "@/services/gemini";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = sendMessageSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const repository = getRepository();
  const dashboard = await repository.getDashboardData();
  const deid = getDeidService();
  const provider = getAIProvider();
  const senderType = session.role === "PATIENT" ? "PATIENT" : session.role === "DOCTOR" ? "DOCTOR" : "ADMIN";

  const userMessage = await repository.appendPatientMessage({
    conversationId: parsed.data.conversationId,
    senderType,
    senderId: session.userId,
    content: parsed.data.message,
    contentType: "TEXT"
  });

  if (session.role !== "PATIENT") {
    await repository.saveAuditEvent({
      actorType: session.role,
      actorId: session.userId,
      action: "STAFF_MESSAGE_ADDED",
      metadataJson: {
        conversationId: parsed.data.conversationId,
        patientId: parsed.data.patientId
      }
    });

    return NextResponse.json({ ok: true, message: userMessage });
  }

  const recentMessages = [
    ...dashboard.messages.slice(-7),
    {
      id: "pending",
      conversationId: parsed.data.conversationId,
      senderType: "PATIENT" as const,
      senderId: session.userId,
      content: parsed.data.message,
      contentType: "TEXT" as const,
      riskLevel: null,
      redactedContent: null,
      createdAt: new Date().toISOString()
    }
  ];

  let draft;
  try {
    draft = aiResponseSchema.parse(
      await provider.generateStructuredResponse({
        prompt: buildAssistantPrompt({
          carePlan: dashboard.carePlan,
          policies: dashboard.policies,
          recentMessages,
          styleNote: dashboard.styleNote
        }),
        userMessage: parsed.data.message,
        carePlanSummary: dashboard.carePlan.treatmentPlan,
        clinicPolicies: dashboard.policies.map((policy) => `${policy.title}: ${policy.body}`),
        role: session.role
      })
    );
  } catch (error) {
    console.error("ClinAI Bridge assistant error", error);
    try {
      draft = aiResponseSchema.parse(
        await getMockAIProvider().generateStructuredResponse({
          prompt: buildAssistantPrompt({
            carePlan: dashboard.carePlan,
            policies: dashboard.policies,
            recentMessages,
            styleNote: dashboard.styleNote
          }),
          userMessage: parsed.data.message,
          carePlanSummary: dashboard.carePlan.treatmentPlan,
          clinicPolicies: dashboard.policies.map((policy) => `${policy.title}: ${policy.body}`),
          role: session.role
        })
      );
    } catch (mockError) {
      console.error("ClinAI Bridge mock assistant error", mockError);
      draft = buildAssistantFallback();
    }
  }
  const policyResult = runPolicyEngine({
    role: session.role,
    message: parsed.data.message,
    carePlan: dashboard.carePlan,
    policies: dashboard.policies,
    draft
  });

  const redactedContent = await deid.deidentify(policyResult.approved.message_for_user, "redact");

  const aiMessage = await repository.appendAIMessage({
    conversationId: parsed.data.conversationId,
    senderType: "AI",
    senderId: null,
    content: policyResult.approved.message_for_user,
    contentType: "TEXT",
    riskLevel: policyResult.approved.risk_level.toUpperCase() as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    redactedContent
  });

  if (policyResult.escalation) {
    await repository.saveEscalation({
      patientId: parsed.data.patientId,
      conversationId: parsed.data.conversationId,
      ...policyResult.escalation
    });
  }

  await repository.saveAuditEvent({
    actorType: "AI",
    actorId: null,
    action: "AI_RESPONSE_RENDERED",
    metadataJson: {
      intent: policyResult.approved.intent,
      requiresDoctorReview: policyResult.approved.requires_doctor_review,
      requiresAdminFollowup: policyResult.approved.requires_admin_followup,
      suggestedFollowUp: policyResult.approved.suggested_follow_up
    }
  });

  return NextResponse.json({ ok: true, aiMessage });
}
