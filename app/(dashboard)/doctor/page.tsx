'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  AlertTriangle,
  CheckCircle,
  ClipboardList,
  User,
  Save,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Patient {
  id: string
  name: string
  email: string
  dob: string
  summary: string
  diagnosisSummary: string
  treatmentPlan: string
  riskFactors: string
  personalizedNotes: string
}

interface Escalation {
  id: string
  patient: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  reason: string
  date: string
  status: 'OPEN' | 'RESOLVED'
}

const FAKE_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'Maria Santos',
    email: 'patient@demo.com',
    dob: '1985-03-15',
    summary: 'Female, 40 years old. Hypertension and mild atrial fibrillation.',
    diagnosisSummary: 'Stage 2 hypertension (BP consistently >140/90 mmHg) and paroxysmal atrial fibrillation. ECG confirmed AFib episodes lasting 2–4 hours. No structural heart disease detected on echocardiogram.',
    treatmentPlan: '1. Lisinopril 10mg daily for blood pressure control\n2. Metoprolol 25mg twice daily for heart rate control\n3. Warfarin 5mg daily for stroke prevention (target INR 2.0–3.0)\n4. Low-sodium diet (<2g/day)\n5. 30 minutes moderate exercise 5x/week\n6. Weekly blood pressure monitoring at home\n7. Monthly INR checks\n8. Follow-up appointment in 3 months',
    riskFactors: 'Hypertension, AFib, Family history of stroke, Mild obesity (BMI 28)',
    personalizedNotes: 'Maria is a motivated patient who has made significant lifestyle changes. She works as a nurse, so medical terminology can be used. Emphasize the importance of INR monitoring compliance. Responds well to data-driven explanations.',
  },
  {
    id: '2',
    name: 'James Liu',
    email: 'jliu@demo.com',
    dob: '1972-07-22',
    summary: 'Male, 53 years old. Type 2 diabetes and chronic kidney disease stage 2.',
    diagnosisSummary: 'Type 2 diabetes mellitus with HbA1c of 8.1% at last check. Chronic kidney disease stage 2 (eGFR 68). No retinopathy detected at last ophthalmology visit.',
    treatmentPlan: '1. Metformin 1000mg twice daily with meals\n2. Empagliflozin 10mg daily\n3. Quarterly HbA1c testing\n4. Annual ophthalmology screening\n5. Low-carbohydrate, kidney-friendly diet\n6. Blood glucose monitoring twice daily\n7. Annual podiatry review',
    riskFactors: 'Type 2 diabetes, CKD Stage 2, Hypertension, BMI 31',
    personalizedNotes: 'James is a retired engineer and prefers detailed explanations. He tracks everything in a spreadsheet. Avoid dismissing his self-reported data — he is meticulous. Prefers early morning appointments.',
  },
  {
    id: '3',
    name: 'Linda Okafor',
    email: 'lokafor@demo.com',
    dob: '1990-11-03',
    summary: 'Female, 35 years old. Anxiety disorder and migraine with aura.',
    diagnosisSummary: 'Generalized anxiety disorder (GAD) with moderate severity. Migraine with aura — averaging 3–4 episodes per month. MRI unremarkable. No cardiac abnormalities.',
    treatmentPlan: '1. Sertraline 50mg daily\n2. Propranolol 40mg as needed for acute migraine\n3. CBT referral — 8-session course in progress\n4. Sleep hygiene protocol\n5. Migraine diary for trigger identification\n6. Avoid known triggers: caffeine, skipped meals, screen overuse',
    riskFactors: 'GAD, Migraine with aura, Insomnia, High-stress occupation',
    personalizedNotes: 'Linda is a high-performing teacher. She is anxious about medication dependency — reassure her about evidence base. Avoid clinical jargon. She prefers text summaries after appointments.',
  },
]

const FAKE_ESCALATIONS: Escalation[] = [
  {
    id: 'e1',
    patient: 'Maria Santos',
    riskLevel: 'medium',
    reason: 'Patient reported palpitations lasting 2 hours. Review Metoprolol dosing and recent INR levels.',
    date: 'Mar 10, 2026',
    status: 'OPEN',
  },
  {
    id: 'e2',
    patient: 'James Liu',
    riskLevel: 'high',
    reason: 'Patient reported fasting glucose of 310 mg/dL for 3 consecutive days. May require insulin initiation.',
    date: 'Mar 8, 2026',
    status: 'OPEN',
  },
  {
    id: 'e3',
    patient: 'Linda Okafor',
    riskLevel: 'low',
    reason: 'Patient requested refill guidance for Propranolol. Currently within prescription limits.',
    date: 'Mar 6, 2026',
    status: 'RESOLVED',
  },
]

const riskColor = (level: string) => {
  switch (level) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200'
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    default: return 'bg-green-100 text-green-800 border-green-200'
  }
}

