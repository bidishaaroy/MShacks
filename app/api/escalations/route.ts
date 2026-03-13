import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Role, EscalationStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (
      session.user.role !== Role.DOCTOR &&
      session.user.role !== Role.ADMIN
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const patientId = searchParams.get('patientId')

    const where: Record<string, unknown> = {}
    if (status === 'OPEN') where.status = EscalationStatus.OPEN
    if (status === 'RESOLVED') where.status = EscalationStatus.RESOLVED
    if (patientId) where.patientId = patientId

    if (session.user.role === Role.DOCTOR) {
      // Doctors see escalations requiring doctor review
      where.requiresDoctorReview = true
    } else if (session.user.role === Role.ADMIN) {
      // Admins see all escalations (or those requiring admin followup)
      // Uncomment to filter: where.requiresAdminFollowup = true
    }

    const escalations = await prisma.escalation.findMany({
      where,
      include: {
        patient: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 3,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ escalations })
  } catch (error) {
    console.error('[Escalations GET] Error:', error)
    return NextResponse.json({ error: 'Failed to load escalations' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (
      session.user.role !== Role.DOCTOR &&
      session.user.role !== Role.ADMIN
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { escalationId, status } = body

    if (!escalationId) {
      return NextResponse.json({ error: 'escalationId is required' }, { status: 400 })
    }

    const escalation = await prisma.escalation.update({
      where: { id: escalationId },
      data: {
        status: status === 'RESOLVED' ? EscalationStatus.RESOLVED : EscalationStatus.OPEN,
        resolvedAt: status === 'RESOLVED' ? new Date() : null,
      },
    })

    // Audit
    await prisma.auditEvent.create({
      data: {
        actorType: session.user.role,
        actorId: session.user.id,
        action: 'ESCALATION_RESOLVED',
        metadataJson: { escalationId, status },
      },
    })

    return NextResponse.json({ success: true, escalation })
  } catch (error) {
    console.error('[Escalations PATCH] Error:', error)
    return NextResponse.json({ error: 'Failed to update escalation' }, { status: 500 })
  }
}
