'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

import { useRouter } from 'next/navigation'

import type { ChildrenType } from '@core/types'
import type { User, Permission } from '@/types/api/auth'
import type { Company } from '@/types/api/company'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (userData: User, token: string) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  isAuthenticated: boolean
  isLoading: boolean
  isTransitioning: boolean
  hasRole: (role: string) => boolean
  hasPermission: (resource: string, permission: string) => boolean
  userRole: string
  isSuperAdmin: boolean
  isCompanyAdmin: boolean
  isCashier: boolean
  isCustomRole: boolean
  hasCompany: boolean

  // 🆕 Impersonation
  actingAsCompany: Company | null
  setActingAsCompany: (company: Company | null) => void
  clearImpersonation: () => void
  isImpersonating: boolean
  canImpersonate: boolean
  companyId: string | null
}

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'
const TOKEN_EXPIRY_KEY = 'auth_token_expiry'
const ACTING_AS_COMPANY_KEY = 'acting_as_company'

const isTokenExpired = (expiryTime: string): boolean => {
  return Date.now() > parseInt(expiryTime)
}

const decodeTokenExpiry = (token: string): number => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))

    return payload.exp * 1000
  } catch {
    return Date.now() + 24 * 60 * 60 * 1000
  }
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
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [actingAsCompany, setActingAsCompanyState] = useState<Company | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAndRestoreSession = () => {
      try {
        const savedToken = localStorage.getItem(TOKEN_KEY)
        const savedUser = localStorage.getItem(USER_KEY)
        const savedExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
        const savedActingAsCompany = localStorage.getItem(ACTING_AS_COMPANY_KEY)

        if (savedToken && savedUser && savedExpiry) {
          if (isTokenExpired(savedExpiry)) {
            clearAuthData()
            setIsLoading(false)

            return
          }

          const parsedUser = JSON.parse(savedUser)

          setToken(savedToken)
          setUser(parsedUser)

          if (savedActingAsCompany) {
            setActingAsCompanyState(JSON.parse(savedActingAsCompany))
          }
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

        const roleName = userData.rol.name

        switch (roleName) {
          case 'SUPER_ADMIN':
            router.push('/home')
            break
          case 'COMPANY_ADMIN':
            router.push('/home')
            break
          case 'CASHIER':
            router.push('/ventas/caja')
            break
          case 'CASHIER_OWNER':
            router.push('/viajes/list')
            break
          default:
            router.push('/home')
        }
      } catch (error) {
        console.error('Error during login:', error)
      }
    },
    [router]
  )

  const logout = useCallback(() => {
    setIsTransitioning(true)
    setUser(null)
    setToken(null)
    setActingAsCompanyState(null)
    clearAuthData()
    localStorage.removeItem(ACTING_AS_COMPANY_KEY)
    window.location.href = '/login'
  }, [])

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null

      const updatedUser = { ...prevUser, ...userData }

      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))

      return updatedUser
    })
  }, [])

  const setActingAsCompany = useCallback((company: Company | null) => {
    setIsTransitioning(true)
    setActingAsCompanyState(company)

    if (company) {
      localStorage.setItem(ACTING_AS_COMPANY_KEY, JSON.stringify(company))
    } else {
      localStorage.removeItem(ACTING_AS_COMPANY_KEY)
    }

    window.location.href = '/home'
  }, [])

  const clearImpersonation = useCallback(() => {
    setIsTransitioning(true)
    setActingAsCompanyState(null)
    localStorage.removeItem(ACTING_AS_COMPANY_KEY)
    window.location.href = '/companies/list'
  }, [])

  const hasRole = useCallback(
    (role: string): boolean => {
      return user?.rol.name === role
    },
    [user]
  )

  const hasPermission = useCallback(
    (resource: string, permission: string): boolean => {
      if (!user) return false

      if (user.rol.name === 'SUPER_ADMIN') return true

      const userPermissions = user.rol.permissions || []

      return userPermissions.some(perm => perm.resourse === resource && perm.permissions.includes(permission))
    },
    [user]
  )

  const userRole = user?.rol?.name || ''
  const isAuthenticated = !!user && !!token
  const isSuperAdmin = userRole === 'SUPER_ADMIN'
  const isCompanyAdmin = userRole === 'COMPANY_ADMIN'
  const isCashier = userRole === 'CASHIER'
  const isCustomRole = user?.rol?.isStatic === false

  // TEMPORAL: Todos los cajeros siempre tienen compañía (a través de su oficina)
  // TODO: El backend debe retornar companyId para cajeros
  const isCashierRole =
    userRole === 'CASHIER' || userRole === 'CASHIER_TRIPS' || userRole === 'CASHIER_SELLER' || userRole === 'CASHIER_OWNER'
  const hasCompany = !!user?.companyId || !!user?.company?.id || isCashierRole

  const isImpersonating = !!actingAsCompany

  const canImpersonate = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN' || isCustomRole

  const companyId = actingAsCompany?.id || user?.companyId || null

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      updateUser,
      isAuthenticated,
      isLoading,
      isTransitioning,
      hasRole,
      hasPermission,
      userRole,
      isSuperAdmin,
      isCompanyAdmin,
      isCashier,
      isCustomRole,
      hasCompany,

      actingAsCompany,
      setActingAsCompany,
      clearImpersonation,
      isImpersonating,
      canImpersonate,
      companyId
    }),
    [
      user,
      token,
      login,
      logout,
      updateUser,
      isAuthenticated,
      isLoading,
      isTransitioning,
      hasRole,
      hasPermission,
      userRole,
      isSuperAdmin,
      isCompanyAdmin,
      isCashier,
      isCustomRole,
      hasCompany,
      actingAsCompany,
      setActingAsCompany,
      clearImpersonation,
      isImpersonating,
      canImpersonate,
      companyId
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