export default function DoctorPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient>(FAKE_PATIENTS[0])
  const [escalations, setEscalations] = useState<Escalation[]>(FAKE_ESCALATIONS)
  const [formData, setFormData] = useState({
    diagnosisSummary: FAKE_PATIENTS[0].diagnosisSummary,
    treatmentPlan: FAKE_PATIENTS[0].treatmentPlan,
    riskFactors: FAKE_PATIENTS[0].riskFactors,
    personalizedNotes: FAKE_PATIENTS[0].personalizedNotes,
  })
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setFormData({
      diagnosisSummary: patient.diagnosisSummary,
      treatmentPlan: patient.treatmentPlan,
      riskFactors: patient.riskFactors,
      personalizedNotes: patient.personalizedNotes,
    })
    setSaveSuccess(false)
  }

  const handleSave = () => {
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2500)
  }

  const handleResolve = (id: string) => {
    setEscalations((prev) => prev.map((e) => e.id === id ? { ...e, status: 'RESOLVED' } : e))
  }

  const openEscalations = escalations.filter((e) => e.status === 'OPEN')

  return (
    <div className="flex h-full overflow-hidden">
      {/* Patient list sidebar */}
      <div className="w-64 border-r bg-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-800 text-sm">Patients</h2>
          <p className="text-xs text-gray-400 mt-0.5">Dr. Sarah Chen</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {FAKE_PATIENTS.map((patient) => (
            <button
              key={patient.id}
              onClick={() => handleSelectPatient(patient)}
              className={cn(
                'w-full text-left px-4 py-3.5 border-b hover:bg-slate-50 transition-colors flex items-center gap-3',
                selectedPatient.id === patient.id && 'bg-blue-50 border-l-2 border-l-blue-500'
              )}
            >
              <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-800 truncate">{patient.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">{patient.summary.split('.')[0]}</p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Doctor Workspace"
          subtitle="Dr. Sarah Chen · Cardiology"
          clinicName="Riverside Medical Clinic"
        />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: patient info */}
            <div className="lg:col-span-1 space-y-4">
              {/* Patient Info */}
              <Card className="rounded-2xl shadow-sm border-gray-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    Patient
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-semibold text-gray-800">{selectedPatient.name}</p>
                  <p className="text-xs text-gray-500">{selectedPatient.email}</p>
                  <p className="text-xs text-gray-500">DOB: {new Date(selectedPatient.dob).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-600 leading-relaxed mt-2 p-2 bg-slate-50 rounded-lg">
                    {selectedPatient.summary}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Care Plan Editor */}
            <div className="lg:col-span-2">
              <Card className="rounded-2xl shadow-sm border-gray-100">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-blue-600" />
                      Care Plan Editor
                      <span className="text-xs text-gray-400 font-normal">— {selectedPatient.name}</span>
                    </CardTitle>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      className="h-8 bg-blue-600 hover:bg-blue-700 text-xs"
                    >
                      {saveSuccess ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Saved!</>
                      ) : (
                        <><Save className="h-3 w-3 mr-1" /> Save Plan</>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Diagnosis Summary
                      </Label>
                      <Textarea
                        value={formData.diagnosisSummary}
                        onChange={(e) => setFormData((p) => ({ ...p, diagnosisSummary: e.target.value }))}
                        rows={3}
                        className="mt-1.5 rounded-xl border-gray-200 text-sm resize-none"
                        placeholder="Patient diagnosis and clinical findings..."
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Treatment Plan
                      </Label>
                      <Textarea
                        value={formData.treatmentPlan}
                        onChange={(e) => setFormData((p) => ({ ...p, treatmentPlan: e.target.value }))}
                        rows={7}
                        className="mt-1.5 rounded-xl border-gray-200 text-sm resize-none"
                        placeholder="1. Medication details&#10;2. Lifestyle modifications&#10;3. Follow-up schedule..."
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Risk Factors
                      </Label>
                      <Input
                        value={formData.riskFactors}
                        onChange={(e) => setFormData((p) => ({ ...p, riskFactors: e.target.value }))}
                        className="mt-1.5 rounded-xl border-gray-200 text-sm"
                        placeholder="Comma-separated: Hypertension, Diabetes, Family history..."
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Personalized Notes for AI
                      </Label>
                      <Textarea
                        value={formData.personalizedNotes}
                        onChange={(e) => setFormData((p) => ({ ...p, personalizedNotes: e.target.value }))}
                        rows={3}
                        className="mt-1.5 rounded-xl border-gray-200 text-sm resize-none"
                        placeholder="Communication preferences, language needs, specific concerns..."
                      />
                      <p className="text-xs text-gray-400 mt-1">These notes guide how the AI communicates with this patient.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
