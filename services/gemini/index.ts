import { AIResponse, AIResponseSchema } from '@/lib/validators/ai-response'

interface CarePlanContext {
  diagnosisSummary?: string
  treatmentPlan?: string
  riskFactors?: string
  personalizedNotes?: string
  escalationThresholdsJson?: unknown
}

interface ClinicPolicy {
  title: string
  body: string
  category: string
}

interface GeminiInput {
  userMessage: string
  carePlan: CarePlanContext | null
  clinicPolicies: ClinicPolicy[]
  conversationHistory?: Array<{ role: string; content: string }>
  patientName?: string
}

const SYSTEM_PROMPT = `You are ClinAI Bridge, a clinic support AI assistant. Your role is to help patients understand their care plan, answer health questions based on clinic guidelines, and triage concerns to the appropriate care team.

CRITICAL SAFETY RULES - NEVER VIOLATE:
1. NEVER diagnose any medical condition
2. NEVER prescribe or recommend medications or dosage changes
3. NEVER recommend controlled substances or illegal drugs
4. ALWAYS escalate emergency symptoms (chest pain, difficulty breathing, loss of consciousness, stroke symptoms, severe allergic reactions) with instruction to call 911
5. NEVER provide false reassurance about serious symptoms
6. NEVER recommend self-harm or respond to self-harm inquiries without crisis resources
7. Only reference information from the provided care plan and clinic policies
8. Always recommend consulting the doctor or clinic for medical decisions
9. Be compassionate, clear, and professional

You must respond in valid JSON matching this exact schema:
{
  "message_for_user": "string - the response to show the patient",
  "intent": "admin_help" | "care_plan_explanation" | "triage" | "upload_review" | "escalation" | "refusal",
  "risk_level": "low" | "medium" | "high" | "critical",
  "used_sources": ["array of source names you referenced"],
  "requires_doctor_review": boolean,
  "requires_admin_followup": boolean,
  "emergency_advice": boolean,
  "refusal_reason": "string or null",
  "next_actions": ["array of recommended next steps"]
}`

