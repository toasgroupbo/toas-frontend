import * as z from 'zod'

import { BANCOS_BOLIVIA, TIPOS_CUENTA } from '@/types/api/company'

const BANCOS_MUTABLE = [...BANCOS_BOLIVIA] as [string, ...string[]]
const TIPOS_CUENTA_VALUES = TIPOS_CUENTA.map(t => t.value) as [string, ...string[]]

export const createCompanySchema = z
  .object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    logo: z.string().min(1, 'Debe subir una imagen de logo'),
    commission: z.number(),
    hours_before_closing: z.number(),
    bankAccount: z.object({
      bank: z.enum(BANCOS_MUTABLE, {
        message: 'Seleccione un banco'
      }),
      typeAccount: z.enum(TIPOS_CUENTA_VALUES, {
        message: 'Seleccione un tipo de cuenta'
      }),
      account: z.string().min(8, 'El número de cuenta debe tener al menos 8 dígitos')
    }),
    manager: z.object({
      email: z.string().email('Email inválido'),
      password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
      confirmPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
      fullName: z.string().min(3, 'El nombre completo es requerido'),
      ci: z.string().min(5, 'El CI debe tener al menos 5 dígitos'),
      phone: z.string().min(8, 'El teléfono debe tener al menos 8 dígitos')
    })
  })
  .refine(data => data.manager.password === data.manager.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['manager', 'confirmPassword']
  })

export const updateCompanySchema = z
  .object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
    logo: z.string().optional(),
    commission: z.number().optional(),
    hours_before_closing: z.number().optional(),
    bankAccount: z.object({
      bank: z.enum(BANCOS_MUTABLE, {
        message: 'Seleccione un banco'
      }),
      typeAccount: z.enum(TIPOS_CUENTA_VALUES, {
        message: 'Seleccione un tipo de cuenta'
      }),
      account: z.string().min(8, 'El número de cuenta debe tener al menos 8 dígitos')
    }),
    admin: z.object({
      email: z.string().email('Email inválido'),
      fullName: z.string().min(3, 'El nombre completo es requerido'),
      ci: z.string().min(5, 'El CI debe tener al menos 5 dígitos'),
      phone: z.string().min(8, 'El teléfono debe tener al menos 8 dígitos')
    }),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional()
  })
  .refine(
    data => {
      if (data.newPassword || data.confirmPassword) {
        return data.newPassword === data.confirmPassword
      }

      return true
    },
    {
      message: 'Las contraseñas no coinciden',
      path: ['confirmPassword']
    }
  )
  .refine(
    data => {
      if (data.newPassword && data.newPassword.length < 6) {
        return false
      }

      return true
    },
    {
      message: 'La contraseña debe tener al menos 6 caracteres',
      path: ['newPassword']
    }
  )
export type CreateCompanyFormData = z.infer<typeof createCompanySchema>
export type UpdateCompanyFormData = z.infer<typeof updateCompanySchema>
