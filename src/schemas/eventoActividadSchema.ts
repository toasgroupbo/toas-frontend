import { z } from 'zod'

export const eventoActividadSchema = z.object({
  fecha: z.string().min(1, 'La fecha de la actividad es requerida'),
  nombreDiaEs: z.string(),
  nombreDiaEn: z.string(),
  descripcionDiaEs: z.string(),
  descripcionDiaEn: z.string(),
  nombreActividadEs: z.string().min(1, 'El nombre de la actividad es requerido'),
  nombreActividadEn: z.string().min(1, 'El nombre de la actividad en inglés es requerido'),
  descripcionActividadEs: z.string(),
  descripcionActividadEn: z.string(),
  horaInicio: z.string().min(1, 'La hora de inicio es requerida'),
  horaFin: z.string(),
  lugares: z.array(z.number()),
  tipoSeleccionado: z.string().min(1, 'El tipo de actividad es requerido'),
  perfilNegocioSeleccionado: z.string()
})

export type EventoActividadFormData = z.infer<typeof eventoActividadSchema>
