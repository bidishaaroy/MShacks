import { PrismaClient, Role, MessageSenderType, ContentType, EscalationStatus } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/clinai_bridge',
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])

async function main() {
  console.log('Seeding database...')

  await prisma.auditEvent.deleteMany()
  await prisma.escalation.deleteMany()
  await prisma.upload.deleteMany()
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.carePlan.deleteMany()
  await prisma.clinicPolicy.deleteMany()
  await prisma.adminProfile.deleteMany()
  await prisma.doctorProfile.deleteMany()
  await prisma.patientProfile.deleteMany()
  await prisma.user.deleteMany()
  await prisma.clinic.deleteMany()

  const clinic = await prisma.clinic.create({
    data: { name: 'Riverside Medical Clinic' },
  })

  const passwordHash = await bcrypt.hash('password123', 12)

  const doctorUser = await prisma.user.create({
    data: { name: 'Dr. Sarah Chen', email: 'doctor@demo.com', passwordHash, role: Role.DOCTOR },
  })

  const doctorProfile = await prisma.doctorProfile.create({
    data: { userId: doctorUser.id, specialization: 'Cardiology', clinicId: clinic.id },
  })

  const adminUser = await prisma.user.create({
    data: { name: 'James Park', email: 'admin@demo.com', passwordHash, role: Role.ADMIN },
  })

  await prisma.adminProfile.create({
    data: { userId: adminUser.id, clinicId: clinic.id },
  })

  const patientUser = await prisma.user.create({
    data: { name: 'Maria Santos', email: 'patient@demo.com', passwordHash, role: Role.PATIENT },
  })

  const patientProfile = await prisma.patientProfile.create({
    data: {
      userId: patientUser.id,
      assignedDoctorId: doctorProfile.id,
      dob: new Date('1985-03-15'),
      clinicId: clinic.id,
      summary: 'Female patient, 40 years old. Diagnosed with hypertension and mild atrial fibrillation.',
    },
  })

  const carePlan = await prisma.carePlan.create({
    data: {
      patientId: patientProfile.id,
      doctorId: doctorProfile.id,
      diagnosisSummary: 'Stage 2 hypertension and paroxysmal atrial fibrillation. ECG confirmed AFib episodes. No structural heart disease detected.',
      treatmentPlan: '1. Lisinopril 10mg daily\n2. Metoprolol 25mg twice daily\n3. Warfarin 5mg daily (target INR 2.0-3.0)\n4. Low-sodium diet\n5. 30 min moderate exercise 5x/week\n6. Weekly BP monitoring\n7. Monthly INR checks',
      riskFactors: 'Hypertension, AFib, Family history of stroke',
      escalationThresholdsJson: {
        bloodPressure: { systolic: 180, diastolic: 110 },
        heartRate: { min: 40, max: 150 },
        symptoms: ['chest pain', 'shortness of breath', 'palpitations lasting >6 hours', 'dizziness', 'fainting'],
      },
      personalizedNotes: 'Maria is a motivated patient. Works as a nurse so medical terminology can be used. Emphasize INR monitoring compliance.',
    },
  })

  const conversation = await prisma.conversation.create({
    data: { patientId: patientProfile.id, status: 'ACTIVE' },
  })

  const messages = [
    {
      senderType: MessageSenderType.PATIENT,
      senderId: patientUser.id,
      content: "Hi, I've been feeling some mild dizziness this morning after taking my medications. Is this normal?",
      contentType: ContentType.TEXT,
      riskLevel: 'low',
    },
    {
      senderType: MessageSenderType.AI,
      senderId: null,
      content: "Hello Maria! Mild dizziness can sometimes occur with Lisinopril early in treatment. Check your blood pressure and stay hydrated. Contact Dr. Chen if dizziness is severe or accompanied by chest pain.",
      contentType: ContentType.TEXT,
      riskLevel: 'low',
    },
    {
      senderType: MessageSenderType.PATIENT,
      senderId: patientUser.id,
      content: "My BP is 128/84. Heart rate is 72. Dizziness is better now. I also had palpitations last night for about 2 hours.",
      contentType: ContentType.TEXT,
      riskLevel: 'medium',
    },
    {
      senderType: MessageSenderType.AI,
      senderId: null,
      content: "Your BP and heart rate look good. The 2-hour palpitations are at the monitoring threshold in your care plan. I've flagged this for Dr. Chen's review. Please log the time, duration, and intensity of any future palpitations.",
      contentType: ContentType.TEXT,
      riskLevel: 'medium',
    },
    {
      senderType: MessageSenderType.PATIENT,
      senderId: patientUser.id,
      content: "Can I take ibuprofen for a headache? I know I'm on warfarin.",
      contentType: ContentType.TEXT,
      riskLevel: 'medium',
    },
    {
      senderType: MessageSenderType.AI,
      senderId: null,
      content: "Avoid ibuprofen while on Warfarin — it increases bleeding risk and can affect your INR. Safe alternative: Acetaminophen (Tylenol) up to 500mg. Always consult Dr. Chen or your pharmacist before taking new medications.",
      contentType: ContentType.TEXT,
      riskLevel: 'medium',
    },
  ]

  for (const msg of messages) {
    await prisma.message.create({ data: { conversationId: conversation.id, ...msg } })
  }

  await prisma.escalation.create({
    data: {
      patientId: patientProfile.id,
      conversationId: conversation.id,
      riskLevel: 'medium',
      reason: 'Patient reported palpitations lasting 2 hours. Dr. Chen should review Metoprolol dosing and recent INR levels.',
      requiresDoctorReview: true,
      requiresAdminFollowup: false,
      emergencyAdvice: false,
      status: EscalationStatus.OPEN,
    },
  })

  await prisma.clinicPolicy.createMany({
    data: [
      {
        clinicId: clinic.id,
        title: 'Emergency Protocol',
        body: 'For any life-threatening emergency, direct patients to call 911 immediately. Red flags: chest pain, loss of consciousness, difficulty breathing, stroke symptoms.',
        category: 'emergency',
      },
      {
        clinicId: clinic.id,
        title: 'Medication Guidelines',
        body: 'AI must never recommend dosage changes or new medications. NSAIDs contraindicated with anticoagulation therapy.',
        category: 'medication',
      },
      {
        clinicId: clinic.id,
        title: 'Scheduling and Follow-up',
        body: 'Urgent appointments within 24-48 hours for medium-risk escalations. High/critical risk: same-day appointments.',
        category: 'scheduling',
      },
    ],
  })

  await prisma.auditEvent.createMany({
    data: [
      { actorType: 'SYSTEM', actorId: null, action: 'DATABASE_SEEDED', metadataJson: { timestamp: new Date().toISOString() } },
      { actorType: 'DOCTOR', actorId: doctorUser.id, action: 'CARE_PLAN_CREATED', metadataJson: { patientId: patientProfile.id, carePlanId: carePlan.id } },
    ],
  })

  console.log('✅ Database seeded successfully!')
  console.log('  Doctor:  doctor@demo.com / password123')
  console.log('  Admin:   admin@demo.com / password123')
  console.log('  Patient: patient@demo.com / password123')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect(); await pool.end() })
