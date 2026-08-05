import { useQuery } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import { useAuth } from '@/contexts/AuthContext'
import type { DashboardData, CompanyDashboardData, UnifiedDashboardData } from '@/types/api/dashboard'

const fetchAdminDashboard = async (): Promise<DashboardData> => {
  const response = await api.get<DashboardData>('/api/dashboards/admin')

  return response.data
}

const fetchCompanyDashboard = async (companyId: number): Promise<CompanyDashboardData> => {
  const response = await api.get<CompanyDashboardData>('/api/dashboards/company', {
    params: { companyId }
  })

  return response.data
}

export const useDashboard = () => {
  const { isSuperAdmin, isImpersonating, actingAsCompany, isCompanyAdmin, user } = useAuth()

  // Determine if we should use company dashboard
  const isCompanyMode = isImpersonating || isCompanyAdmin
  const companyId = actingAsCompany?.id ?? user?.company?.id ?? user?.companyId

  return useQuery({
    queryKey: isCompanyMode ? ['dashboard', 'company', companyId] : ['dashboard', 'admin'],
    queryFn: async (): Promise<UnifiedDashboardData> => {
      if (isCompanyMode && companyId) {
        const data = await fetchCompanyDashboard(Number(companyId))

        // Transform company dashboard to unified format
        return {
          company: data.company,
          summary: data.summary,
          travels_today: data.travels_today,
          depositos: data.deposits, // Map deposits to depositos for consistency
          travels: data.travels,
          isCompanyMode: true
        }
      }

      const data = await fetchAdminDashboard()

      return {
        summary: data.summary,
        travels_today: data.travels_today,
        depositos: (data as any).deposits || data.depositos,
        travels: data.travels,
        isCompanyMode: false
      }
    },
    staleTime: 30000,
    retry: 2,
    enabled: !isCompanyMode || !!companyId
  })
}
