'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertTriangle,
  CheckCircle,
  ClipboardList,
  User,
  Loader2,
  AlertCircle,
  Bot,
  Clock,
  RefreshCw,
  Building2,
  Users,
} from 'lucide-react'

interface Escalation {
  id: string
  riskLevel: string
  reason: string
  requiresDoctorReview: boolean
  requiresAdminFollowup: boolean
  emergencyAdvice: boolean
  status: string
  createdAt: string
  patient: {
    user: { name: string; email: string }
  }
  conversation: {
    messages: Array<{
      id: string
      content: string
      senderType: string
      createdAt: string
    }>
  }
}

interface ChecklistItem {
  id: string
  label: string
  description: string
  completed: boolean
}

const ONBOARDING_CHECKLIST: ChecklistItem[] = [
  {
    id: '1',
    label: 'Patient profile created',
    description: 'Basic demographics and contact information entered',
    completed: true,
  },
  {
    id: '2',
    label: 'Doctor assigned',
    description: 'Primary care physician linked to patient profile',
    completed: true,
  },
  {
    id: '3',
    label: 'Care plan uploaded',
    description: 'Initial care plan created by assigned doctor',
    completed: true,
  },
  {
    id: '4',
    label: 'Patient portal access',
    description: 'Patient login credentials sent and verified',
    completed: false,
  },
  {
    id: '5',
    label: 'Insurance verification',
    description: 'Insurance information verified and documented',
    completed: false,
  },
  {
    id: '6',
    label: 'First appointment scheduled',
    description: 'Initial follow-up appointment booked',
    completed: false,
  },
]

const AI_SUGGESTIONS = [
  {
    id: '1',
    title: 'Schedule INR check reminder',
    description: 'Patient Maria Santos is due for monthly INR monitoring. Recommend scheduling within the next 7 days.',
    priority: 'high',
    category: 'Clinical',
  },
  {
    id: '2',
    title: 'Follow-up call needed',
    description: 'Patient reported palpitations. Consider scheduling a check-in call within 48 hours per care plan protocol.',
    priority: 'medium',
    category: 'Patient Care',
  },
  {
    id: '3',
    title: 'Care plan review due',
    description: '3-month care plan review is due for Maria Santos. Coordinate with Dr. Chen to schedule appointment.',
    priority: 'low',
    category: 'Administrative',
  },
]

export default function AdminPage() {
  const { data: session } = useSession()
  const [escalations, setEscalations] = useState<Escalation[]>([])
  const [checklist, setChecklist] = useState<ChecklistItem[]>(ONBOARDING_CHECKLIST)
  const [isLoading, setIsLoading] = useState(true)
  const [dbError, setDbError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/escalations')
      if (!res.ok) {
        if (res.status === 500) {
          setDbError('Database not connected. Please set up the database.')
        }
        return
      }
      const data = await res.json()
      setEscalations(data.escalations || [])
    } catch {
      setDbError('Unable to connect. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResolveEscalation = async (escalationId: string) => {
    try {
      const res = await fetch('/api/escalations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escalationId, status: 'RESOLVED' }),
      })
      if (res.ok) {
        setEscalations((prev) =>
          prev.map((e) => (e.id === escalationId ? { ...e, status: 'RESOLVED' } : e))
        )
      }
    } catch {
      console.error('Failed to resolve escalation')
    }
  }

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    )
  }

  const openEscalations = escalations.filter((e) => e.status === 'OPEN')
  const completedItems = checklist.filter((i) => i.completed).length

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-200'
      case 'medium': return 'bg-amber-50 border-amber-200'
      default: return 'bg-blue-50 border-blue-200'
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Admin Dashboard"
        subtitle={`Welcome, ${session?.user?.name || 'Admin'}`}
        clinicName="Riverside Medical Clinic"
      />

      <div className="flex-1 overflow-y-auto p-6">
        {dbError && (
          <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">Connection Error</p>
              <p className="text-xs text-red-600 mt-0.5">{dbError}</p>
              <p className="text-xs text-red-500 mt-1">Run: <code className="bg-red-100 px-1 rounded">npx prisma db push && npx prisma db seed</code></p>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Open Escalations', value: openEscalations.length, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
            { label: 'Total Patients', value: 1, icon: Users, color: 'text-blue-600 bg-blue-50' },
            { label: 'Onboarding Items', value: `${completedItems}/${checklist.length}`, icon: ClipboardList, color: 'text-green-600 bg-green-50' },
            { label: 'AI Suggestions', value: AI_SUGGESTIONS.length, icon: Bot, color: 'text-indigo-600 bg-indigo-50' },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="rounded-2xl shadow-sm border-gray-100">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Intake Queue */}
          <Card className="rounded-2xl shadow-sm border-gray-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Intake Queue
                </CardTitle>
                <div className="flex items-center gap-2">
                  {openEscalations.length > 0 && (
                    <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                      {openEscalations.length} pending
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={loadData} className="h-7 text-xs">
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {openEscalations.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">All caught up!</p>
                  <p className="text-xs text-gray-400 mt-1">No pending escalations</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {openEscalations.slice(0, 5).map((esc) => (
                    <div key={esc.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-gray-400" />
                          <p className="text-sm font-semibold text-gray-800">
                            {esc.patient?.user?.name || 'Unknown'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${getRiskColor(esc.riskLevel)}`}>
                            {esc.riskLevel}
                          </span>
                          {esc.requiresAdminFollowup && (
                            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                              Admin needed
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-2.5 leading-relaxed">{esc.reason}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(esc.createdAt).toLocaleString()}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs rounded-lg border-green-200 text-green-700 hover:bg-green-50 px-3"
                          onClick={() => handleResolveEscalation(esc.id)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient Onboarding Checklist */}
          <Card className="rounded-2xl shadow-sm border-gray-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-blue-600" />
                  Onboarding Checklist
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{completedItems}/{checklist.length} complete</span>
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                    <div
                      className="h-1.5 bg-green-500 rounded-full transition-all"
                      style={{ width: `${(completedItems / checklist.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500">Maria Santos — New Patient</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {checklist.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-colors ${
                      item.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300'
                    }`}>
                      {item.completed && (
                        <CheckCircle className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-400">{item.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card className="rounded-2xl shadow-sm border-gray-100 lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Bot className="h-4 w-4 text-blue-600" />
                AI-Generated Suggestions
              </CardTitle>
              <p className="text-xs text-gray-500">Based on patient care plans and recent activity</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {AI_SUGGESTIONS.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className={`rounded-xl p-3.5 border ${getPriorityColor(suggestion.priority)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {suggestion.category}
                      </Badge>
                      <span className={`text-xs font-medium capitalize ${
                        suggestion.priority === 'high' ? 'text-red-600' :
                        suggestion.priority === 'medium' ? 'text-amber-600' : 'text-blue-600'
                      }`}>
                        {suggestion.priority} priority
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">
                      {suggestion.title}
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {suggestion.description}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-3 h-7 text-xs w-full border border-current"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Mark done
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
