export const formatDateHeader = (dateKey: string) => {
  const date = new Date(dateKey + 'T12:00:00')

  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export const formatDate = (dateString: string) => {
  const dateWithoutZ = dateString.replace('Z', '')
  const date = new Date(dateWithoutZ)

  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

export const formatTime = (dateString: string) => {
  const dateWithoutZ = dateString.replace('Z', '')
  const date = new Date(dateWithoutZ)

  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getImageUrl = (imagePath: string | undefined) => {
  if (!imagePath) return null
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

  return `${baseUrl}${imagePath}`
}
