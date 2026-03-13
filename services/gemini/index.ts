import { GoogleGenerativeAI } from "@google/generative-ai";
import { featureFlags, env } from "@/lib/env";
import type { AIResponseDraft } from "@/lib/validators/ai";

interface GenerateParams {
  prompt: string;
  userMessage: string;
  carePlanSummary: string;
  clinicPolicies: string[];
  role: "DOCTOR" | "ADMIN" | "PATIENT";
  mediaSummary?: string;
}

export interface AIProvider {
  generateStructuredResponse(params: GenerateParams): Promise<AIResponseDraft>;
}

class MockGeminiProvider implements AIProvider {
  async generateStructuredResponse(params: GenerateParams): Promise<AIResponseDraft> {
    const lower = params.userMessage.toLowerCase();
    const needsEscalation =
      /dose|dosage|extra inhaler|stronger meds|antibiotic|painkillers|controlled/i.test(lower);
    const emergency = /can't breathe|cannot breathe|chest pain|blue lips|fainted|passed out/i.test(lower);
    const uploadReview = Boolean(params.mediaSummary);

    if (emergency) {
      return {
        message_for_user:
          "Your message includes symptoms that can be urgent. ClinAI Bridge cannot assess emergencies. Please contact emergency services or urgent care immediately and alert your clinic.",
        intent: "escalation",
        risk_level: "critical",
        used_sources: ["doctor_care_plan", "clinic_emergency_policy"],
        requires_doctor_review: true,
        requires_admin_followup: true,
        emergency_advice: true,
        refusal_reason: "Emergency symptoms require human clinical or emergency review.",
        next_actions: ["Call local emergency services immediately", "Notify clinic"]
      };
    }

    if (needsEscalation) {
      return {
        message_for_user:
          "I can’t give medication changes or new dosing advice. I’ve flagged this for doctor review and can help request a clinic callback.",
        intent: "refusal",
        risk_level: "high",
        used_sources: ["doctor_care_plan", "clinic_medication_policy"],
        requires_doctor_review: true,
        requires_admin_followup: true,
        emergency_advice: false,
        refusal_reason: "Medication changes require explicit doctor-authored instruction.",
        next_actions: ["Doctor review", "Admin callback"]
      };
    }

    if (uploadReview) {
      return {
        message_for_user:
          "I reviewed the uploaded media only for a non-diagnostic summary. I can note visible changes for your care team and compare them against the warning signs already in your care plan.",
        intent: "upload_review",
        risk_level: "medium",
        used_sources: ["doctor_care_plan", "clinic_upload_policy"],
        requires_doctor_review: true,
        requires_admin_followup: false,
        emergency_advice: false,
        refusal_reason: null,
        next_actions: ["Share media summary with doctor"]
      };
    }

    return {
      message_for_user:
        "Here’s the clinic-supported summary: continue following your current care plan, monitor the warning signs your doctor listed, and request follow-up if symptoms worsen or you need scheduling help.",
      intent: "care_plan_explanation",
      risk_level: "low",
      used_sources: ["doctor_care_plan", "clinic_policy"],
      requires_doctor_review: false,
      requires_admin_followup: false,
      emergency_advice: false,
      refusal_reason: null,
      next_actions: ["Continue current plan", "Book follow-up if needed"]
    };
  }
}

class GeminiProvider implements AIProvider {
  private client = new GoogleGenerativeAI(env.GEMINI_API_KEY!);

  async generateStructuredResponse(params: GenerateParams): Promise<AIResponseDraft> {
    const model = this.client.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      params.prompt,
      `Role: ${params.role}`,
      `Patient message: ${params.userMessage}`,
      `Care plan summary: ${params.carePlanSummary}`,
      `Clinic policies: ${params.clinicPolicies.join("\n")}`,
      params.mediaSummary ? `Media summary: ${params.mediaSummary}` : "",
      "Return JSON only with fields: message_for_user, intent, risk_level, used_sources, requires_doctor_review, requires_admin_followup, emergency_advice, refusal_reason, next_actions."
    ]);

    const text = result.response.text();
    return JSON.parse(text) as AIResponseDraft;
  }
}

export function getAIProvider(): AIProvider {
  return featureFlags.gemini ? new GeminiProvider() : new MockGeminiProvider();
}
