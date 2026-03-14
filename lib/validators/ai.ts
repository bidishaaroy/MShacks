import { z } from "zod";

export const aiIntentSchema = z.enum([
  "admin_help",
  "care_plan_explanation",
  "triage",
  "escalation",
  "refusal",
  "clarification"
]);

export const aiRiskSchema = z.enum(["low", "medium", "high", "critical"]);

export const aiResponseSchema = z.object({
  message_for_user: z.string().min(1),
  intent: aiIntentSchema,
  risk_level: aiRiskSchema,
  requires_doctor_review: z.boolean(),
  requires_admin_followup: z.boolean(),
  emergency_advice: z.boolean(),
  refusal_reason: z.string().nullable(),
  suggested_follow_up: z.string().nullable()
});

export type AIResponseDraft = z.infer<typeof aiResponseSchema>;
