'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { AlertCircle, Calendar, ChevronRight, Bot, User, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface FakeMessage {
  id: string
  role: 'patient' | 'ai'
  content: string
  time: string
}

interface FakeVisit {
  id: string
  date: string
  reason: string
  doctor: string
  status: 'completed' | 'upcoming'
  messages: FakeMessage[]
}

const FAKE_VISITS: FakeVisit[] = [
  {
    id: '1',
    date: 'Mar 10, 2026',
    reason: 'Medication check-in — dizziness & palpitations',
    doctor: 'Dr. Sarah Chen',
    status: 'completed',
    messages: [
      { id: 'm1', role: 'patient', content: "Hi, I've been feeling some mild dizziness this morning after taking my medications. Is this normal?", time: '9:02 AM' },
      { id: 'm2', role: 'ai', content: "Hello Maria! Mild dizziness can sometimes occur with Lisinopril, especially early in treatment. This is usually related to a slight drop in blood pressure.\n\nTry these steps:\n• Check your blood pressure using your home monitor\n• Stay hydrated and avoid standing up too quickly\n• If mild and resolving within a few hours, this is likely manageable\n\nContact Dr. Chen if dizziness is severe, you feel faint, or BP is below 90/60 mmHg.", time: '9:02 AM' },
      { id: 'm3', role: 'patient', content: "My BP is 128/84. Heart rate is 72. The dizziness is better now. I also had palpitations last night for about 2 hours.", time: '9:15 AM' },
      { id: 'm4', role: 'ai', content: "Your BP of 128/84 and heart rate of 72 look good. Regarding the 2-hour palpitations — this is at the monitoring threshold in your care plan. I've flagged this for Dr. Chen's review. She may want to assess your Metoprolol dosing and recent INR levels.\n\nPlease log the time, duration, and intensity of any future palpitations.", time: '9:15 AM' },
      { id: 'm5', role: 'patient', content: "Can I take ibuprofen for a headache? I know I'm on warfarin.", time: '9:22 AM' },
      { id: 'm6', role: 'ai', content: "⚠️ Avoid ibuprofen while on Warfarin — it significantly increases bleeding risk and can interfere with your INR levels.\n\nSafe alternative: Acetaminophen (Tylenol) up to 500mg is generally safe with Warfarin in normal doses.\n\nAlways consult Dr. Chen or your pharmacist before taking any new over-the-counter medications.", time: '9:22 AM' },
    ],
  },
  {
    id: '2',
    date: 'Feb 18, 2026',
    reason: 'INR follow-up — warfarin adjustment',
    doctor: 'Dr. Sarah Chen',
    status: 'completed',
    messages: [
      { id: 'm1', role: 'patient', content: "I got my INR result back — it's 3.6. Is that too high?", time: '2:10 PM' },
      { id: 'm2', role: 'ai', content: "An INR of 3.6 is above your target range of 2.0–3.0 as set by Dr. Chen. This means your blood is slightly thinner than intended, which increases bleeding risk.\n\nThis is not an emergency, but Dr. Chen should be notified today to possibly adjust your Warfarin dose. Please avoid activities with a high risk of injury and watch for unusual bruising or bleeding.", time: '2:10 PM' },
      { id: 'm3', role: 'patient', content: "Should I skip my dose tonight?", time: '2:14 PM' },
      { id: 'm4', role: 'ai', content: "I'm not able to advise on skipping or changing your Warfarin dose — that decision must come from Dr. Chen directly. Please call the clinic now so they can provide specific guidance based on your full health picture.\n\nClinic phone: (555) 247-0198", time: '2:14 PM' },
    ],
  },
  {
    id: '3',
    date: 'Jan 30, 2026',
    reason: 'New symptom — ankle swelling',
    doctor: 'Dr. Sarah Chen',
    status: 'completed',
    messages: [
      { id: 'm1', role: 'patient', content: "I've noticed my ankles are swelling by the end of the day. Should I be worried?", time: '11:05 AM' },
      { id: 'm2', role: 'ai', content: "Ankle swelling (edema) can occur for several reasons and is worth monitoring. Given your history of hypertension and AFib, Dr. Chen should be made aware of this.\n\nSome possible causes include:\n• Side effects from Lisinopril or Metoprolol\n• Fluid retention related to cardiac function\n• Prolonged sitting or standing\n\nI've flagged this for Dr. Chen's review. In the meantime, try elevating your legs when resting. If swelling is sudden, severe, or in one leg only, seek care immediately.", time: '11:05 AM' },
      { id: 'm3', role: 'patient', content: "It's both ankles, been happening for about a week. No pain.", time: '11:08 AM' },
      { id: 'm4', role: 'ai', content: "Bilateral ankle swelling without pain for a week is something Dr. Chen should assess at your next visit or sooner. I've updated the flag with this detail. She may want to adjust your medications or order additional tests.\n\nIf you develop shortness of breath, chest discomfort, or the swelling worsens significantly — please seek immediate medical attention.", time: '11:08 AM' },
    ],
  },
  {
    id: '4',
    date: 'Mar 20, 2026',
    reason: 'Routine 3-month follow-up',
    doctor: 'Dr. Sarah Chen',
    status: 'upcoming',
    messages: [],
  },
]

