'use client'

import { useEffect, useState } from 'react'

import { useRouter, usePathname } from 'next/navigation'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Alert from '@mui/material/Alert'

import { useAuth } from '@/contexts/AuthContext'
import type { ChildrenType } from '@core/types'
import type { Permission } from '@/types/api/auth'
import NotFound from '@/views/NotFound'

interface ProtectedRouteProps extends ChildrenType {
  publicRoutes?: string[]
}

const ROUTE_RESOURCE_MAP: Record<string, { resource: string; permission: string }> = {
  '/companies/list': { resource: 'COMPANY', permission: 'READ' },
  '/usuarios/list': { resource: 'USER', permission: 'READ' },
  '/roles/list': { resource: 'ROL', permission: 'READ' },
  '/clientes/list': { resource: 'CUSTOMER', permission: 'READ' },

  '/buses/list': { resource: 'BUS', permission: 'READ' },
  '/rutas/list': { resource: 'ROUTE', permission: 'READ' },
  '/duenos/list': { resource: 'OWNER', permission: 'READ' },
  '/cajeros/list': { resource: 'CASHIER', permission: 'READ' },

  '/arqueo/list': { resource: 'TICKET', permission: 'READ' },
  '/salidas/list': { resource: 'TRAVEL', permission: 'READ' },
  '/oficinas/list': { resource: 'OFFICE', permission: 'READ' },
  '/viajes/list': { resource: 'TRIP', permission: 'READ' }
}

const COMPANY_ROUTES = ['/buses', '/rutas', '/duenos', '/cajeros', '/arqueo', '/salidas', '/oficinas', '/viajes']

const STATIC_ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ['*'],
  ADMIN_APLICACION: [
    '/home',
    '/companies',
    '/usuarios',
    '/roles',
    '/clientes',
    '/reportes',
    '/terminos',
    'oficinas',
    'viajes'
  ],
  ADMIN_EMPRESA: ['/home', '/buses', '/rutas', '/duenos', '/cajeros', '/arqueo', '/salidas', 'oficinas', 'viajes'],
  COMPANY_ADMIN: ['/home', '/buses', '/rutas', '/duenos', '/cajeros', '/arqueo', '/salidas', 'oficinas', 'viajes'],
  CAJERO: ['/home', '/arqueo', '/salidas']
}

const hasPermissionForRoute = (
  pathname: string,
  userRole: string,
  userPermissions: Permission[],
  hasCompany: boolean,
  isImpersonating: boolean,
  isStaticRole: boolean
): boolean => {
  if (['/dashboard', '/home'].includes(pathname)) {
    return true
  }

  if (isStaticRole) {
    if (userRole === 'SUPER_ADMIN') {
      if (!hasCompany && !isImpersonating) {
        const isCompanyRoute = COMPANY_ROUTES.some(route => pathname.startsWith(route))

        return !isCompanyRoute
      }

      return true
    }

    if (userRole === 'ADMIN_APLICACION') {
      const allowedRoutes = STATIC_ROLE_PERMISSIONS.ADMIN_APLICACION

      return allowedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
    }

    if (userRole === 'CAJERO') {
      if (!hasCompany) return false

      const allowedRoutes = STATIC_ROLE_PERMISSIONS.CAJERO

      return allowedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
    }

    if (userRole === 'ADMIN_EMPRESA' || userRole === 'COMPANY_ADMIN') {
      if (!hasCompany) return false

      const allowedRoutes = STATIC_ROLE_PERMISSIONS.ADMIN_EMPRESA

      return allowedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
    }
  }

  if (!isStaticRole) {
    const routeConfig = ROUTE_RESOURCE_MAP[pathname]

    if (routeConfig) {
      const hasPermission = userPermissions.some(
        perm => perm.resourse === routeConfig.resource && perm.permissions.includes(routeConfig.permission)
      )

      if (!hasPermission) return false

      const isCompanyRoute = COMPANY_ROUTES.some(route => pathname.startsWith(route))

      if (isCompanyRoute && !hasCompany && !isImpersonating) {
        return false
      }

      return true
    }

    return false
  }

  return false
}

const ProtectedRoute = ({ children, publicRoutes = ['/login', '/'] }: ProtectedRouteProps) => {
  const {
    isAuthenticated,
    isLoading,
    isTransitioning,
    user,
    userRole,
    isSuperAdmin,
    isCompanyAdmin,
    hasCompany,
    isImpersonating
  } = useAuth()

  const router = useRouter()
  const pathname = usePathname()
  const [showError, setShowError] = useState(false)
  const [showRoleError, setShowRoleError] = useState(false)

  const isPublicRoute = publicRoutes.some(route => {
    if (pathname === route) return true
    if (route !== '/' && pathname.startsWith(route)) return true

    return false
  })

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isPublicRoute) {
        setShowError(true)
        setShowRoleError(false)

        return
      }

      if (isAuthenticated && pathname === '/login') {
        if (isSuperAdmin) {
          router.push('/home')
        } else if (isCompanyAdmin && hasCompany) {
          router.push('/home')
        } else if (userRole === 'CAJERO') {
          router.push('/arqueo/list')
        } else {
          router.push('/home')
        }

        return
      }

      if (isAuthenticated && !isPublicRoute) {
        const userPermissions = user?.rol.permissions || []
        const isStaticRole = user?.rol?.isStatic ?? true

        if (!hasPermissionForRoute(pathname, userRole, userPermissions, hasCompany, isImpersonating, isStaticRole)) {
          setShowRoleError(true)
          setShowError(false)

          return
        }
      }

      setShowError(false)
      setShowRoleError(false)
    }
  }, [
    isAuthenticated,
    isLoading,
    pathname,
    isPublicRoute,
    router,
    user,
    userRole,
    isSuperAdmin,
    isCompanyAdmin,
    hasCompany,
    isImpersonating
  ])

  if (isLoading || isTransitioning) {
    return (
      <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' minHeight='100vh' gap={2}>
        <CircularProgress size={40} />
        <Typography variant='body2' color='text.secondary'>
          {isTransitioning ? 'Procesando...' : 'Cargando...'}
        </Typography>
      </Box>
    )
  }

  if (showError && !isAuthenticated && !isPublicRoute) {
    return <NotFound mode='light' />
  }

  if (showRoleError && isAuthenticated) {
    return <NotFound mode='light' />
  }

  return <>{children}</>
}

export default ProtectedRoute
