'use client'

import { useMutation } from '@tanstack/react-query'

// ==================== CÓDIGO ORIGINAL ====================
/*
import { api } from '@/libs/axios'
import { useAuth } from '@/contexts/AuthContext'
import type { LoginRequest, LoginResponse } from '@/types/api/auth'

const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/api/auth/login', credentials)

  if (response.data.error || response.data.statusCode !== 200) {
    const error = new Error(response.data.message || 'Error en el login')

    ;(error as any).response = {
      status: response.data.statusCode,
      data: response.data
    }
    throw error
  }

  return response.data
}
*/

import { useAuth } from '@/contexts/AuthContext'
import type { LoginRequest, LoginResponse } from '@/types/api/auth'
import { Roles } from '@/types/api/usuarios'

const STATIC_USERS = [
  {
    id: 1,
    correo: 'superadmin@demo.com',
    contrasenia: 'super123',
    usuario: 'Super Administrador',
    verificado: true,
    estado: true,
    roles: Roles.superadmin,
    perfil_negocio_id: 0,
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.SUPERADMIN.static'
  },
  {
    id: 2,
    correo: 'adminapp@demo.com',
    contrasenia: 'adminapp123',
    usuario: 'Admin Aplicación',
    verificado: true,
    estado: true,
    roles: Roles.admin_aplicacion,
    perfil_negocio_id: 0,
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ADMINAPP.static'
  },
  {
    id: 3,
    correo: 'adminempresa@demo.com',
    contrasenia: 'empresa123',
    usuario: 'Admin Empresa',
    verificado: true,
    estado: true,
    roles: Roles.admin_empresa,
    perfil_negocio_id: 1,
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ADMINEMPRESA.static'
  },
  {
    id: 4,
    correo: 'cajero@demo.com',
    contrasenia: 'cajero123',
    usuario: 'Cajero',
    verificado: true,
    estado: true,
    roles: Roles.cajero,
    perfil_negocio_id: 1,
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.CAJERO.static'
  }
]

const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
  await new Promise(resolve => setTimeout(resolve, 800))

  const user = STATIC_USERS.find(u => u.correo === credentials.correo)

  if (!user) {
    const error = new Error('El correo electrónico no existe o es incorrecto')

    ;(error as any).response = {
      status: 404,
      data: {
        error: true,
        statusCode: 404,
        message: 'El correo electrónico no existe o es incorrecto'
      }
    }
    throw error
  }

  if (user.contrasenia !== credentials.contrasenia) {
    const error = new Error('La contraseña es incorrecta')

    ;(error as any).response = {
      status: 401,
      data: {
        error: true,
        statusCode: 401,
        message: 'La contraseña es incorrecta'
      }
    }
    throw error
  }

  if (!user.estado) {
    const error = new Error('Usuario desactivado. Contacta al administrador')

    ;(error as any).response = {
      status: 403,
      data: {
        error: true,
        statusCode: 403,
        message: 'Usuario desactivado'
      }
    }
    throw error
  }

  return {
    error: false,
    statusCode: 200,
    message: 'Login exitoso',
    data: {
      id: user.id,
      usuario: user.usuario,
      correo: user.correo,
      verificado: user.verificado,
      estado: user.estado,
      roles: user.roles,
      perfil_negocio_id: user.perfil_negocio_id,
      token: user.token
    }
  }
}

export const useLogin = () => {
  const { login } = useAuth()

  return useMutation({
    mutationFn: loginUser,
    onSuccess: data => {
      const token = data.data.token

      const user = {
        id: data.data.id,
        usuario: data.data.usuario,
        correo: data.data.correo,
        verificado: data.data.verificado,
        estado: data.data.estado,
        roles: data.data.roles,
        perfil_negocio_id: data.data.perfil_negocio_id
      }

      login(user, token)
    },
    onError: (error: any) => {
      console.error('Error en login:', error)
    }
  })
}
