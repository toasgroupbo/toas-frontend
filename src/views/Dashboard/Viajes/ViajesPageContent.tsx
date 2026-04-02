'use client'

import { useAuth } from '@/contexts/AuthContext'
import ViajesListTable from '@/views/Dashboard/Viajes/list/ViajesListTable'
import ViajesCashierListTable from '@/views/Dashboard/Viajes/list/ViajesCashierListTable'

const ViajesPageContent = () => {
  const { userRole } = useAuth()

  // Verificar si es rol de cajero
  const isCashierRole = userRole === 'CASHIER' || userRole === 'CASHIER_TRIPS' || userRole === 'CASHIER_SELLER'

  // Mostrar tabla correspondiente según el rol
  return isCashierRole ? <ViajesCashierListTable /> : <ViajesListTable />
}

export default ViajesPageContent
