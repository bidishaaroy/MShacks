import { z } from 'zod'

export const AIResponseSchema = z.object({
  message_for_user: z.string(),
  intent: z.enum([
    'admin_help',
    'care_plan_explanation',
    'triage',
    'upload_review',
    'escalation',
    'refusal',
  ]),
  risk_level: z.enum(['low', 'medium', 'high', 'critical']),
  used_sources: z.array(z.string()),
  requires_doctor_review: z.boolean(),
  requires_admin_followup: z.boolean(),
  emergency_advice: z.boolean(),
  refusal_reason: z.string().nullable(),
  next_actions: z.array(z.string()),
})

export type AIResponse = z.infer<typeof AIResponseSchema>
