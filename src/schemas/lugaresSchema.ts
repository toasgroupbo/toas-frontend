import { z } from 'zod'

const MAX_FILE_SIZE = 1 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg']

const validarUrlGoogleMaps = (url: string) => {
  if (!url.trim()) return true

  const iniciosValidos = [
    'https://maps.google.com/',
    'https://www.google.com/maps/',
    'https://goo.gl/maps/',
    'https://maps.app.goo.gl/'
  ]

  return iniciosValidos.some(inicio => url.toLowerCase().startsWith(inicio.toLowerCase()))
}

export const lugarSchema = z.object({
  nombre_es: z.string().min(1, 'El nombre en español es requerido'),
  nombre_en: z.string().min(1, 'El nombre en inglés es requerido'),
  descripcion_es: z.string(),
  descripcion_en: z.string(),
  direccion: z.string(),
  ubicacion: z.string(),
  url_ubicacion: z.string().refine(validarUrlGoogleMaps, {
    message: 'La URL debe empezar con: https://maps.google.com/ o https://goo.gl/maps/'
  }),
  estado: z.boolean(),
  imagenes: z.array(z.string())
})

export const imagenFileSchema = z.object({
  file: z
    .instanceof(File)
    .refine(file => file.size <= MAX_FILE_SIZE, 'La imagen debe ser menor a 1MB')
    .refine(file => ACCEPTED_IMAGE_TYPES.includes(file.type), 'Solo se permiten archivos JPG/JPEG')
})

export type LugarFormData = z.infer<typeof lugarSchema>
export type ImagenFileData = z.infer<typeof imagenFileSchema>
