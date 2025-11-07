'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

import { useRouter } from 'next/navigation'

import type { ChildrenType } from '@core/types'
import type { User, Permission } from '@/types/api/auth'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (userData: User, token: string) => void
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
  hasRole: (role: string) => boolean
  hasPermission: (resource: string, permission: string) => boolean
  userRole: string
  isSuperAdmin: boolean
  isCompanyAdmin: boolean
  isCashier: boolean
  isCustomRole: boolean
  hasCompany: boolean
}

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'
const TOKEN_EXPIRY_KEY = 'auth_token_expiry'

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

        const roleName = userData.rol.name

        switch (roleName) {
          case 'SUPER_ADMIN':
            router.push('/home')
            break
          case 'COMPANY_ADMIN':
            router.push('/empresa/home')
            break
          case 'CASHIER':
            router.push('/ventas/caja')
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
    setUser(null)
    setToken(null)
    clearAuthData()
    router.push('/login')
  }, [router])

  const hasRole = (role: string): boolean => {
    return user?.rol.name === role
  }

  const hasPermission = (resource: string, permission: string): boolean => {
    if (!user) return false
    
    if (user.rol.name === 'SUPER_ADMIN') return true
    
    const userPermissions = user.rol.permissions || []
    
    return userPermissions.some(perm => 
      perm.resourse === resource && 
      perm.permissions.includes(permission)
    )
  }

  const userRole = user?.rol.name || ''
  const isAuthenticated = !!user && !!token
  const isSuperAdmin = userRole === 'SUPER_ADMIN'
  const isCompanyAdmin = userRole === 'COMPANY_ADMIN'
  const isCashier = userRole === 'CASHIER'
  const isCustomRole = user?.rol.isStatic === false
  const hasCompany = !!user?.companyId

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      isAuthenticated,
      isLoading,
      hasRole,
      hasPermission,
      userRole,
      isSuperAdmin,
      isCompanyAdmin,
      isCashier,
      isCustomRole,
      hasCompany
    }),
    [user, token, login, logout, isAuthenticated, isLoading, userRole, isSuperAdmin, isCompanyAdmin, isCashier, isCustomRole, hasCompany]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
