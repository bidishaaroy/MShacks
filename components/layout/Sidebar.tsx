'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  Activity,
  Bot,
  LayoutDashboard,
  Settings,
  Stethoscope,
  Shield,
  User,
  LogOut,
  Heart,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  roles?: string[]
}

const navItems: NavItem[] = [
  {
    href: '/patient',
    icon: User,
    label: 'Patient Chat',
    roles: ['PATIENT'],
  },
  {
    href: '/doctor',
    icon: Stethoscope,
    label: 'Doctor Workspace',
    roles: ['DOCTOR'],
  },
  {
    href: '/admin',
    icon: Shield,
    label: 'Admin Dashboard',
    roles: ['ADMIN'],
  },
  {
    href: '/ai-activity',
    icon: Activity,
    label: 'AI Activity',
    roles: ['DOCTOR', 'ADMIN'],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role

  const visibleItems = navItems.filter(
    (item) => !item.roles || (role && item.roles.includes(role))
  )

  const roleColor: Record<string, string> = {
    DOCTOR: 'bg-indigo-100 text-indigo-700',
    ADMIN: 'bg-amber-100 text-amber-700',
    PATIENT: 'bg-green-100 text-green-700',
  }

  const initials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  return (
    <div className="w-16 lg:w-64 h-full flex flex-col bg-white border-r border-gray-100 shadow-sm flex-shrink-0">
      {/* Logo */}
      <div className="p-4 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
            <Heart className="h-4 w-4 text-white" />
          </div>
          <span className="hidden lg:block font-bold text-gray-800 text-sm">
            ClinAI Bridge
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.includes(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              )}
            >
              <Icon className={cn('h-5 w-5 flex-shrink-0', isActive ? 'text-blue-600' : '')} />
              <span className="hidden lg:block truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:flex flex-col flex-1 min-w-0">
            <span className="text-xs font-semibold text-gray-700 truncate">
              {session?.user?.name || 'User'}
            </span>
            {role && (
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded-md font-medium w-fit mt-0.5',
                  roleColor[role] || 'bg-gray-100 text-gray-600'
                )}
              >
                {role.charAt(0) + role.slice(1).toLowerCase()}
              </span>
            )}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="hidden lg:flex text-gray-400 hover:text-red-500 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
