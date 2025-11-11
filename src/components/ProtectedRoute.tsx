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

interface ProtectedRouteProps extends ChildrenType {
  publicRoutes?: string[]
}

const ROUTE_RESOURCE_MAP: Record<string, { resource: string; permission: string }> = {
  '/companies/list': { resource: 'COMPANY', permission: 'READ' },
  '/usuarios/list': { resource: 'USER', permission: 'READ' },
  '/roles/list': { resource: 'ROL', permission: 'READ' },

  '/buses/list': { resource: 'BUS', permission: 'READ' },
  '/rutas/list': { resource: 'ROUTE', permission: 'READ' },
  '/duenos/list': { resource: 'OWNER', permission: 'READ' },
  '/cajeros/list': { resource: 'CASHIER', permission: 'READ' },

  '/arqueo/list': { resource: 'TICKET', permission: 'READ' },
  '/salidas/list': { resource: 'TRAVEL', permission: 'READ' }
}

const COMPANY_ROUTES = ['/buses', '/rutas', '/duenos', '/cajeros', '/arqueo', '/salidas']

const STATIC_ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ['*'],
  ADMIN_APLICACION: ['/home', '/companies', '/usuarios', '/roles', '/reportes', '/terminos'],
  ADMIN_EMPRESA: ['/home', '/buses', '/rutas', '/duenos', '/cajeros', '/arqueo', '/salidas'],
  COMPANY_ADMIN: ['/home', '/buses', '/rutas', '/duenos', '/cajeros', '/arqueo', '/salidas'],
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
  const { isAuthenticated, isLoading, user, userRole, isSuperAdmin, isCompanyAdmin, hasCompany, isImpersonating } =
    useAuth()

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

  if (isLoading) {
    return (
      <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' minHeight='100vh' gap={2}>
        <CircularProgress size={40} />
        <Typography variant='body2' color='text.secondary'>
          Cargando...
        </Typography>
      </Box>
    )
  }

  if (showError && !isAuthenticated && !isPublicRoute) {
    return (
      <Box
        display='flex'
        flexDirection='column'
        justifyContent='center'
        alignItems='center'
        minHeight='100vh'
        gap={3}
        sx={{ p: 3, backgroundColor: 'background.default' }}
      >
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 500, width: '100%' }}>
          <Box sx={{ mb: 3 }}>
            <i className='tabler-lock-access' style={{ fontSize: '4rem', color: 'var(--mui-palette-error-main)' }} />
          </Box>
          <Typography variant='h4' color='error' gutterBottom>
            Acceso Denegado
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
            No tienes permisos para acceder a esta página. Por favor, inicia sesión para continuar.
          </Typography>
          <Alert severity='warning' sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant='body2'>
              <strong>Ruta solicitada:</strong> {pathname}
            </Typography>
          </Alert>
          <Box display='flex' gap={2} justifyContent='center' flexWrap='wrap'>
            <Button
              variant='contained'
              color='primary'
              startIcon={<i className='tabler-login' />}
              onClick={() => router.push('/login')}
            >
              Iniciar Sesión
            </Button>
            <Button
              variant='outlined'
              color='secondary'
              startIcon={<i className='tabler-home' />}
              onClick={() => router.push('/')}
            >
              Ir al Inicio
            </Button>
          </Box>
          <Typography variant='caption' color='text.disabled' sx={{ mt: 3, display: 'block' }}>
            Si crees que esto es un error, contacta al administrador.
          </Typography>
        </Paper>
      </Box>
    )
  }

  if (showRoleError && isAuthenticated) {
    return (
      <Box
        display='flex'
        flexDirection='column'
        justifyContent='center'
        alignItems='center'
        minHeight='100vh'
        gap={3}
        sx={{ p: 3, backgroundColor: 'background.default' }}
      >
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 500, width: '100%' }}>
          <Box sx={{ mb: 3 }}>
            <i className='tabler-shield-x' style={{ fontSize: '4rem', color: 'var(--mui-palette-warning-main)' }} />
          </Box>
          <Typography variant='h4' color='warning.main' gutterBottom>
            Permisos Insuficientes
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
            No tienes permisos suficientes para acceder a esta sección del sistema.
          </Typography>
          <Alert severity='info' sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant='body2'>
              <strong>Tu rol:</strong> {userRole}
              <br />
              <strong>Ruta solicitada:</strong> {pathname}
            </Typography>
          </Alert>
          <Box display='flex' gap={2} justifyContent='center' flexWrap='wrap'>
            <Button
              variant='contained'
              color='primary'
              startIcon={<i className='tabler-arrow-back' />}
              onClick={() => router.back()}
            >
              Volver Atrás
            </Button>
            <Button
              variant='outlined'
              color='secondary'
              startIcon={<i className='tabler-dashboard' />}
              onClick={() => {
                if (userRole === 'CAJERO') {
                  router.push('/arqueo/list')
                } else {
                  router.push('/home')
                }
              }}
            >
              Ir al Dashboard
            </Button>
          </Box>
          <Typography variant='caption' color='text.disabled' sx={{ mt: 3, display: 'block' }}>
            Si necesitas acceso a esta función, contacta al administrador.
          </Typography>
        </Paper>
      </Box>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute
