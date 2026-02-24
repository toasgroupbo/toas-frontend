export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'sold':
    case 'vendido':
      return 'success'
    case 'reserved':
    case 'reservado':
      return 'warning'
    case 'pending':
    case 'pendiente':
      return 'info'
    case 'cancelled':
    case 'cancelado':
      return 'error'
    default:
      return 'default'
  }
}

export const getStatusLabel = (status: string) => {
  switch (status.toLowerCase()) {
    case 'sold':
    case 'vendido':
      return 'Vendido'
    case 'reserved':
    case 'reservado':
      return 'Reservado'
    case 'pending':
    case 'pendiente':
      return 'Pendiente'
    case 'cancelled':
    case 'cancelado':
      return 'Cancelado'
    default:
      return status
  }
}
