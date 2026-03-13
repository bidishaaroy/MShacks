import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const sendMessageSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string(),
  patientId: z.string(),
  role: z.enum(["DOCTOR", "ADMIN", "PATIENT"]),
  attachmentType: z.enum(["TEXT", "IMAGE", "AUDIO"]).default("TEXT")
});

export const carePlanSchema = z.object({
  patientId: z.string(),
  diagnosisSummary: z.string().min(10),
  treatmentPlan: z.string().min(10),
  riskFactors: z.string().min(10),
  personalizedNotes: z.string().min(10),
  escalationThresholdsJson: z.object({
    redFlags: z.array(z.string()),
    doctorReviewTriggers: z.array(z.string()),
    adminTasks: z.array(z.string())
  })
});

export const uploadSchema = z.object({
  patientId: z.string(),
  conversationId: z.string(),
  type: z.enum(["IMAGE", "AUDIO", "DOCUMENT"]),
  mimeType: z.string(),
  fileName: z.string(),
  payload: z.string().min(1)
});
