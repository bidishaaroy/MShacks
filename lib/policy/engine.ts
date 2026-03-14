import type { AIResponseDraft } from "@/lib/validators/ai";
import type { CarePlan, ClinicPolicy, Role, RiskLevel } from "@/lib/types";

export function detectControlledDrugRequest(message: string) {
  return /class a|controlled substance|opioid|opiate|narcotic|adderall|xanax|oxy|oxycodone|hydrocodone|fentanyl|morphine|codeine|sedative/i.test(
    message
  );
}

export function detectDrugSeekingLanguage(message: string) {
  return /stronger drug|best painkiller|how can i get|where can i buy|hook me up|something stronger|need narcotics/i.test(
    message
  );
}

export function detectMedicationChangeRequest(message: string) {
  return /change my medication|increase dose|double dose|stop taking|switch meds|new prescription/i.test(
    message
  );
}

export function detectEmergencyRedFlags(message: string, carePlan: CarePlan) {
  const knownRedFlags = carePlan.escalationThresholdsJson.redFlags.join(" ");
  return new RegExp(`(${knownRedFlags}|can't breathe|cannot breathe|severe chest pain|passed out|fainted)`, "i").test(
    message
  );
}

export function detectIllegalOrUnsafeContent(message: string) {
  return /self harm|suicide|overdose|weapon|harm someone|illegal/i.test(message);
}

export function detectUnsafeMedicalScope(message: string) {
  return /diagnose|what disease do i have|tell me what this is|is this definitely|guarantee/i.test(message);
}

export function enforceDoctorBoundaries(draft: AIResponseDraft, carePlan: CarePlan) {
  if (
    /diagnose|you have|definitely/i.test(draft.message_for_user) &&
    !carePlan.personalizedNotes.toLowerCase().includes("diagn")
  ) {
    return {
      ...draft,
      intent: "refusal" as const,
      message_for_user:
        "I can explain your existing care plan, but I can’t provide a diagnosis. I’ve flagged this for clinic review if you need a clinician response.",
      requires_doctor_review: true,
      refusal_reason: "The assistant cannot provide definitive diagnosis.",
      suggested_follow_up: "Contact the clinic if you need clinician review."
    };
  }

  return draft;
}

export function shouldEscalate(draft: AIResponseDraft) {
  return (
    draft.requires_doctor_review ||
    draft.requires_admin_followup ||
    draft.emergency_advice ||
    draft.risk_level === "high" ||
    draft.risk_level === "critical"
  );
}

export function runPolicyEngine(params: {
  role: Role;
  message: string;
  carePlan: CarePlan;
  policies: ClinicPolicy[];
  draft: AIResponseDraft;
}) {
  const { message, carePlan } = params;
  const lowerRisk = (risk: AIResponseDraft["risk_level"]): RiskLevel =>
    risk.toUpperCase() as RiskLevel;

  if (detectIllegalOrUnsafeContent(message) || detectControlledDrugRequest(message) || detectDrugSeekingLanguage(message)) {
    return {
      approved: {
        ...params.draft,
        message_for_user:
          "I can’t help with illegal, unsafe, overdose, weapon, controlled-drug, or narcotic requests. Please contact the clinic directly if you need safe follow-up.",
        intent: "refusal" as const,
        risk_level: "critical" as const,
        requires_doctor_review: true,
        requires_admin_followup: true,
        emergency_advice: false,
        refusal_reason: "Unsafe, illegal, or controlled-drug request.",
        suggested_follow_up: "Request clinic follow-up."
      },
      escalation: {
        riskLevel: "CRITICAL" as RiskLevel,
        reason: "Unsafe, illegal, or controlled-drug request detected.",
        requiresDoctorReview: true,
        requiresAdminFollowup: true,
        emergencyAdvice: false
      }
    };
  }

  if (detectEmergencyRedFlags(message, carePlan)) {
    return {
      approved: {
        ...params.draft,
        message_for_user:
          "Your message includes red-flag symptoms. ClinAI Bridge cannot assess emergencies. Please call local emergency services or go to urgent care immediately, and notify your clinic.",
        intent: "escalation" as const,
        risk_level: "critical" as const,
        requires_doctor_review: true,
        requires_admin_followup: true,
        emergency_advice: true,
        refusal_reason: "Emergency symptoms require urgent human review.",
        suggested_follow_up: "Call local emergency services or urgent care now."
      },
      escalation: {
        riskLevel: "CRITICAL" as RiskLevel,
        reason: "Emergency red flags detected.",
        requiresDoctorReview: true,
        requiresAdminFollowup: true,
        emergencyAdvice: true
      }
    };
  }

  if (detectMedicationChangeRequest(message)) {
    return {
      approved: {
        ...params.draft,
        message_for_user:
          "I can explain doctor-authored instructions already in your care plan, but I can’t change medications or dosing. I’ve sent this for doctor review.",
        intent: "refusal" as const,
        risk_level: "high" as const,
        requires_doctor_review: true,
        requires_admin_followup: true,
        emergency_advice: false,
        refusal_reason: "Medication changes outside explicit doctor instructions are not allowed.",
        suggested_follow_up: "Ask the clinic for doctor review."
      },
      escalation: {
        riskLevel: "HIGH" as RiskLevel,
        reason: "Medication change request outside doctor instruction.",
        requiresDoctorReview: true,
        requiresAdminFollowup: true,
        emergencyAdvice: false
      }
    };
  }

  if (detectUnsafeMedicalScope(message)) {
    return {
      approved: {
        ...params.draft,
        message_for_user:
          "I can help explain your care plan and what symptoms to monitor, but I can’t diagnose what is causing them. If you want clinical interpretation, please contact the clinic.",
        intent: "refusal" as const,
        risk_level: "medium" as const,
        requires_doctor_review: false,
        requires_admin_followup: true,
        emergency_advice: false,
        refusal_reason: "Request is outside safe non-diagnostic scope.",
        suggested_follow_up: "Request clinic follow-up if you need medical interpretation."
      },
      escalation: null
    };
  }

  const boundedDraft = enforceDoctorBoundaries(params.draft, carePlan);

  return {
    approved: boundedDraft,
    escalation: shouldEscalate(boundedDraft)
      ? {
          riskLevel: lowerRisk(boundedDraft.risk_level),
          reason: boundedDraft.refusal_reason ?? "Policy engine triggered escalation.",
          requiresDoctorReview: boundedDraft.requires_doctor_review,
          requiresAdminFollowup: boundedDraft.requires_admin_followup,
          emergencyAdvice: boundedDraft.emergency_advice
        }
      : null
  };
}
