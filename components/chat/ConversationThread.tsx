'use client'

import { useEffect, useRef } from 'react'
import { MessageBubble, MessageSender } from './MessageBubble'
import { Bot, MessageSquare } from 'lucide-react'

export interface Message {
  id: string
  senderType: MessageSender
  senderId?: string | null
  content: string
  riskLevel?: string | null
  createdAt: Date | string
}

interface ConversationThreadProps {
  messages: Message[]
  isLoading?: boolean
  currentUserId?: string
}

export function ConversationThread({
  messages,
  isLoading = false,
  currentUserId,
}: ConversationThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
          <Bot className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Start a conversation
        </h3>
        <p className="text-gray-500 max-w-sm text-sm">
          Ask ClinAI Bridge about your care plan, medications, symptoms, or appointment scheduling. I&apos;m here to help based on your doctor&apos;s guidance.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-2 w-full max-w-sm">
          {[
            'What does my care plan say?',
            'I\'m feeling some side effects',
            'When is my next appointment?',
          ].map((suggestion) => (
            <button
              key={suggestion}
              className="text-sm text-left px-4 py-2.5 rounded-xl border border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5 inline mr-2" />
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          content={message.content}
          senderType={message.senderType}
          timestamp={message.createdAt}
          riskLevel={message.riskLevel}
        />
      ))}

      {isLoading && (
        <MessageBubble
          content=""
          senderType="AI"
          senderName="ClinAI"
          isLoading={true}
        />
      )}

      <div ref={bottomRef} />
    </div>
  )
}
