import { PrismaClient, Role, SenderType, ContentType, UploadType, RiskLevel, ConversationStatus, EscalationStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import demoStore from "../data/demo-store.json";

const prisma = new PrismaClient();

async function main() {
  const clinic = await prisma.clinic.upsert({
    where: { id: demoStore.clinic.id },
    update: { name: demoStore.clinic.name },
    create: { id: demoStore.clinic.id, name: demoStore.clinic.name }
  });

  const users = await Promise.all(
    demoStore.users.map(async (user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          role: user.role as Role,
          passwordHash: user.passwordHash || (await bcrypt.hash(user.password, 10))
        },
        create: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as Role,
          passwordHash: user.passwordHash || (await bcrypt.hash(user.password, 10))
        }
      })
    )
  );

  const doctorUser = users.find((user) => user.email === "doctor@demo.com");
  const adminUser = users.find((user) => user.email === "admin@demo.com");
  const patientUser = users.find((user) => user.email === "patient@demo.com");

  if (!doctorUser || !adminUser || !patientUser) {
    throw new Error("Demo users failed to seed");
  }

  const doctor = await prisma.doctorProfile.upsert({
    where: { userId: doctorUser.id },
    update: {
      clinicId: clinic.id,
      specialization: demoStore.profiles.doctor.specialization
    },
    create: {
      id: demoStore.profiles.doctor.id,
      userId: doctorUser.id,
      clinicId: clinic.id,
      specialization: demoStore.profiles.doctor.specialization
    }
  });

  const admin = await prisma.adminProfile.upsert({
    where: { userId: adminUser.id },
    update: { clinicId: clinic.id },
    create: {
      id: demoStore.profiles.admin.id,
      userId: adminUser.id,
      clinicId: clinic.id
    }
  });

  const patient = await prisma.patientProfile.upsert({
    where: { userId: patientUser.id },
    update: {
      clinicId: clinic.id,
      assignedDoctorId: doctor.id,
      assignedAdminId: admin.id,
      summary: demoStore.profiles.patient.summary,
      dob: new Date(demoStore.profiles.patient.dob)
    },
    create: {
      id: demoStore.profiles.patient.id,
      userId: patientUser.id,
      clinicId: clinic.id,
      assignedDoctorId: doctor.id,
      assignedAdminId: admin.id,
      summary: demoStore.profiles.patient.summary,
      dob: new Date(demoStore.profiles.patient.dob)
    }
  });

  await prisma.carePlan.upsert({
    where: { id: demoStore.carePlan.id },
    update: {
      patientId: patient.id,
      doctorId: doctor.id,
      diagnosisSummary: demoStore.carePlan.diagnosisSummary,
      treatmentPlan: demoStore.carePlan.treatmentPlan,
      riskFactors: demoStore.carePlan.riskFactors,
      escalationThresholdsJson: demoStore.carePlan.escalationThresholdsJson,
      personalizedNotes: demoStore.carePlan.personalizedNotes
    },
    create: {
      id: demoStore.carePlan.id,
      patientId: patient.id,
      doctorId: doctor.id,
      diagnosisSummary: demoStore.carePlan.diagnosisSummary,
      treatmentPlan: demoStore.carePlan.treatmentPlan,
      riskFactors: demoStore.carePlan.riskFactors,
      escalationThresholdsJson: demoStore.carePlan.escalationThresholdsJson,
      personalizedNotes: demoStore.carePlan.personalizedNotes
    }
  });

  await prisma.conversation.upsert({
    where: { id: demoStore.conversation.id },
    update: {
      patientId: patient.id,
      status: demoStore.conversation.status as ConversationStatus
    },
    create: {
      id: demoStore.conversation.id,
      patientId: patient.id,
      status: demoStore.conversation.status as ConversationStatus,
      createdAt: new Date(demoStore.conversation.createdAt),
      updatedAt: new Date(demoStore.conversation.updatedAt)
    }
  });

  for (const message of demoStore.messages) {
    await prisma.message.upsert({
      where: { id: message.id },
      update: {
        content: message.content,
        contentType: message.contentType as ContentType,
        senderType: message.senderType as SenderType,
        senderId: message.senderId,
        riskLevel: (message.riskLevel as RiskLevel | null) ?? undefined,
        redactedContent: message.redactedContent
      },
      create: {
        id: message.id,
        conversationId: message.conversationId,
        content: message.content,
        contentType: message.contentType as ContentType,
        senderType: message.senderType as SenderType,
        senderId: message.senderId,
        riskLevel: (message.riskLevel as RiskLevel | null) ?? undefined,
        redactedContent: message.redactedContent,
        createdAt: new Date(message.createdAt)
      }
    });
  }

  for (const upload of demoStore.uploads) {
    await prisma.upload.upsert({
      where: { id: upload.id },
      update: {
        blobUrl: upload.blobUrl,
        mimeType: upload.mimeType,
        type: upload.type as UploadType,
        uploadedByRole: upload.uploadedByRole as Role
      },
      create: {
        id: upload.id,
        patientId: upload.patientId,
        conversationId: upload.conversationId,
        blobUrl: upload.blobUrl,
        mimeType: upload.mimeType,
        type: upload.type as UploadType,
        uploadedByRole: upload.uploadedByRole as Role,
        createdAt: new Date(upload.createdAt)
      }
    });
  }

  for (const escalation of demoStore.escalations) {
    await prisma.escalation.upsert({
      where: { id: escalation.id },
      update: {
        riskLevel: escalation.riskLevel as RiskLevel,
        reason: escalation.reason,
        requiresDoctorReview: escalation.requiresDoctorReview,
        requiresAdminFollowup: escalation.requiresAdminFollowup,
        emergencyAdvice: escalation.emergencyAdvice,
        status: escalation.status as EscalationStatus
      },
      create: {
        id: escalation.id,
        patientId: escalation.patientId,
        conversationId: escalation.conversationId,
        riskLevel: escalation.riskLevel as RiskLevel,
        reason: escalation.reason,
        requiresDoctorReview: escalation.requiresDoctorReview,
        requiresAdminFollowup: escalation.requiresAdminFollowup,
        emergencyAdvice: escalation.emergencyAdvice,
        status: escalation.status as EscalationStatus,
        createdAt: new Date(escalation.createdAt),
        resolvedAt: escalation.resolvedAt ? new Date(escalation.resolvedAt) : null
      }
    });
  }

  for (const policy of demoStore.clinicPolicies) {
    await prisma.clinicPolicy.upsert({
      where: { id: policy.id },
      update: {
        title: policy.title,
        body: policy.body,
        category: policy.category
      },
      create: {
        id: policy.id,
        clinicId: clinic.id,
        title: policy.title,
        body: policy.body,
        category: policy.category
      }
    });
  }

  for (const event of demoStore.auditEvents) {
    await prisma.auditEvent.upsert({
      where: { id: event.id },
      update: {
        actorType: event.actorType,
        actorId: event.actorId,
        action: event.action,
        metadataJson: event.metadataJson
      },
      create: {
        id: event.id,
        actorType: event.actorType,
        actorId: event.actorId,
        action: event.action,
        metadataJson: event.metadataJson,
        createdAt: new Date(event.createdAt)
      }
    });
  }

  console.log("ClinAI Bridge seed complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
