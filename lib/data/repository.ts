import { randomUUID } from "crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { readDemoStore, writeDemoStore } from "@/lib/db/demo-store";
import type {
  AdminTask,
  AppUser,
  AuditEvent,
  CarePlan,
  ClinicPolicy,
  DemoStore,
  Escalation,
  Message,
  PatientProfile,
  Role,
  Upload
} from "@/lib/types";

export interface DashboardData {
  clinic: DemoStore["clinic"];
  users: DemoStore["users"];
  patient: PatientProfile;
  doctor: DemoStore["profiles"]["doctor"];
  admin: DemoStore["profiles"]["admin"];
  carePlan: CarePlan;
  conversation: DemoStore["conversation"];
  messages: Message[];
  uploads: Upload[];
  escalations: Escalation[];
  policies: ClinicPolicy[];
  styleNote: DemoStore["styleNotes"][number] | undefined;
  adminTasks: AdminTask[];
}

function mapToDashboard(store: DemoStore): DashboardData {
  return {
    clinic: store.clinic,
    users: store.users,
    patient: store.profiles.patient,
    doctor: store.profiles.doctor,
    admin: store.profiles.admin,
    carePlan: store.carePlan,
    conversation: store.conversation,
    messages: store.messages.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    uploads: store.uploads.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    escalations: store.escalations.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    policies: store.clinicPolicies,
    styleNote: store.styleNotes[0],
    adminTasks: store.adminTasks.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  };
}

async function getDemoDashboardData() {
  const store = await readDemoStore();
  return mapToDashboard(store);
}

async function updateDemoStore(mutator: (store: DemoStore) => DemoStore | Promise<DemoStore>) {
  const current = await readDemoStore();
  const next = await mutator(current);
  await writeDemoStore(next);
  return next;
}

