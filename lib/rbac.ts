import { Role } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export type Permission =
  | 'chat:send'
  | 'chat:view'
  | 'care-plan:read'
  | 'care-plan:write'
  | 'escalations:read'
  | 'escalations:resolve'
  | 'upload:create'
  | 'audit:read'
  | 'admin:dashboard'
  | 'doctor:dashboard'
  | 'patient:dashboard'

const rolePermissions: Record<Role, Permission[]> = {
  PATIENT: [
    'chat:send',
    'chat:view',
    'care-plan:read',
    'upload:create',
    'patient:dashboard',
  ],
  DOCTOR: [
    'chat:view',
    'care-plan:read',
    'care-plan:write',
    'escalations:read',
    'escalations:resolve',
    'audit:read',
    'doctor:dashboard',
  ],
  ADMIN: [
    'chat:view',
    'care-plan:read',
    'escalations:read',
    'escalations:resolve',
    'audit:read',
    'admin:dashboard',
  ],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false
}

export function canAccess(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p))
}

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return null
  }
  return session
}

export async function requireRole(roles: Role[]) {
  const session = await requireAuth()
  if (!session) return null
  if (!roles.includes(session.user.role)) return null
  return session
}

export function getRoleColor(role: string): string {
  switch (role) {
    case 'DOCTOR':
      return 'bg-indigo-100 text-indigo-800'
    case 'ADMIN':
      return 'bg-amber-100 text-amber-800'
    case 'PATIENT':
      return 'bg-green-100 text-green-800'
    case 'AI':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getRoleLabel(role: string): string {
  switch (role) {
    case 'DOCTOR':
      return 'Doctor'
    case 'ADMIN':
      return 'Admin'
    case 'PATIENT':
      return 'Patient'
    case 'AI':
      return 'AI Assistant'
    default:
      return role
  }
}
