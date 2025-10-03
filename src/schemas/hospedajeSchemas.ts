import { z } from 'zod'

export const hospedajeSchema = z.object({
  lugar_id: z.number().min(1, 'Debe seleccionar un lugar'),
  calificacion: z.number().min(0).max(5).optional(),
  otros_servicios_es: z.string().max(255, 'Máximo 255 caracteres').optional(),
  otros_servicios_en: z.string().max(255, 'Máximo 255 caracteres').optional(),
  telefono: z
    .string()
    .refine(val => !val || /^\d{1,8}$/.test(val), 'Máximo 8 dígitos numéricos')
    .optional(),
  celular: z
    .string()
    .refine(val => !val || /^\d{8}$/.test(val), 'Debe tener exactamente 8 dígitos')
    .optional(),
  correo: z.string().email('Correo inválido').optional().or(z.literal('')),
  sitio_web: z.string().url('URL inválida').optional().or(z.literal('')),
  sub_categoria_id: z.number().min(1, 'La subcategoría es requerida'),
  verificado: z.boolean()
})

export type HospedajeFormData = z.infer<typeof hospedajeSchema>
