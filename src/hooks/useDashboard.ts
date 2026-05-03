import { useQuery } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { DashboardData } from '@/types/api/dashboard'

const fetchDashboard = async (): Promise<DashboardData> => {
  const response = await api.get<DashboardData>('/api/dashboards/admin')

  return response.data
}

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    staleTime: 30000,
    retry: 2
  })
}
