import * as z from 'zod'

// Schema para crear empresa
export const createCompanySchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  logo: z.string().min(1, 'Debe seleccionar un logo'),
  commission: z
    .number()
    .min(0, 'La comisión debe ser mayor o igual a 0')
    .max(100, 'La comisión no puede ser mayor a 100'),
  hours_before_closing: z.number().min(1, 'Debe ser al menos 1 hora').max(72, 'No puede ser mayor a 72 horas'),
  bankAccount: z.object({
    bank: z.string().min(1, 'Seleccione un banco'),
    typeAccount: z.enum(['caja_ahorro', 'cuenta_corriente']),
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

// Schema para actualizar empresa
export const updateCompanySchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  logo: z.string().optional(),
  commission: z
    .number()
    .min(0, 'La comisión debe ser mayor o igual a 0')
    .max(100, 'La comisión no puede ser mayor a 100'),
  hours_before_closing: z.number().min(1, 'Debe ser al menos 1 hora').max(72, 'No puede ser mayor a 72 horas'),
  bankAccount: z.object({
    bank: z.string().min(1, 'Seleccione un banco'),
    typeAccount: z.enum(['caja_ahorro', 'cuenta_corriente']),
    account: z.string().min(8, 'El número de cuenta debe tener al menos 8 dígitos')
  })
})

// Schema para el formulario AddEmpresas
export const addCompanyFormSchema = z.object({
  name: z.string().min(3, 'El nombre comercial debe tener al menos 3 caracteres'),
  logo: z.string().optional(),
  commission: z.number().min(0, 'La comisión debe ser mayor o igual a 0').max(100, 'No puede ser mayor a 100'),
  hours_before_closing: z.number().min(1, 'Debe ser al menos 1 hora').max(72, 'No puede ser mayor a 72 horas'),
  bankAccount: z.object({
    bank: z.string().min(1, 'Seleccione un banco'),
    typeAccount: z.enum(['caja_ahorro', 'cuenta_corriente']),
    account: z.string().min(8, 'El número de cuenta debe tener al menos 8 dígitos')
  }),
  manager: z.object({
    fullName: z.string().min(5, 'Ingrese nombre y apellido completos'),
    ci: z.string().min(5, 'El CI debe tener al menos 5 dígitos'),
    phone: z.string().min(8, 'El número de celular debe tener al menos 8 dígitos'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
  })
})

// Tipos inferidos de los schemas
export type CreateCompanyFormData = z.infer<typeof createCompanySchema>
export type UpdateCompanyFormData = z.infer<typeof updateCompanySchema>
export type AddCompanyFormData = z.infer<typeof addCompanyFormSchema>
