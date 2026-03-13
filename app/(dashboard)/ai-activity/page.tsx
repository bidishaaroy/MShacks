'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Shield,
  TrendingUp,
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
  resolvedAt: string | null
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

export default function AIActivityPage() {
  const [escalations, setEscalations] = useState<Escalation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dbError, setDbError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | 'open' | 'resolved'>('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/escalations')
      if (!res.ok) {
        if (res.status === 500) setDbError('Database not connected.')
        return
      }
      const data = await res.json()
      setEscalations(data.escalations || [])
    } catch {
      setDbError('Unable to connect.')
    } finally {
      setIsLoading(false)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const filtered = escalations.filter((e) => {
    if (activeFilter === 'open') return e.status === 'OPEN'
    if (activeFilter === 'resolved') return e.status === 'RESOLVED'
    return true
  })

  const stats = {
    total: escalations.length,
    open: escalations.filter((e) => e.status === 'OPEN').length,
    critical: escalations.filter((e) => e.riskLevel === 'critical').length,
    resolved: escalations.filter((e) => e.status === 'RESOLVED').length,
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
        title="AI Activity Log"
        subtitle="Monitor AI interactions, risk levels, and escalations"
        clinicName="Riverside Medical Clinic"
      />

      <div className="flex-1 overflow-y-auto p-6">
        {dbError && (
          <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">Connection Error</p>
              <p className="text-xs text-red-600 mt-0.5">{dbError}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Escalations', value: stats.total, icon: Activity, color: 'text-blue-600 bg-blue-50' },
            { label: 'Open', value: stats.open, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
            { label: 'Critical Risk', value: stats.critical, icon: AlertCircle, color: 'text-red-600 bg-red-50' },
            { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="rounded-2xl shadow-sm border-gray-100">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <Icon className="h-4 w-4" />
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

        {/* Policy Engine Info Card */}
        <Card className="rounded-2xl shadow-sm border-gray-100 mb-6">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">Policy Engine Active</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  All AI responses are validated by the ClinAI Bridge policy engine before reaching patients.
                  The engine enforces: no diagnoses, no prescriptions, emergency escalation, drug request refusal, and self-harm protocols.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Emergency Detection', 'Drug Refusal', 'Self-Harm Protocol', 'Doctor Boundaries', 'Escalation Logic'].map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Escalation Records */}
        <Card className="rounded-2xl shadow-sm border-gray-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Bot className="h-4 w-4 text-blue-600" />
                AI Interaction Records
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                  {(['all', 'open', 'resolved'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${
                        activeFilter === f
                          ? 'bg-white text-gray-800 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <Button variant="ghost" size="sm" onClick={loadData} className="h-8 text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No records found</p>
                {dbError ? (
                  <p className="text-xs text-gray-400 mt-1">Connect database to see records</p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1">AI interactions will appear here</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((esc) => (
                  <div key={esc.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-800">
                            {esc.patient?.user?.name || 'Unknown Patient'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${getRiskColor(esc.riskLevel)}`}>
                            {esc.riskLevel} risk
                          </span>
                          {esc.requiresDoctorReview && (
                            <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                              Doctor review
                            </Badge>
                          )}
                          {esc.emergencyAdvice && (
                            <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                              Emergency advice
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className={`text-xs ${esc.status === 'OPEN' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}`}
                          >
                            {esc.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                          <Clock className="h-3 w-3" />
                          {new Date(esc.createdAt).toLocaleDateString()}
                        </p>
                        {esc.resolvedAt && (
                          <p className="text-xs text-green-600 mt-0.5">
                            Resolved {new Date(esc.resolvedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-2.5">
                      {esc.reason}
                    </p>

                    {esc.conversation?.messages?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-500 mb-2">Related messages:</p>
                        <div className="space-y-1.5">
                          {esc.conversation.messages.slice(0, 2).map((msg) => (
                            <div key={msg.id} className="flex items-start gap-2">
                              <Badge
                                variant="outline"
                                className={`text-xs flex-shrink-0 ${
                                  msg.senderType === 'AI'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-green-50 text-green-700 border-green-200'
                                }`}
                              >
                                {msg.senderType}
                              </Badge>
                              <p className="text-xs text-gray-600 line-clamp-1">{msg.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
