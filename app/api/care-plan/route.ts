import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Role } from '@prisma/client'
import { z } from 'zod'

const CarePlanSchema = z.object({
  patientId: z.string(),
  diagnosisSummary: z.string().min(1, 'Diagnosis summary is required'),
  treatmentPlan: z.string().min(1, 'Treatment plan is required'),
  riskFactors: z.string().optional(),
  escalationThresholdsJson: z.unknown().optional(),
  personalizedNotes: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const patientId = url.searchParams.get('patientId')

    if (session.user.role === Role.PATIENT) {
      // Patient can only view their own care plan
      const patientProfile = await prisma.patientProfile.findUnique({
        where: { userId: session.user.id },
        include: {
          carePlans: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              doctor: {
                include: { user: { select: { name: true } } },
              },
            },
          },
        },
      })

      return NextResponse.json({
        carePlan: patientProfile?.carePlans[0] || null,
      })
    }

    if (session.user.role === Role.DOCTOR) {
      if (!patientId) {
        // Return all care plans for this doctor
        const doctorProfile = await prisma.doctorProfile.findUnique({
          where: { userId: session.user.id },
        })

        if (!doctorProfile) {
          return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
        }

        const carePlans = await prisma.carePlan.findMany({
          where: { doctorId: doctorProfile.id },
          include: {
            patient: {
              include: { user: { select: { name: true, email: true } } },
            },
          },
          orderBy: { lastUpdatedAt: 'desc' },
        })

        return NextResponse.json({ carePlans })
      }

      // Return specific patient's care plan
      const carePlan = await prisma.carePlan.findFirst({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            include: { user: { select: { name: true, email: true } } },
          },
        },
      })

      return NextResponse.json({ carePlan })
    }

    if (session.user.role === Role.ADMIN) {
      if (!patientId) {
        return NextResponse.json({ error: 'patientId required' }, { status: 400 })
      }

      const carePlan = await prisma.carePlan.findFirst({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({ carePlan })
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  } catch (error) {
    console.error('[CarePlan GET] Error:', error)
    return NextResponse.json({ error: 'Failed to load care plan' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== Role.DOCTOR) {
      return NextResponse.json(
        { error: 'Only doctors can create or update care plans' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = CarePlanSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid care plan data', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!doctorProfile) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    const { patientId, ...carePlanData } = parsed.data

    // Check if care plan exists for upsert
    const existing = await prisma.carePlan.findFirst({
      where: { patientId, doctorId: doctorProfile.id },
      orderBy: { createdAt: 'desc' },
    })

    let carePlan
    if (existing) {
      carePlan = await prisma.carePlan.update({
        where: { id: existing.id },
        data: {
          diagnosisSummary: carePlanData.diagnosisSummary,
          treatmentPlan: carePlanData.treatmentPlan,
          riskFactors: carePlanData.riskFactors,
          personalizedNotes: carePlanData.personalizedNotes,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          escalationThresholdsJson: (carePlanData.escalationThresholdsJson as any) ?? undefined,
        },
      })
    } else {
      carePlan = await prisma.carePlan.create({
        data: {
          patientId,
          doctorId: doctorProfile.id,
          diagnosisSummary: carePlanData.diagnosisSummary,
          treatmentPlan: carePlanData.treatmentPlan,
          riskFactors: carePlanData.riskFactors,
          personalizedNotes: carePlanData.personalizedNotes,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          escalationThresholdsJson: (carePlanData.escalationThresholdsJson as any) ?? undefined,
        },
      })
    }

    // Audit
    await prisma.auditEvent.create({
      data: {
        actorType: 'DOCTOR',
        actorId: session.user.id,
        action: existing ? 'CARE_PLAN_UPDATED' : 'CARE_PLAN_CREATED',
        metadataJson: { carePlanId: carePlan.id, patientId },
      },
    })

    return NextResponse.json({ success: true, carePlan })
  } catch (error) {
    console.error('[CarePlan POST] Error:', error)
    return NextResponse.json({ error: 'Failed to save care plan' }, { status: 500 })
  }
}
