import * as z from 'zod'

import {
  BANCOS_OPTIONS,
  BRANCH_OFFICE_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
  DOCUMENT_EXTENSION_OPTIONS
} from '@/types/api/company'

const BANCOS_VALUES = BANCOS_OPTIONS.map(b => b.value) as [string, ...string[]]
const BRANCH_OFFICE_VALUES = BRANCH_OFFICE_OPTIONS.map(b => b.value.toString()) as [string, ...string[]]
const DOCUMENT_TYPE_VALUES = DOCUMENT_TYPE_OPTIONS.map(d => d.value) as [string, ...string[]]
const DOCUMENT_EXTENSION_VALUES = DOCUMENT_EXTENSION_OPTIONS.map(d => d.value) as [string, ...string[]]

export const createCompanySchema = z
  .object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    logo: z.string().min(1, 'Debe subir una imagen de logo'),
    commission: z.number(),
    hours_before_closing: z.number(),
    bankAccount: z.object({
      bankCode: z.enum(BANCOS_VALUES, {
        message: 'Seleccione un banco'
      }),
      account: z.string().min(8, 'El número de cuenta debe tener al menos 8 dígitos'),
      titularName: z.string().min(3, 'El nombre del titular es requerido'),
      branchOfficeId: z.number({
        required_error: 'Seleccione una sucursal'
      }),
      documentNumber: z.string().min(5, 'El número de documento es requerido'),
      documentType: z.enum(DOCUMENT_TYPE_VALUES, {
        message: 'Seleccione un tipo de documento'
      }),
      documentExtension: z.enum(DOCUMENT_EXTENSION_VALUES, {
        message: 'Seleccione una extensión de documento'
      })
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
      bankCode: z.enum(BANCOS_VALUES, {
        message: 'Seleccione un banco'
      }),
      account: z.string().min(8, 'El número de cuenta debe tener al menos 8 dígitos'),
      titularName: z.string().min(3, 'El nombre del titular es requerido'),
      branchOfficeId: z.number({
        required_error: 'Seleccione una sucursal'
      }),
      documentNumber: z.string().min(5, 'El número de documento es requerido'),
      documentType: z.enum(DOCUMENT_TYPE_VALUES, {
        message: 'Seleccione un tipo de documento'
      }),
      documentExtension: z.enum(DOCUMENT_EXTENSION_VALUES, {
        message: 'Seleccione una extensión de documento'
      })
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