export function getRepository() {
  if (!prisma) {
    return {
      async findUserByEmail(email: string) {
        const store = await readDemoStore();
        return store.users.find((user) => user.email === email) ?? null;
      },
      async getDashboardData() {
        return getDemoDashboardData();
      },
      async appendPatientMessage(message: Omit<Message, "id" | "createdAt" | "redactedContent" | "riskLevel">) {
        const store = await updateDemoStore(async (draft) => {
          draft.messages.push({
            ...message,
            id: randomUUID(),
            createdAt: new Date().toISOString(),
            redactedContent: null,
            riskLevel: null
          });
          draft.conversation.updatedAt = new Date().toISOString();
          return draft;
        });
        return store.messages.at(-1)!;
      },
      async appendAIMessage(message: Omit<Message, "id" | "createdAt">) {
        const store = await updateDemoStore(async (draft) => {
          draft.messages.push({
            ...message,
            id: randomUUID(),
            createdAt: new Date().toISOString()
          });
          draft.conversation.updatedAt = new Date().toISOString();
          return draft;
        });
        return store.messages.at(-1)!;
      },
      async saveEscalation(escalation: Omit<Escalation, "id" | "createdAt" | "resolvedAt" | "status">) {
        const store = await updateDemoStore(async (draft) => {
          draft.escalations.unshift({
            ...escalation,
            id: randomUUID(),
            status: "OPEN",
            createdAt: new Date().toISOString(),
            resolvedAt: null
          });
          draft.conversation.status = "ESCALATED";
          return draft;
        });
        return store.escalations[0];
      },
      async saveAuditEvent(event: Omit<AuditEvent, "id" | "createdAt">) {
        await updateDemoStore(async (draft) => {
          draft.auditEvents.unshift({
            ...event,
            id: randomUUID(),
            createdAt: new Date().toISOString()
          });
          return draft;
        });
      },
      async updateCarePlan(input: Omit<CarePlan, "id" | "doctorId" | "lastUpdatedAt">) {
        const store = await updateDemoStore(async (draft) => {
          draft.carePlan = {
            ...draft.carePlan,
            ...input,
            lastUpdatedAt: new Date().toISOString()
          };
          return draft;
        });
        return store.carePlan;
      },
      async createUpload(upload: Omit<Upload, "id" | "createdAt">) {
        const store = await updateDemoStore(async (draft) => {
          draft.uploads.unshift({
            ...upload,
            id: randomUUID(),
            createdAt: new Date().toISOString()
          });
          return draft;
        });
        return store.uploads[0];
      },
      async updateAdminTask(taskId: string, status: AdminTask["status"]) {
        const store = await updateDemoStore(async (draft) => {
          draft.adminTasks = draft.adminTasks.map((task) => (task.id === taskId ? { ...task, status } : task));
          return draft;
        });
        return store.adminTasks.find((task) => task.id === taskId) ?? null;
      }
    };
  }

  const db = prisma!;

  return {
    async findUserByEmail(email: string): Promise<AppUser | null> {
      const user = await db.user.findUnique({ where: { email } });
      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        passwordHash: user.passwordHash,
        role: user.role as Role
      };
    },
    async getDashboardData(): Promise<DashboardData> {
      const [clinic, patient, doctor, admin, carePlan, conversation, messages, uploads, escalations, policies, users] =
        await Promise.all([
          db.clinic.findFirstOrThrow(),
          db.patientProfile.findFirstOrThrow(),
          db.doctorProfile.findFirstOrThrow(),
          db.adminProfile.findFirstOrThrow(),
          db.carePlan.findFirstOrThrow(),
          db.conversation.findFirstOrThrow(),
          db.message.findMany({ orderBy: { createdAt: "asc" } }),
          db.upload.findMany({ orderBy: { createdAt: "desc" } }),
          db.escalation.findMany({ orderBy: { createdAt: "desc" } }),
          db.clinicPolicy.findMany(),
          db.user.findMany()
        ]);

      return {
        clinic,
        patient: { ...patient, dob: patient.dob?.toISOString() ?? "" },
        doctor,
        admin,
        carePlan: {
          ...carePlan,
          escalationThresholdsJson: carePlan.escalationThresholdsJson as CarePlan["escalationThresholdsJson"],
          lastUpdatedAt: carePlan.lastUpdatedAt.toISOString()
        },
        conversation: {
          ...conversation,
          createdAt: conversation.createdAt.toISOString(),
          updatedAt: conversation.updatedAt.toISOString()
        },
        messages: messages.map((message: any) => ({
          ...message,
          riskLevel: message.riskLevel as Message["riskLevel"],
          createdAt: message.createdAt.toISOString()
        })),
        uploads: uploads.map((upload: any) => ({
          ...upload,
          conversationId: upload.conversationId,
          uploadedByRole: upload.uploadedByRole as Role,
          createdAt: upload.createdAt.toISOString()
        })),
        escalations: escalations.map((escalation: any) => ({
          ...escalation,
          riskLevel: escalation.riskLevel as Escalation["riskLevel"],
          status: escalation.status as Escalation["status"],
          createdAt: escalation.createdAt.toISOString(),
          resolvedAt: escalation.resolvedAt?.toISOString() ?? null
        })),
        policies,
        users: users.map((user: any) => ({
          id: user.id,
          email: user.email,
          name: user.name,
          passwordHash: user.passwordHash,
          role: user.role as Role
        })),
        styleNote: undefined,
        adminTasks: [
          {
            id: "admin_task_db_fallback",
            title: "Review unresolved clinic workflow items",
            status: "OPEN",
            patientId: patient.id,
            suggestedBy: "AI",
            createdAt: new Date().toISOString()
          }
        ]
      };
    },
    async appendPatientMessage(message: Omit<Message, "id" | "createdAt" | "redactedContent" | "riskLevel">) {
      const created = await db.message.create({
        data: {
          conversationId: message.conversationId,
          senderType: message.senderType,
          senderId: message.senderId,
          content: message.content,
          contentType: message.contentType
        }
      });
      return { ...created, riskLevel: null, redactedContent: null, createdAt: created.createdAt.toISOString() };
    },
    async appendAIMessage(message: Omit<Message, "id" | "createdAt">) {
      const created = await db.message.create({
        data: {
          conversationId: message.conversationId,
          senderType: message.senderType,
          senderId: message.senderId,
          content: message.content,
          contentType: message.contentType,
          riskLevel: message.riskLevel ?? undefined,
          redactedContent: message.redactedContent ?? undefined
        }
      });
      return { ...created, riskLevel: created.riskLevel as Message["riskLevel"], createdAt: created.createdAt.toISOString() };
    },
    async saveEscalation(escalation: Omit<Escalation, "id" | "createdAt" | "resolvedAt" | "status">) {
      const created = await db.escalation.create({
        data: {
          patientId: escalation.patientId,
          conversationId: escalation.conversationId,
          riskLevel: escalation.riskLevel,
          reason: escalation.reason,
          requiresDoctorReview: escalation.requiresDoctorReview,
          requiresAdminFollowup: escalation.requiresAdminFollowup,
          emergencyAdvice: escalation.emergencyAdvice
        }
      });
      return {
        ...created,
        riskLevel: created.riskLevel as Escalation["riskLevel"],
        status: created.status as Escalation["status"],
        createdAt: created.createdAt.toISOString(),
        resolvedAt: created.resolvedAt?.toISOString() ?? null
      };
    },
    async saveAuditEvent(event: Omit<AuditEvent, "id" | "createdAt">) {
      await db.auditEvent.create({
        data: {
          actorType: event.actorType,
          actorId: event.actorId,
          action: event.action,
          metadataJson: event.metadataJson as Prisma.InputJsonValue
        }
      });
    },
    async updateCarePlan(input: Omit<CarePlan, "id" | "doctorId" | "lastUpdatedAt">) {
      const updated = await db.carePlan.update({
        where: { patientId: input.patientId },
        data: {
          diagnosisSummary: input.diagnosisSummary,
          treatmentPlan: input.treatmentPlan,
          riskFactors: input.riskFactors,
          personalizedNotes: input.personalizedNotes,
          escalationThresholdsJson: input.escalationThresholdsJson as Prisma.InputJsonValue
        }
      });
      return {
        ...updated,
        escalationThresholdsJson: updated.escalationThresholdsJson as CarePlan["escalationThresholdsJson"],
        lastUpdatedAt: updated.lastUpdatedAt.toISOString()
      };
    },
    async createUpload(upload: Omit<Upload, "id" | "createdAt">) {
      const created = await db.upload.create({ data: upload });
      return { ...created, uploadedByRole: created.uploadedByRole as Role, createdAt: created.createdAt.toISOString() };
    },
    async updateAdminTask() {
      return null;
    }
  };
}
