import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import { useAuth } from '@/contexts/AuthContext'

export interface SubirImagenResponse {
  imagen: string
}

export interface ImagenArchivo {
  file: File
  preview: string
  uploading?: boolean
  error?: string
}

export const useImagenes = () => {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const useSubirImagen = () => {
    return useMutation({
      mutationFn: async (archivo: File): Promise<string> => {
        const formData = new FormData()

        formData.append('file', archivo)

        const response = await api.post<SubirImagenResponse>('/api/imagenes/imagenes/cargar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        return response.data.imagen
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lugares-paginated'] })
        queryClient.invalidateQueries({ queryKey: ['lugares'] })
        queryClient.invalidateQueries({ queryKey: ['lugar'] })
      },
      retry: 1
    })
  }

  const procesarArchivo = (file: File): ImagenArchivo => {
    return {
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      error: undefined
    }
  }

  const validarImagen = (file: File): { valida: boolean; error?: string } => {
    const tiposPermitidos = ['image/jpeg', 'image/jpg']
    const tamañoMaximo = 1 * 1024 * 1024

    if (!tiposPermitidos.includes(file.type)) {
      return {
        valida: false,
        error: 'Solo se permiten archivos JPG/JPEG'
      }
    }

    if (file.size > tamañoMaximo) {
      return {
        valida: false,
        error: 'La imagen es demasiado grande. Máximo 1MB'
      }
    }

    return { valida: true }
  }

  const limpiarPreview = (imagen?: ImagenArchivo) => {
    if (imagen?.preview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagen.preview)
    }
  }

  return {
    useSubirImagen,
    procesarArchivo,
    validarImagen,
    limpiarPreview,
    isAuthenticated
  }
}
