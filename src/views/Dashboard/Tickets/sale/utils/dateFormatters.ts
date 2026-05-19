export const formatDateHeader = (dateKey: string) => {
  const date = new Date(dateKey + 'T12:00:00')

  return date.toLocaleDateString('es-BO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/La_Paz'
  })
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString)

  return date.toLocaleDateString('es-BO', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/La_Paz'
  })
}

export const formatTime = (dateString: string) => {
  const date = new Date(dateString)

  return date.toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/La_Paz'
  })
}

export const formatFullDateTime = (dateString: string) => {
  const date = new Date(dateString)

  const datePart = date.toLocaleDateString('es-BO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/La_Paz'
  })

  const timePart = date.toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/La_Paz'
  })

  // Capitalizar primera letra
  const capitalizedDate = datePart.charAt(0).toUpperCase() + datePart.slice(1)

  return `${capitalizedDate} - ${timePart}`
}

export const getImageUrl = (imagePath: string | undefined) => {
  if (!imagePath) return null
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

  return `${baseUrl}${imagePath}`
}
