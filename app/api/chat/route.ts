import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { callGemini } from '@/services/gemini'
import { validateAIResponse } from '@/lib/policy/engine'
import { Role, MessageSenderType, ContentType, EscalationStatus } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== Role.PATIENT) {
      return NextResponse.json(
        { error: 'Only patients can send messages' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { message, conversationId } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Load patient profile with care plan
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        carePlans: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        clinic: {
          include: {
            policies: true,
          },
        },
      },
    })

    if (!patientProfile) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
    }

    // Get or create conversation
    let conversation
    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          patientId: patientProfile.id,
        },
      })
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          patientId: patientProfile.id,
          status: 'ACTIVE',
        },
      })
    }

    // Save patient message
    const patientMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderType: MessageSenderType.PATIENT,
        senderId: session.user.id,
        content: message,
        contentType: ContentType.TEXT,
      },
    })

    const carePlan = patientProfile.carePlans[0] || null
    const clinicPolicies = patientProfile.clinic?.policies || []

    // Call Gemini AI
    const aiDraft = await callGemini({
      userMessage: message,
      carePlan: carePlan ? {
        diagnosisSummary: carePlan.diagnosisSummary,
        treatmentPlan: carePlan.treatmentPlan,
        riskFactors: carePlan.riskFactors || undefined,
        personalizedNotes: carePlan.personalizedNotes || undefined,
        escalationThresholdsJson: carePlan.escalationThresholdsJson,
      } : null,
      clinicPolicies: clinicPolicies.map((p) => ({
        title: p.title,
        body: p.body,
        category: p.category,
      })),
      patientName: session.user.name || undefined,
    })

    // Run policy engine validation
    const validationResult = validateAIResponse(
      aiDraft,
      message,
      carePlan ? {
        diagnosisSummary: carePlan.diagnosisSummary,
        treatmentPlan: carePlan.treatmentPlan,
        riskFactors: carePlan.riskFactors || undefined,
      } : null,
      clinicPolicies.map((p) => ({
        title: p.title,
        body: p.body,
        category: p.category,
      }))
    )

    const finalResponse = validationResult.response

    // Save AI message
    const aiMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderType: MessageSenderType.AI,
        senderId: null,
        content: finalResponse.message_for_user,
        contentType: ContentType.TEXT,
        riskLevel: finalResponse.risk_level,
      },
    })

    // Create escalation if needed
    let escalation = null
    if (
      finalResponse.risk_level === 'high' ||
      finalResponse.risk_level === 'critical' ||
      finalResponse.requires_doctor_review ||
      finalResponse.requires_admin_followup ||
      finalResponse.emergency_advice
    ) {
      escalation = await prisma.escalation.create({
        data: {
          patientId: patientProfile.id,
          conversationId: conversation.id,
          riskLevel: finalResponse.risk_level,
          reason: finalResponse.refusal_reason ||
            `AI detected ${finalResponse.risk_level} risk. Intent: ${finalResponse.intent}. Patient message: "${message.substring(0, 200)}"`,
          requiresDoctorReview: finalResponse.requires_doctor_review,
          requiresAdminFollowup: finalResponse.requires_admin_followup,
          emergencyAdvice: finalResponse.emergency_advice,
          status: EscalationStatus.OPEN,
        },
      })
    }

    // Create audit event
    await prisma.auditEvent.create({
      data: {
        actorType: 'PATIENT',
        actorId: session.user.id,
        action: 'AI_CHAT_MESSAGE',
        metadataJson: {
          conversationId: conversation.id,
          patientMessageId: patientMessage.id,
          aiMessageId: aiMessage.id,
          riskLevel: finalResponse.risk_level,
          intent: finalResponse.intent,
          policyOutcome: validationResult.outcome,
          escalationCreated: !!escalation,
        },
      },
    })

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      message: {
        id: aiMessage.id,
        content: finalResponse.message_for_user,
        riskLevel: finalResponse.risk_level,
        intent: finalResponse.intent,
        usedSources: finalResponse.used_sources,
        nextActions: finalResponse.next_actions,
        requiresDoctorReview: finalResponse.requires_doctor_review,
        emergencyAdvice: finalResponse.emergency_advice,
      },
      escalation: escalation
        ? {
            id: escalation.id,
            riskLevel: escalation.riskLevel,
            requiresDoctorReview: escalation.requiresDoctorReview,
          }
        : null,
    })
  } catch (error) {
    console.error('[Chat API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('conversationId')

    if (session.user.role === Role.PATIENT) {
      const patientProfile = await prisma.patientProfile.findUnique({
        where: { userId: session.user.id },
      })

      if (!patientProfile) {
        return NextResponse.json({ messages: [], conversationId: null })
      }

      let conversation
      if (conversationId) {
        conversation = await prisma.conversation.findFirst({
          where: { id: conversationId, patientId: patientProfile.id },
          include: {
            messages: { orderBy: { createdAt: 'asc' } },
          },
        })
      } else {
        conversation = await prisma.conversation.findFirst({
          where: { patientId: patientProfile.id },
          orderBy: { updatedAt: 'desc' },
          include: {
            messages: { orderBy: { createdAt: 'asc' } },
          },
        })
      }

      return NextResponse.json({
        messages: conversation?.messages || [],
        conversationId: conversation?.id || null,
      })
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  } catch (error) {
    console.error('[Chat GET] Error:', error)
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 })
  }
}
