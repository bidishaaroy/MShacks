'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Mic, ImagePlus, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ComposerProps {
  onSend: (message: string) => void
  onUpload?: (file: File) => void
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
}

export function Composer({
  onSend,
  onUpload,
  isLoading = false,
  disabled = false,
  placeholder = 'Type your message...',
}: ComposerProps) {
  const [message, setMessage] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    const trimmed = message.trim()
    if (!trimmed && !pendingFile) return
    if (isLoading || disabled) return

    if (pendingFile && onUpload) {
      onUpload(pendingFile)
      setPendingFile(null)
    }

    if (trimmed) {
      onSend(trimmed)
      setMessage('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPendingFile(file)
    }
  }

  return (
    <div className="border-t bg-white p-4">
      {/* File preview */}
      {pendingFile && (
        <div className="mb-2 flex items-center gap-2 text-sm text-gray-600 bg-blue-50 rounded-xl px-3 py-2">
          <ImagePlus className="h-4 w-4 text-blue-500" />
          <span className="flex-1 truncate">{pendingFile.name}</span>
          <button
            onClick={() => setPendingFile(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Image upload button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-gray-400 hover:text-blue-600 flex-shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || disabled}
          title="Attach image"
        >
          <ImagePlus className="h-5 w-5" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,audio/*,.pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Mic button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-gray-400 hover:text-blue-600 flex-shrink-0"
          disabled={isLoading || disabled}
          title="Voice message (coming soon)"
        >
          <Mic className="h-5 w-5" />
        </Button>

        {/* Text input */}
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading || disabled}
          rows={1}
          className={cn(
            'flex-1 min-h-[40px] max-h-[120px] resize-none rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400',
            'py-2.5 px-3 text-sm'
          )}
          style={{ fieldSizing: 'content' } as React.CSSProperties}
        />

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={(!message.trim() && !pendingFile) || isLoading || disabled}
          className="h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-700 flex-shrink-0"
          size="icon"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      <p className="text-xs text-gray-400 mt-2 text-center">
        ClinAI Bridge is a support assistant. For emergencies, call 911 immediately.
      </p>
    </div>
  )
}
