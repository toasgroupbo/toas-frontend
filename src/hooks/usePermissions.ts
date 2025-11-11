'use client'

import { useAuth } from '@/contexts/AuthContext'
import type { Permission } from '@/types/api/auth'

export const usePermissions = () => {
  const { user } = useAuth()

  const userPermissions = user?.rol?.permissions || []
  const isStaticRole = user?.rol?.isStatic ?? true

  const hasPermission = (resource: string, action: string): boolean => {
    if (isStaticRole) {
      return true
    }

    return userPermissions.some((perm: Permission) => perm.resourse === resource && perm.permissions.includes(action))
  }

  const hasPermissions = (resource: string, actions: string[]) => {
    const permissions: Record<string, boolean> = {}

    actions.forEach(action => {
      permissions[action] = hasPermission(resource, action)
    })

    return permissions
  }

  const getCRUDPermissions = (resource: string) => {
    return {
      canCreate: hasPermission(resource, 'CREATE'),
      canRead: hasPermission(resource, 'READ'),
      canUpdate: hasPermission(resource, 'UPDATE'),
      canDelete: hasPermission(resource, 'DELETE')
    }
  }

  const hasAnyPermission = (resource: string, actions: string[]): boolean => {
    if (isStaticRole) {
      return true
    }

    return actions.some(action => hasPermission(resource, action))
  }

  const hasAllPermissions = (resource: string, actions: string[]): boolean => {
    if (isStaticRole) {
      return true
    }

    return actions.every(action => hasPermission(resource, action))
  }

  return {
    hasPermission,
    hasPermissions,
    getCRUDPermissions,
    hasAnyPermission,
    hasAllPermissions,
    isStaticRole,
    userPermissions
  }
}
