export type Role = "DOCTOR" | "ADMIN" | "PATIENT";
export type SenderType = "PATIENT" | "DOCTOR" | "ADMIN" | "AI";
export type ContentType = "TEXT" | "IMAGE" | "AUDIO" | "SYSTEM";
export type UploadType = "IMAGE" | "AUDIO" | "DOCUMENT";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type EscalationStatus = "OPEN" | "IN_REVIEW" | "RESOLVED";
export type ConversationStatus = "ACTIVE" | "ESCALATED" | "RESOLVED";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  passwordHash: string;
  role: Role;
}

export interface Clinic {
  id: string;
  name: string;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  specialization: string;
  clinicId: string;
}

export interface AdminProfile {
  id: string;
  userId: string;
  clinicId: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  assignedDoctorId: string | null;
  assignedAdminId: string | null;
  dob: string;
  clinicId: string;
  summary: string;
}

export interface CarePlan {
  id: string;
  patientId: string;
  doctorId: string;
  diagnosisSummary: string;
  treatmentPlan: string;
  riskFactors: string;
  escalationThresholdsJson: {
    redFlags: string[];
    doctorReviewTriggers: string[];
    adminTasks: string[];
  };
  personalizedNotes: string;
  lastUpdatedAt?: string;
}

export interface Conversation {
  id: string;
  patientId: string;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderType: SenderType;
  senderId: string | null;
  content: string;
  contentType: ContentType;
  riskLevel: RiskLevel | null;
  redactedContent: string | null;
  createdAt: string;
}

export interface Upload {
  id: string;
  patientId: string;
  conversationId: string | null;
  type: UploadType;
  blobUrl: string;
  mimeType: string;
  uploadedByRole: Role;
  createdAt: string;
}

export interface Escalation {
  id: string;
  patientId: string;
  conversationId: string;
  riskLevel: RiskLevel;
  reason: string;
  requiresDoctorReview: boolean;
  requiresAdminFollowup: boolean;
  emergencyAdvice: boolean;
  status: EscalationStatus;
  createdAt: string;
  resolvedAt: string | null;
}

export interface AuditEvent {
  id: string;
  actorType: string;
  actorId: string | null;
  action: string;
  metadataJson: Record<string, unknown>;
  createdAt: string;
}

export interface ClinicPolicy {
  id: string;
  clinicId: string;
  title: string;
  body: string;
  category: string;
}

export interface StyleNote {
  id: string;
  doctorId: string;
  tone: string;
  example: string;
}

export interface AdminTask {
  id: string;
  title: string;
  status: "OPEN" | "DONE";
  patientId: string;
  suggestedBy: "AI" | "ADMIN";
  createdAt: string;
}

export interface DemoStore {
  clinic: Clinic;
  users: AppUser[];
  profiles: {
    doctor: DoctorProfile;
    admin: AdminProfile;
    patient: PatientProfile;
  };
  carePlan: CarePlan;
  conversation: Conversation;
  messages: Message[];
  uploads: Upload[];
  escalations: Escalation[];
  auditEvents: AuditEvent[];
  clinicPolicies: ClinicPolicy[];
  styleNotes: StyleNote[];
  adminTasks: AdminTask[];
}