export default function PatientPage() {
  const [selectedVisit, setSelectedVisit] = useState<FakeVisit>(FAKE_VISITS[0])
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState<FakeMessage[]>(FAKE_VISITS[0].messages)

  const handleSelectVisit = (visit: FakeVisit) => {
    setSelectedVisit(visit)
    setMessages(visit.messages)
  }

  const handleSend = () => {
    if (!newMessage.trim()) return
    const userMsg: FakeMessage = {
      id: `new-${Date.now()}`,
      role: 'patient',
      content: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    const aiReply: FakeMessage = {
      id: `ai-${Date.now()}`,
      role: 'ai',
      content: "Thank you for your message. Based on your care plan from Dr. Chen, I'll flag this for her review. If this is urgent, please contact the clinic directly at (555) 247-0198.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, userMsg, aiReply])
    setNewMessage('')
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Visits sidebar */}
      <div className="w-72 border-r bg-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-800 text-sm">My Visits</h2>
          <p className="text-xs text-gray-400 mt-0.5">Maria Santos</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {FAKE_VISITS.map((visit) => (
            <button
              key={visit.id}
              onClick={() => handleSelectVisit(visit)}
              className={cn(
                'w-full text-left px-4 py-3.5 border-b hover:bg-slate-50 transition-colors flex items-start gap-3',
                selectedVisit.id === visit.id && 'bg-blue-50 border-l-2 border-l-blue-500'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
                visit.status === 'upcoming' ? 'bg-amber-100' : 'bg-blue-100'
              )}>
                <Calendar className={cn('h-4 w-4', visit.status === 'upcoming' ? 'text-amber-600' : 'text-blue-600')} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-700">{visit.date}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">{visit.reason}</p>
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-[10px] px-1.5 py-0 mt-1.5',
                    visit.status === 'upcoming'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-green-50 text-green-700'
                  )}
                >
                  {visit.status}
                </Badge>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-300 flex-shrink-0 mt-1" />
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={selectedVisit.reason}
          subtitle={`${selectedVisit.date} · ${selectedVisit.doctor}`}
          clinicName="Riverside Medical Clinic"
        />

        {/* Disclaimer */}
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              <strong>Safety reminder:</strong> ClinAI Bridge is a support tool, not a replacement for medical care. For emergencies, call 911.
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {selectedVisit.status === 'upcoming' ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
              <p className="font-semibold text-gray-700 mb-1">Upcoming Visit</p>
              <p className="text-sm text-gray-500 max-w-xs">
                This appointment hasn't happened yet. You can send a message to Dr. Chen's team below.
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                <Bot className="h-8 w-8 text-blue-400" />
              </div>
              <p className="text-sm text-gray-500">No messages for this visit.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={cn('flex gap-3', msg.role === 'patient' ? 'flex-row-reverse' : 'flex-row')}>
                <div className={cn(
                  'w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-1',
                  msg.role === 'ai' ? 'bg-blue-100' : 'bg-green-100'
                )}>
                  {msg.role === 'ai'
                    ? <Bot className="h-3.5 w-3.5 text-blue-600" />
                    : <User className="h-3.5 w-3.5 text-green-600" />
                  }
                </div>
                <div className={cn('max-w-[70%]', msg.role === 'patient' ? 'items-end' : 'items-start', 'flex flex-col')}>
                  <div className={cn(
                    'rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line',
                    msg.role === 'ai'
                      ? 'bg-white border border-gray-100 shadow-sm text-gray-800'
                      : 'bg-blue-600 text-white'
                  )}>
                    {msg.content}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Composer */}
        <div className="border-t bg-white p-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your care plan, symptoms, medications..."
              className="flex-1 bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
