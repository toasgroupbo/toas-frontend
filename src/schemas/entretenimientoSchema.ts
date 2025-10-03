import { z } from 'zod'

export const entretenimientoSchema = z.object({
  lugar_id: z.number().min(1, 'Debe seleccionar un lugar'),
  servicios_es: z.string().min(1, 'El campo es obligatorio').max(255, 'Máximo 255 caracteres'),
  servicios_en: z.string().min(1, 'El campo es obligatorio').max(255, 'Máximo 255 caracteres'),
  horarios_es: z.string().min(1, 'El campo es obligatorio'),
  horarios_en: z.string().min(1, 'El campo es obligatorio'),
  telefono: z
    .string()
    .refine(val => !val || /^\d{1,8}$/.test(val), 'Máximo 8 dígitos numéricos')
    .optional(),
  celular: z
    .string()
    .refine(val => !val || /^\d{8}$/.test(val), 'Debe tener exactamente 8 dígitos')
    .optional(),
  sitio_web: z.string().url('URL inválida').optional().or(z.literal('')),
  sub_categoria_id: z.number().min(1, 'La subcategoría es requerida'),
  verificado: z.boolean()
})

export type EntretenimientoFormData = z.infer<typeof entretenimientoSchema>
