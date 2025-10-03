import { z } from 'zod'

export const servicioSchema = z.object({
  lugar_id: z.number().min(1, 'Debe seleccionar un lugar'),
  telefono: z
    .string()
    .refine(val => !val || /^\d{1,8}$/.test(val), 'Máximo 8 dígitos numéricos')
    .optional(),
  celular: z
    .string()
    .refine(val => !val || /^\d{8}$/.test(val), 'Debe tener exactamente 8 dígitos')
    .optional(),
  sub_categoria_id: z.number().min(1, 'La subcategoría es requerida')
})

export type ServicioFormData = z.infer<typeof servicioSchema>
