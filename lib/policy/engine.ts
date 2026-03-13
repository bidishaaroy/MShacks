import { AIResponse } from '@/lib/validators/ai-response'

// Restricted drug request patterns
const RESTRICTED_DRUG_PATTERNS = [
  /prescribe/i,
  /controlled substance/i,
  /overdose/i,
  /illegal drug/i,
  /buy drugs/i,
  /get high/i,
  /opioid/i,
  /narcotic/i,
  /fentanyl/i,
  /heroin/i,
  /cocaine/i,
  /methamphetamine/i,
]

// Medication change patterns
const MEDICATION_CHANGE_PATTERNS = [
  /stop taking/i,
  /change my medication/i,
  /increase the dose/i,
  /decrease the dose/i,
  /double my dose/i,
  /skip my medication/i,
  /don't need the medication/i,
  /quit the medication/i,
]

// Emergency red flags
const EMERGENCY_PATTERNS = [
  /chest pain/i,
  /difficulty breathing/i,
  /can't breathe/i,
  /loss of consciousness/i,
  /passed out/i,
  /severe allergic reaction/i,
  /anaphylaxis/i,
  /stroke/i,
  /heart attack/i,
  /suicidal/i,
  /self.?harm/i,
  /kill myself/i,
  /end my life/i,
  /unconscious/i,
  /seizure/i,
  /severe bleeding/i,
  /coughing blood/i,
]

// Illegal or unsafe content
const ILLEGAL_UNSAFE_PATTERNS = [
  /how to make/i,
  /synthesize drugs/i,
  /abuse medication/i,
  /fake prescription/i,
  /forge/i,
  /doctor shopping/i,
]

// Self-harm patterns
const SELF_HARM_PATTERNS = [
  /self.?harm/i,
  /hurt myself/i,
  /cut myself/i,
  /suicidal/i,
  /kill myself/i,
  /end my life/i,
  /don't want to live/i,
  /want to die/i,
]

export function detectRestrictedDrugRequest(text: string): boolean {
  return RESTRICTED_DRUG_PATTERNS.some((pattern) => pattern.test(text))
}

export function detectMedicationChangeRequest(text: string): boolean {
  return MEDICATION_CHANGE_PATTERNS.some((pattern) => pattern.test(text))
}

export function detectEmergencyRedFlags(text: string): boolean {
  return EMERGENCY_PATTERNS.some((pattern) => pattern.test(text))
}

export function detectIllegalOrUnsafeContent(text: string): boolean {
  return (
    ILLEGAL_UNSAFE_PATTERNS.some((pattern) => pattern.test(text)) ||
    SELF_HARM_PATTERNS.some((pattern) => pattern.test(text))
  )
}

export function detectSelfHarm(text: string): boolean {
  return SELF_HARM_PATTERNS.some((pattern) => pattern.test(text))
}

interface CarePlanContext {
  treatmentPlan?: string
  diagnosisSummary?: string
  riskFactors?: string
}

interface ClinicPolicy {
  title: string
  body: string
  category: string
}

export function enforceDoctorBoundaries(
  aiResponse: AIResponse,
  carePlan: CarePlanContext | null
): AIResponse {
  // Never allow AI to recommend specific medication changes unless in care plan
  if (
    aiResponse.message_for_user.match(
      /take more|take less|stop taking|increase.*dose|decrease.*dose/i
    )
  ) {
    if (!carePlan) {
      return {
        ...aiResponse,
        message_for_user:
          'I cannot recommend medication changes. Please consult your doctor directly for any medication-related decisions.',
        intent: 'refusal',
        risk_level: 'medium',
        requires_doctor_review: true,
        refusal_reason: 'Medication change request outside of care plan scope',
      }
    }
  }

  return aiResponse
}

export function shouldEscalate(aiResponse: AIResponse): boolean {
  return (
    aiResponse.risk_level === 'high' ||
    aiResponse.risk_level === 'critical' ||
    aiResponse.requires_doctor_review ||
    aiResponse.requires_admin_followup ||
    aiResponse.emergency_advice
  )
}

export type ValidationResult =
  | { outcome: 'approved'; response: AIResponse }
  | { outcome: 'downgraded'; response: AIResponse; reason: string }
  | { outcome: 'refusal'; response: AIResponse; reason: string }

