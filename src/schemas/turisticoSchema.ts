import { z } from 'zod'

export const turisticoSchema = z.object({
  lugar_id: z.number().min(1, 'Debe seleccionar un lugar'),
  resenia_es: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
  resenia_en: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
  precios_es: z.string().optional(),
  precios_en: z.string().optional(),
  horarios_es: z.string().optional(),
  horarios_en: z.string().optional(),
  telefono: z
    .string()
    .refine(val => !val || /^\d{1,9}$/.test(val), 'Máximo 8 dígitos numéricos')
    .optional(),
  celular: z
    .string()
    .refine(val => !val || /^\d{8}$/.test(val), 'Debe tener exactamente 8 dígitos')
    .optional(),
  relevancia: z.number().int().min(1).optional(),
  verificado: z.boolean(),
  sub_categoria_id: z.number().min(1, 'La subcategoría es requerida')
})

export type TuristicoFormData = z.infer<typeof turisticoSchema>
