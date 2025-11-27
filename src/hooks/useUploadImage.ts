'use client'

import { useMutation } from '@tanstack/react-query'

const uploadImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    const maxSizeInBytes = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      reject(new Error(`Tipo de archivo no permitido. Use PNG, JPG, JPEG o WebP.`))

      return
    }

    if (file.size > maxSizeInBytes) {
      reject(new Error(`La imagen no debe superar los 5MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`))

      return
    }

    const formData = new FormData()

    formData.append('files', file, file.name)

    const xhr = new XMLHttpRequest()
    const token = localStorage.getItem('auth_token')
    const baseURL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')

    xhr.open('POST', `${baseURL}/api/multimedia`, true)

    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data: string[] = JSON.parse(xhr.responseText)

          if (data && data.length > 0) {
            resolve(data[0])
          } else {
            reject(new Error('No se recibió URL de la imagen'))
          }
        } catch (error) {
          reject(new Error('Error al procesar la respuesta'))
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText)

          reject(new Error(errorData.message || 'Error al subir imagen'))
        } catch {
          reject(new Error(`Error ${xhr.status}: ${xhr.statusText}`))
        }
      }
    }

    xhr.onerror = () => {
      reject(new Error('Error de red al subir imagen'))
    }

    xhr.send(formData)
  })
}

export const useUploadImage = () => {
  return useMutation({
    mutationFn: uploadImage
  })
}