export function validateAIResponse(
  aiDraft: AIResponse,
  userMessage: string,
  carePlan: CarePlanContext | null,
  _clinicPolicies: ClinicPolicy[]
): ValidationResult {
  // Check for self-harm content
  if (detectSelfHarm(userMessage)) {
    const refusalResponse: AIResponse = {
      message_for_user:
        '🆘 I\'m concerned about your safety. If you\'re having thoughts of self-harm or suicide, please reach out for help immediately:\n\n**Crisis Resources:**\n• National Suicide Prevention Lifeline: **988** (call or text)\n• Crisis Text Line: Text HOME to **741741**\n• Emergency Services: **911**\n\nPlease talk to someone right now. You are not alone, and help is available.',
      intent: 'escalation',
      risk_level: 'critical',
      used_sources: ['Emergency Protocol'],
      requires_doctor_review: true,
      requires_admin_followup: true,
      emergency_advice: true,
      refusal_reason: 'Self-harm content detected - emergency resources provided',
      next_actions: [
        'Call 988 immediately',
        'Contact emergency services if in immediate danger',
        'Clinic will be notified',
      ],
    }
    return {
      outcome: 'refusal',
      response: refusalResponse,
      reason: 'Self-harm content detected',
    }
  }

  // Check for illegal/unsafe content
  if (detectIllegalOrUnsafeContent(userMessage)) {
    const refusalResponse: AIResponse = {
      message_for_user:
        'I\'m not able to assist with that request. I\'m here to provide support based on your care plan and clinic guidelines. If you have medical concerns, please contact your healthcare team directly.',
      intent: 'refusal',
      risk_level: 'high',
      used_sources: [],
      requires_doctor_review: true,
      requires_admin_followup: false,
      emergency_advice: false,
      refusal_reason: 'Illegal or unsafe content detected',
      next_actions: ['Contact your doctor or healthcare team directly'],
    }
    return {
      outcome: 'refusal',
      response: refusalResponse,
      reason: 'Illegal or unsafe content',
    }
  }

  // Check for restricted drug requests
  if (detectRestrictedDrugRequest(userMessage)) {
    const refusalResponse: AIResponse = {
      message_for_user:
        'I\'m not able to provide information about controlled substances, prescriptions, or drug acquisition. For medication questions, please speak directly with Dr. ' +
        'Chen or contact your clinic. If this is a medical emergency, call 911.',
      intent: 'refusal',
      risk_level: 'high',
      used_sources: ['Clinic Policy - Medication Guidelines'],
      requires_doctor_review: true,
      requires_admin_followup: false,
      emergency_advice: false,
      refusal_reason: 'Restricted drug/substance request',
      next_actions: [
        'Contact your doctor directly',
        'Call emergency services if needed',
      ],
    }
    return {
      outcome: 'refusal',
      response: refusalResponse,
      reason: 'Restricted drug request',
    }
  }

  // Check for emergency red flags
  if (detectEmergencyRedFlags(userMessage)) {
    const emergencyResponse: AIResponse = {
      ...aiDraft,
      message_for_user:
        '🚨 **This sounds like a potential emergency.**\n\nIf you are experiencing severe symptoms such as chest pain, difficulty breathing, loss of consciousness, or signs of a stroke, **call 911 or go to the nearest emergency room immediately.**\n\nDo not wait for a response from this system.\n\n' +
        aiDraft.message_for_user,
      intent: 'escalation',
      risk_level: 'critical',
      requires_doctor_review: true,
      emergency_advice: true,
      next_actions: [
        'Call 911 if experiencing emergency symptoms',
        'Go to nearest emergency room',
        'Do not drive yourself',
        ...aiDraft.next_actions,
      ],
    }
    return {
      outcome: 'downgraded',
      response: emergencyResponse,
      reason: 'Emergency red flags detected - added emergency guidance',
    }
  }

  // Apply doctor boundary enforcement
  const boundaryChecked = enforceDoctorBoundaries(aiDraft, carePlan)
  if (boundaryChecked.intent === 'refusal') {
    return {
      outcome: 'refusal',
      response: boundaryChecked,
      reason: boundaryChecked.refusal_reason || 'Doctor boundary violation',
    }
  }

  // Check for unsupported medication change requests (without care plan)
  if (detectMedicationChangeRequest(userMessage) && !carePlan) {
    return {
      outcome: 'downgraded',
      response: {
        ...aiDraft,
        message_for_user:
          'I\'m unable to make medication recommendations without access to your care plan. Please contact your doctor directly for any medication-related questions.',
        intent: 'refusal',
        risk_level: 'medium',
        requires_doctor_review: true,
        refusal_reason: 'No care plan available for medication guidance',
      },
      reason: 'Medication change request without care plan',
    }
  }

  return { outcome: 'approved', response: aiDraft }
}