function getMockResponse(userMessage: string, carePlan: CarePlanContext | null): AIResponse {
  const lowerMsg = userMessage.toLowerCase()

  // Medication question mock
  if (lowerMsg.includes('medication') || lowerMsg.includes('medicine') || lowerMsg.includes('pill')) {
    return {
      message_for_user: carePlan
        ? `Based on your doctor's care plan, your current medications are part of your treatment plan. ${carePlan.treatmentPlan?.split('\n')[0] || 'Please follow your prescribed regimen as directed.'}\n\nIf you have any concerns about your medications, please contact Dr. Chen or your pharmacist directly.`
        : "I can see you have a question about medications. For specific medication guidance, please consult your healthcare provider. I can help you understand your care plan once your doctor has added it to your profile.",
      intent: 'care_plan_explanation',
      risk_level: 'low',
      used_sources: carePlan ? ['Care Plan - Treatment Notes'] : [],
      requires_doctor_review: false,
      requires_admin_followup: false,
      emergency_advice: false,
      refusal_reason: null,
      next_actions: ['Review your care plan', 'Contact clinic if you have specific medication concerns'],
    }
  }

  // Symptoms/pain mock
  if (lowerMsg.includes('pain') || lowerMsg.includes('hurt') || lowerMsg.includes('symptoms')) {
    return {
      message_for_user: `I hear that you're experiencing discomfort. Based on your care plan, mild symptoms can sometimes be expected. However, I want to make sure you're safe.\n\nPlease monitor your symptoms and contact the clinic if:\n• Symptoms worsen or become severe\n• You experience any new or unusual symptoms\n• Your symptoms persist for more than 24 hours\n\nFor immediate concerns, please call the clinic or, in case of emergency, call 911.`,
      intent: 'triage',
      risk_level: 'medium',
      used_sources: carePlan ? ['Care Plan - Risk Factors', 'Clinic Policy - Emergency Protocol'] : ['Clinic Policy - Emergency Protocol'],
      requires_doctor_review: true,
      requires_admin_followup: false,
      emergency_advice: false,
      refusal_reason: null,
      next_actions: ['Monitor symptoms', 'Contact clinic within 24 hours', 'Call 911 if symptoms become severe'],
    }
  }

  // Appointment mock
  if (lowerMsg.includes('appointment') || lowerMsg.includes('schedule') || lowerMsg.includes('visit')) {
    return {
      message_for_user: `I can help you with scheduling information. Based on your care plan, your next follow-up should be in approximately 3 months.\n\nTo schedule an appointment:\n• Contact the clinic directly at the front desk\n• Or the admin team can assist you through this platform\n\nIs there anything specific you'd like to discuss at your next appointment?`,
      intent: 'admin_help',
      risk_level: 'low',
      used_sources: ['Clinic Policy - Scheduling and Follow-up'],
      requires_doctor_review: false,
      requires_admin_followup: true,
      emergency_advice: false,
      refusal_reason: null,
      next_actions: ['Contact clinic to schedule appointment', 'Prepare list of questions for your doctor'],
    }
  }

  // Default mock response
  return {
    message_for_user: carePlan
      ? `Based on your doctor's care plan, I can see you're being monitored for ${carePlan.diagnosisSummary?.split('.')[0] || 'your condition'}. I'm here to help you understand your treatment and answer questions.\n\nCould you provide more details about what you'd like to know? I'm here to support you based on your care plan and clinic guidelines.`
      : "Hello! I'm ClinAI Bridge, your clinic support assistant. I'm here to help you understand your care plan and answer health questions based on your clinic's guidelines.\n\nIt looks like your care plan hasn't been set up yet. Once your doctor adds your care plan, I'll be able to provide more personalized support. In the meantime, feel free to ask any general questions or contact the clinic directly.",
    intent: 'care_plan_explanation',
    risk_level: 'low',
    used_sources: carePlan ? ['Care Plan - Diagnosis Summary'] : [],
    requires_doctor_review: false,
    requires_admin_followup: false,
    emergency_advice: false,
    refusal_reason: null,
    next_actions: ['Continue following your care plan', 'Contact clinic if you have specific concerns'],
  }
}

export async function callGemini(input: GeminiInput): Promise<AIResponse> {
  const { userMessage, carePlan, clinicPolicies, patientName } = input

  // Use mock if no API key
  if (!process.env.GEMINI_API_KEY) {
    console.log('[Gemini] No API key found, using mock response')
    return getMockResponse(userMessage, carePlan)
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const contextParts: string[] = []

    if (patientName) {
      contextParts.push(`Patient Name: ${patientName}`)
    }

    if (carePlan) {
      contextParts.push(`
PATIENT CARE PLAN:
Diagnosis: ${carePlan.diagnosisSummary || 'Not provided'}
Treatment Plan: ${carePlan.treatmentPlan || 'Not provided'}
Risk Factors: ${carePlan.riskFactors || 'Not provided'}
Personalized Notes: ${carePlan.personalizedNotes || 'Not provided'}
Escalation Thresholds: ${JSON.stringify(carePlan.escalationThresholdsJson) || 'Not provided'}`)
    } else {
      contextParts.push('PATIENT CARE PLAN: Not yet configured by doctor')
    }

    if (clinicPolicies.length > 0) {
      contextParts.push(`
CLINIC POLICIES:
${clinicPolicies.map((p) => `${p.title}: ${p.body}`).join('\n\n')}`)
    }

    const prompt = `${SYSTEM_PROMPT}

CONTEXT:
${contextParts.join('\n')}

PATIENT MESSAGE: ${userMessage}

Respond only with valid JSON matching the schema above. No other text.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response')
    }

    const parsed = JSON.parse(jsonMatch[0])
    const validated = AIResponseSchema.parse(parsed)
    return validated
  } catch (error) {
    console.error('[Gemini] Error calling API, falling back to mock:', error)
    return getMockResponse(userMessage, carePlan)
  }
}
