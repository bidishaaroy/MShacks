'use client'

import { useSession } from 'next-auth/react'
import { Badge } from '@/components/ui/badge'
import { Bell, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title?: string
  subtitle?: string
  clinicName?: string
}

const roleBadgeConfig: Record<string, { label: string; className: string }> = {
  DOCTOR: { label: 'Doctor', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  ADMIN: { label: 'Admin', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  PATIENT: { label: 'Patient', className: 'bg-green-100 text-green-800 border-green-200' },
}

export function Header({ title, subtitle, clinicName }: HeaderProps) {
  const { data: session } = useSession()
  const role = session?.user?.role
  const badgeConfig = role ? roleBadgeConfig[role] : null

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        {title && (
          <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
        )}
        {subtitle && (
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {clinicName && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-1.5">
            <Building2 className="h-3.5 w-3.5" />
            <span>{clinicName}</span>
          </div>
        )}

        {badgeConfig && (
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
              badgeConfig.className
            )}
          >
            {badgeConfig.label}
          </span>
        )}

        <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            1
          </span>
        </button>
      </div>
    </header>
  )
}
