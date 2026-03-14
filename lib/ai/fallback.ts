import type { AIResponseDraft } from "@/lib/validators/ai";

export const assistantUnavailableMessage =
  "I’m having trouble reaching the clinic assistant right now. Please try again shortly or request follow-up from the clinic.";

export function buildAssistantFallback(): AIResponseDraft {
  return {
    message_for_user: assistantUnavailableMessage,
    intent: "escalation",
    risk_level: "medium",
    requires_doctor_review: false,
    requires_admin_followup: true,
    emergency_advice: false,
    refusal_reason: "Assistant provider unavailable.",
    suggested_follow_up: "Request clinic follow-up."
  };
}
