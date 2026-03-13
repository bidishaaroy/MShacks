import { z } from "zod";

export const aiIntentSchema = z.enum([
  "admin_help",
  "care_plan_explanation",
  "triage",
  "upload_review",
  "escalation",
  "refusal"
]);

export const aiRiskSchema = z.enum(["low", "medium", "high", "critical"]);

export const aiResponseSchema = z.object({
  message_for_user: z.string().min(1),
  intent: aiIntentSchema,
  risk_level: aiRiskSchema,
  used_sources: z.array(z.string()).default([]),
  requires_doctor_review: z.boolean(),
  requires_admin_followup: z.boolean(),
  emergency_advice: z.boolean(),
  refusal_reason: z.string().nullable(),
  next_actions: z.array(z.string()).default([])
});

export type AIResponseDraft = z.infer<typeof aiResponseSchema>;
