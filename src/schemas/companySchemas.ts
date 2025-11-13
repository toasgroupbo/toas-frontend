import * as z from 'zod'

import { BANCOS_BOLIVIA, TIPOS_CUENTA } from '@/types/api/company'

const BANCOS_MUTABLE = [...BANCOS_BOLIVIA] as [string, ...string[]]
const TIPOS_CUENTA_VALUES = TIPOS_CUENTA.map(t => t.value) as [string, ...string[]]

export const createCompanySchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  logo: z.string().min(1, 'Debe seleccionar un logo'),
  commission: z
    .number()
    .min(0, 'La comisión debe ser mayor o igual a 0')
    .max(100, 'La comisión no puede ser mayor a 100'),
  hours_before_closing: z.number().min(1, 'Debe ser al menos 1 hora').max(72, 'No puede ser mayor a 72 horas'),
  bankAccount: z.object({
    bank: z.enum(BANCOS_MUTABLE),
    typeAccount: z.enum(TIPOS_CUENTA_VALUES),
    account: z.string().min(8, 'El número de cuenta debe tener al menos 8 dígitos')
  }),
  manager: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    fullName: z.string().min(3, 'El nombre completo es requerido'),
    ci: z.string().min(5, 'El CI debe tener al menos 5 dígitos'),
    phone: z.string().min(8, 'El teléfono debe tener al menos 8 dígitos')
  })
})

export const updateCompanySchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
  logo: z.string().optional(),
  commission: z
    .number()
    .min(0, 'La comisión debe ser mayor o igual a 0')
    .max(100, 'La comisión no puede ser mayor a 100')
    .optional(),
  hours_before_closing: z
    .number()
    .min(1, 'Debe ser al menos 1 hora')
    .max(72, 'No puede ser mayor a 72 horas')
    .optional(),
  bankAccount: z.object({
    bank: z.enum(BANCOS_MUTABLE),
    typeAccount: z.enum(TIPOS_CUENTA_VALUES),
    account: z.string().min(8, 'El número de cuenta debe tener al menos 8 dígitos')
  })
})
export type CreateCompanyFormData = z.infer<typeof createCompanySchema>
export type UpdateCompanyFormData = z.infer<typeof updateCompanySchema>
