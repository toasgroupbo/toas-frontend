import { z } from 'zod'

export const servicioSchema = z.object({
  lugar_id: z.number().min(1, 'Debe seleccionar un lugar'),

  horarios_es: z.string().max(85, 'Máximo 85 caracteres').optional().or(z.literal('')),

  horarios_en: z.string().max(85, 'Máximo 85 caracteres').optional().or(z.literal('')),

  telefono: z
    .string()
    .regex(/^\d{0,8}$/, 'Debe contener solo números y máximo 8 dígitos')
    .optional()
    .or(z.literal('')),

  celular: z
    .string()
    .regex(/^\d{0,8}$/, 'Debe contener solo números y máximo 8 dígitos')
    .optional()
    .or(z.literal('')),

  sitio_web: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  verificado: z.boolean(),

  sub_categoria_id: z.number().min(1, 'Debe seleccionar una subcategoría')
})

export type ServicioFormData = z.infer<typeof servicioSchema>
