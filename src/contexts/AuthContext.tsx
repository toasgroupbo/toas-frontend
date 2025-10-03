'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

import { useRouter } from 'next/navigation'

import { OPCIONES_ROLES, type OpcionRol } from '@/types/api/usuarios'
import type { ChildrenType } from '@core/types'

interface User {
  id: number
  usuario: string
  correo: string
  estado: boolean
  roles: string
  perfil_negocio_id: number
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (userData: User, token: string) => void
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
  hasRole: (role: string) => boolean
  getRolesDisponibles: () => OpcionRol[]
  userRole: string
}

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'
const TOKEN_EXPIRY_KEY = 'auth_token_expiry'

// ==================== CÓDIGO ORIGINAL ====================
/*
const isTokenExpired = (expiryTime: string): boolean => {
  return Date.now() > parseInt(expiryTime)
}

const decodeTokenExpiry = (token: string): number => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))

    return payload.exp * 1000
  } catch {
    return Date.now()
  }
}
*/

// ==================== VERSIÓN ESTÁTICA TEMPORAL ====================

const isTokenExpired = (expiryTime: string): boolean => {
  return false
}

const decodeTokenExpiry = (token: string): number => {
  return Date.now() + 24 * 60 * 60 * 1000

  // Código original (comentado para cuando haya backend real):
  /*
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000
  } catch {
    return Date.now()
  }
  */
}

const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(TOKEN_EXPIRY_KEY)
  sessionStorage.clear()
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

export const AuthProvider = ({ children }: ChildrenType) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAndRestoreSession = () => {
      try {
        const savedToken = localStorage.getItem(TOKEN_KEY)
        const savedUser = localStorage.getItem(USER_KEY)
        const savedExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY)

        if (savedToken && savedUser && savedExpiry) {
          if (isTokenExpired(savedExpiry)) {
            clearAuthData()
            setIsLoading(false)

            return
          }

          setToken(savedToken)
          setUser(JSON.parse(savedUser))
        }
      } catch (error) {
        console.error('Error restoring session:', error)
        clearAuthData()
      } finally {
        setIsLoading(false)
      }
    }

    checkAndRestoreSession()
  }, [])

  useEffect(() => {
    if (!token) return

    const checkTokenExpiry = () => {
      const savedExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY)

      if (savedExpiry && isTokenExpired(savedExpiry)) {
        logout()
      }
    }

    const interval = setInterval(checkTokenExpiry, 60000)

    return () => clearInterval(interval)
  }, [token])

  const login = useCallback(
    (userData: User, authToken: string) => {
      try {
        const expiryTime = decodeTokenExpiry(authToken)

        setUser(userData)
        setToken(authToken)

        localStorage.setItem(TOKEN_KEY, authToken)
        localStorage.setItem(USER_KEY, JSON.stringify(userData))
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString())

        switch (userData.roles) {
          case 'SUPERADMIN':
            router.push('/dashboard')
            break
          case 'ADMIN_APLICACION':
            router.push('/dashboard')
          case 'ADMIN_EMPRESA':
            router.push('/dashboard')
            break
          case 'CAJERO':
            router.push('/dashboard')
            break
          default:
            router.push('/dashboard')
        }
      } catch (error) {
        console.error('Error during login:', error)
      }
    },
    [router]
  )

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    clearAuthData()
    router.push('/login')
  }, [router])

  const hasRole = (role: string): boolean => {
    return user?.roles === role || false
  }

  const userRole = user?.roles || ''
  const isAuthenticated = !!user && !!token

  const getRolesDisponibles = (): OpcionRol[] => {
    const userRole = user?.roles

    if (!userRole) return []

    switch (userRole) {
      case 'SUPERADMIN':
        return OPCIONES_ROLES
      case 'ADMIN_APLICACION':
        return OPCIONES_ROLES.filter(rol => ['ADMIN_EMPRESA', 'CAJERO'].includes(rol.value))
      case 'ADMIN_EMPRESA':
        return OPCIONES_ROLES.filter(rol => ['CAJERO'].includes(rol.value))
      case 'CAJERO':
        return []
      default:
        return []
    }

    // Código original :
    /*
    switch (userRole) {
      case 'Super_Admin':
        return OPCIONES_ROLES
      case 'Admin':
        return OPCIONES_ROLES.filter(rol => ['Operador', 'Admin_Negocio', 'Operador_Negocio'].includes(rol.value))
      case 'Operador':
        return OPCIONES_ROLES.filter(rol => ['Admin_Negocio', 'Operador_Negocio'].includes(rol.value))
      case 'Admin_Negocio':
        return OPCIONES_ROLES.filter(rol => ['Operador_Negocio'].includes(rol.value))
      case 'Operador_Negocio':
        return []
      default:
        return []
    }
    */
  }

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      isAuthenticated,
      isLoading,
      hasRole,
      userRole,
      getRolesDisponibles
    }),
    [user, token, login, logout, isAuthenticated, isLoading, userRole]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ==================== FETCH AUTENTICADO ====================
export const useAuthenticatedFetch = () => {
  const { token, logout } = useAuth()

  return useCallback(
    async (url: string, options: RequestInit = {}) => {
      if (!token) {
        throw new Error('No authentication token')
      }

      const savedExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY)

      if (savedExpiry && isTokenExpired(savedExpiry)) {
        logout()
        throw new Error('Token expired')
      }

      try {
        // ==================== VERSIÓN ESTÁTICA ====================

        console.warn(' useAuthenticatedFetch en MODO ESTÁTICO - no hace llamadas reales')

        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 300))

        // Retornar respuesta mock exitosa
        return new Response(
          JSON.stringify({
            error: false,
            statusCode: 200,
            message: 'Operación exitosa (modo estático)',
            data: {}
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        )

        // Código original (comentado para cuando haya backend):
        /*
        const response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.status === 401) {
          logout()
          throw new Error('Authentication failed')
        }

        return response
        */
      } catch (error) {
        console.error('Authenticated fetch failed:', error)
        throw error
      }
    },
    [token, logout]
  )
}
