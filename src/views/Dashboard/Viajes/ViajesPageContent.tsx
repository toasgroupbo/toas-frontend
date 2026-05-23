'use client'

import { useAuth } from '@/contexts/AuthContext'
import ViajesListTable from '@/views/Dashboard/Viajes/list/ViajesListTable'
import ViajesCashierListTable from '@/views/Dashboard/Viajes/list/ViajesCashierListTable'
import ViajesOwnerListTable from '@/views/Dashboard/Viajes/list/ViajesOwnerListTable'

const ViajesPageContent = () => {
  const { userRole } = useAuth()

  if (userRole === 'CASHIER_OWNER') {
    return <ViajesOwnerListTable />
  }

  if (userRole === 'CASHIER' || userRole === 'CASHIER_TRIPS' || userRole === 'CASHIER_SELLER') {
    return <ViajesCashierListTable />
  }

  return <ViajesListTable />
}

export default ViajesPageContent
