import { GoogleGenerativeAI } from "@google/generative-ai";
import { featureFlags, env } from "@/lib/env";
import { aiResponseSchema } from "@/lib/validators/ai";
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
      /dose|dosage|extra inhaler|stronger meds|antibiotic|painkillers|controlled|opioid|narcotic/i.test(lower);
    const emergency = /can't breathe|cannot breathe|chest pain|blue lips|fainted|passed out/i.test(lower);
    const vague = /not sure|feel off|is this okay|what should i do/i.test(lower);
    const carePoint =
      params.carePlanSummary.split(".").find((line) => line.trim().length > 12)?.trim() ??
      "stay with the current care plan and monitor for changes";

    if (emergency) {
      return {
        message_for_user:
          "Your message includes symptoms that can be urgent. ClinAI Bridge cannot assess emergencies. Please contact emergency services or urgent care immediately and alert your clinic.",
        intent: "escalation",
        risk_level: "critical",
        requires_doctor_review: true,
        requires_admin_followup: true,
        emergency_advice: true,
        refusal_reason: "Emergency symptoms require human clinical or emergency review.",
        suggested_follow_up: "Call local emergency services immediately."
      };
    }

    if (needsEscalation) {
      return {
        message_for_user:
          "I can’t give medication changes or new dosing advice. I’ve flagged this for doctor review and can help request a clinic callback.",
        intent: "refusal",
        risk_level: "high",
        requires_doctor_review: true,
        requires_admin_followup: true,
        emergency_advice: false,
        refusal_reason: "Medication changes require explicit doctor-authored instruction.",
        suggested_follow_up: "Request clinic follow-up."
      };
    }

    if (params.mediaSummary) {
      return {
        message_for_user:
          "I reviewed the upload only as a non-diagnostic summary. I can share it with your care team and compare it against the warning signs already listed in your plan.",
        intent: "triage",
        risk_level: "medium",
        requires_doctor_review: true,
        requires_admin_followup: false,
        emergency_advice: false,
        refusal_reason: null,
        suggested_follow_up: "A clinician can review the upload if needed."
      };
    }

    if (/cough flare|cough|night/i.test(lower)) {
      return {
        message_for_user:
          "Tonight, focus on hydration, rest, and whether the cough is becoming more intense or linked with wheezing. If you notice shortness of breath at rest or chest pain, contact urgent care right away.",
        intent: "care_plan_explanation",
        risk_level: "medium",
        requires_doctor_review: false,
        requires_admin_followup: false,
        emergency_advice: false,
        refusal_reason: null,
        suggested_follow_up: "Contact the clinic if the cough keeps worsening."
      };
    }

    if (/fever/i.test(lower)) {
      return {
        message_for_user:
          "Your doctor’s notes say to contact the clinic if the fever returns and stays high, especially if it lasts or comes with breathing changes. Keep monitoring temperature and how you feel overall.",
        intent: "triage",
        risk_level: "medium",
        requires_doctor_review: false,
        requires_admin_followup: true,
        emergency_advice: false,
        refusal_reason: null,
        suggested_follow_up: "Request clinic follow-up if the fever stays elevated."
      };
    }

    if (/chest tightness|tightness|walking/i.test(lower)) {
      return {
        message_for_user:
          "Because your care plan already flags chest tightness, watch for worsening breathing, symptoms at rest, severe chest pain, or bluish lips. If any of those happen, seek urgent care instead of waiting.",
        intent: "triage",
        risk_level: "high",
        requires_doctor_review: true,
        requires_admin_followup: true,
        emergency_advice: false,
        refusal_reason: null,
        suggested_follow_up: "Escalate to the clinic if the tightness is increasing."
      };
    }

    if (vague) {
      return {
        message_for_user: "Can you tell me what changed most today, such as breathing, fever, pain, or cough?",
        intent: "clarification",
        risk_level: "low",
        requires_doctor_review: false,
        requires_admin_followup: false,
        emergency_advice: false,
        refusal_reason: null,
        suggested_follow_up: null
      };
    }

    return {
      message_for_user: `Based on your current plan, ${carePoint.charAt(0).toLowerCase()}${carePoint.slice(
        1
      )}. If symptoms worsen or any red-flag signs appear, contact the clinic promptly.`,
      intent: "care_plan_explanation",
      risk_level: "low",
      requires_doctor_review: false,
      requires_admin_followup: false,
      emergency_advice: false,
      refusal_reason: null,
      suggested_follow_up: "Reach out to the clinic if symptoms worsen."
    };
  }
}

class GeminiProvider implements AIProvider {
  private client = new GoogleGenerativeAI(env.GEMINI_API_KEY!);

  async generateStructuredResponse(params: GenerateParams): Promise<AIResponseDraft> {
    const model = this.client.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: [
                params.prompt,
                `Role: ${params.role}`,
                `Patient message: ${params.userMessage}`,
                `Care plan summary: ${params.carePlanSummary}`,
                `Clinic policies: ${params.clinicPolicies.join("\n")}`,
                params.mediaSummary ? `Media summary: ${params.mediaSummary}` : ""
              ]
                .filter(Boolean)
                .join("\n\n")
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.8
      }
    });

    const text = result.response.text().trim();
    const parsed = extractJson(text);
    return aiResponseSchema.parse(parsed);
  }
}

function extractJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Gemini returned non-JSON output");
    }
    return JSON.parse(match[0]);
  }
}

export function getAIProvider(): AIProvider {
  return featureFlags.gemini ? new GeminiProvider() : new MockGeminiProvider();
}

export function getMockAIProvider(): AIProvider {
  return new MockGeminiProvider();
}
