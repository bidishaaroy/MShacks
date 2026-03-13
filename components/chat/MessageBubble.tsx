'use client'

import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AlertTriangle, Bot, User, Stethoscope, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export type MessageSender = 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'AI'

export interface MessageBubbleProps {
  content: string
  senderType: MessageSender
  senderName?: string
  timestamp?: Date | string
  riskLevel?: string | null
  isLoading?: boolean
}

function getSenderConfig(senderType: MessageSender) {
  switch (senderType) {
    case 'AI':
      return {
        label: 'ClinAI',
        icon: Bot,
        bubbleClass: 'bg-blue-50 border border-blue-100',
        textClass: 'text-gray-800',
        badgeClass: 'bg-blue-100 text-blue-800',
        avatarClass: 'bg-blue-600',
        align: 'left' as const,
      }
    case 'DOCTOR':
      return {
        label: 'Doctor',
        icon: Stethoscope,
        bubbleClass: 'bg-indigo-50 border border-indigo-100',
        textClass: 'text-gray-800',
        badgeClass: 'bg-indigo-100 text-indigo-800',
        avatarClass: 'bg-indigo-600',
        align: 'left' as const,
      }
    case 'ADMIN':
      return {
        label: 'Admin',
        icon: Shield,
        bubbleClass: 'bg-amber-50 border border-amber-100',
        textClass: 'text-gray-800',
        badgeClass: 'bg-amber-100 text-amber-800',
        avatarClass: 'bg-amber-600',
        align: 'left' as const,
      }
    case 'PATIENT':
    default:
      return {
        label: 'You',
        icon: User,
        bubbleClass: 'bg-white border border-gray-200',
        textClass: 'text-gray-800',
        badgeClass: 'bg-green-100 text-green-800',
        avatarClass: 'bg-green-600',
        align: 'right' as const,
      }
  }
}

function getRiskBadge(riskLevel: string) {
  switch (riskLevel) {
    case 'critical':
      return { label: 'Critical', className: 'bg-red-100 text-red-800 border-red-200' }
    case 'high':
      return { label: 'High Risk', className: 'bg-orange-100 text-orange-800 border-orange-200' }
    case 'medium':
      return { label: 'Medium Risk', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
    case 'low':
      return { label: 'Low Risk', className: 'bg-green-100 text-green-800 border-green-200' }
    default:
      return null
  }
}

function formatContent(content: string): string[] {
  return content.split('\n').filter(Boolean)
}

export function MessageBubble({
  content,
  senderType,
  senderName,
  timestamp,
  riskLevel,
  isLoading = false,
}: MessageBubbleProps) {
  const config = getSenderConfig(senderType)
  const Icon = config.icon
  const isRight = config.align === 'right'
  const riskBadge = riskLevel ? getRiskBadge(riskLevel) : null
  const lines = formatContent(content)

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div className={cn('flex gap-3 mb-4', isRight && 'flex-row-reverse')}>
      {/* Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
        <AvatarFallback className={cn('text-white text-xs', config.avatarClass)}>
          <Icon className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className={cn('flex flex-col gap-1 max-w-[75%]', isRight && 'items-end')}>
        {/* Sender label */}
        <div className={cn('flex items-center gap-2', isRight && 'flex-row-reverse')}>
          <span className="text-xs font-medium text-gray-500">
            {senderName || config.label}
          </span>
          {riskBadge && (
            <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border', riskBadge.className)}>
              <AlertTriangle className="h-3 w-3" />
              {riskBadge.label}
            </span>
          )}
        </div>

        {/* Bubble */}
        <div className={cn('rounded-2xl px-4 py-3 shadow-sm', config.bubbleClass, isRight && 'rounded-tr-sm', !isRight && 'rounded-tl-sm')}>
          {isLoading ? (
            <div className="flex items-center gap-1 py-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
            </div>
          ) : (
            <div className="text-sm leading-relaxed space-y-1">
              {lines.map((line, i) => {
                // Handle bold markers
                const parts = line.split(/\*\*(.*?)\*\*/g)
                return (
                  <p key={i}>
                    {parts.map((part, j) =>
                      j % 2 === 1 ? (
                        <strong key={j} className="font-semibold">
                          {part}
                        </strong>
                      ) : (
                        part
                      )
                    )}
                  </p>
                )
              })}
            </div>
          )}
        </div>

        {/* Timestamp */}
        {formattedTime && (
          <span className="text-xs text-gray-400">{formattedTime}</span>
        )}
      </div>
    </div>
  )
}
