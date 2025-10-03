'use client'

import { useEffect, useState } from 'react'

import { useRouter, usePathname } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Alert from '@mui/material/Alert'

import { useAuth } from '@/contexts/AuthContext'

// Tipo
import type { ChildrenType } from '@core/types'

interface ProtectedRouteProps extends ChildrenType {
  publicRoutes?: string[]
}

// ==================== CONFIGURACIÓN ORIGINAL (COMENTADA) ====================
/*
const ROLE_PERMISSIONS: Record<string, string[]> = {
  Super_Admin: ['*'],
  Admin: ['*'],
  Operador: [
    '/home',
    '/actividades',
    '/lugares',
    '/turistico',
    '/gastronomia',
    '/entretenimiento',
    '/hospedaje',
    '/agenciaviaje',
    '/servicios'
  ],
  Admin_Negocio: ['/actividades', '/usuarios'],
  Operador_Negocio: ['/actividades']
}
*/

const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPERADMIN: ['*'],
  ADMIN_APLICACION: ['*'],
  ADMIN_EMPRESA: ['/home', '/companies', '/cash-register', '/reports', '/payments', '/terms', '/users'],
  CAJERO: ['/home', '/cash-register']
}

// Función para verificar si un rol tiene acceso a una ruta
const hasRouteAccess = (userRole: string, pathname: string): boolean => {
  const allowedRoutes = ROLE_PERMISSIONS[userRole]

  if (!allowedRoutes) return false

  if (allowedRoutes.includes('*')) return true

  return allowedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
}

const ProtectedRoute = ({ children, publicRoutes = ['/login', '/'] }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const { userRole } = useAuth()
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

      // ==================== REDIRECCIÓN DESPUÉS DE LOGIN ====================
      if (isAuthenticated && pathname === '/login') {
        switch (userRole) {
          case 'SUPERADMIN':
          case 'ADMIN_APLICACION':
            router.push('/home')
            break
          case 'ADMIN_EMPRESA':
            router.push('/home')
            break
          case 'CAJERO':
            router.push('/home')
            break
          default:
            router.push('/home')
        }

        return
      }

      if (isAuthenticated && !isPublicRoute) {
        if (!hasRouteAccess(userRole, pathname)) {
          setShowRoleError(true)
          setShowError(false)

          return
        }
      }

      setShowError(false)
      setShowRoleError(false)
    }
  }, [isAuthenticated, isLoading, pathname, isPublicRoute, router, userRole])

  // Loading inicial
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

  // Componente de error de permisos insuficientes
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
            No tienes permisos suficientes para acceder a esta sección del sistema. Si consideras que se trata de un
            error o necesitas habilitar el acceso, por favor contacta al administrador.
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
                switch (userRole) {
                  case 'SUPERADMIN':
                  case 'ADMIN_APLICACION':
                  case 'ADMIN_EMPRESA':
                    router.push('/home')
                    break
                  case 'CAJERO':
                    router.push('/home')
                    break
                  default:
                    router.push('/home')
                }
              }}
            >
              Ir al Panel Principal
            </Button>
          </Box>
          <Typography variant='caption' color='text.disabled' sx={{ mt: 3, display: 'block' }}>
            Si necesitas acceso a esta función, contacta al administrador del sistema.
          </Typography>
        </Paper>
      </Box>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute
