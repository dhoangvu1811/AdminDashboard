import { User } from '@/types/auth.types'
import { Permission } from '@/types/role.types'

export const isAdmin = (user: User | null): boolean => {
  if (!user || !user.role) return false
  return user.role.name === 'admin'
}

export const hasPermission = (user: User | null, myPermissions: Permission[], permissionName: string): boolean => {
  if (isAdmin(user)) return true
  return myPermissions.some(p => p.name === permissionName)
}

export const isSuperCounter = (user: User | null): boolean => {
  return false
}
