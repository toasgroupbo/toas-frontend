import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { Travel, CreateTravelDto } from '@/types/api/travels'
import { useAuth } from '@/contexts/AuthContext'

export interface TravelFilters {
  status?: 'active' | 'closed' | 'cancelled'
  startDate?: string
  endDate?: string
  origin_placeId?: number
  destination_placeId?: number
  companyId?: number
  isPaid?: boolean
}

interface UseTravelsParams {
  page?: number
  limit?: number
  status?: string
  startDate?: string
  endDate?: string
  origin_placeId?: number
  destination_placeId?: number
}

const fetchTravels = async (params: UseTravelsParams): Promise<{ data: Travel[]; meta: any }> => {
  const { page = 1, limit = 10, status, startDate, endDate, origin_placeId, destination_placeId } = params
  const actingAsCompany = localStorage.getItem('acting_as_company')
  const queryParams = new URLSearchParams()

  queryParams.append('page', page.toString())
  queryParams.append('limit', limit.toString())

  if (status && status !== 'all') {
    queryParams.append('status', status)
  }

  if (startDate) {
    queryParams.append('startDate', startDate)
  }

  if (endDate) {
    queryParams.append('endDate', endDate)
  }

  if (origin_placeId) {
    queryParams.append('origin_placeId', origin_placeId.toString())
  }

  if (destination_placeId) {
    queryParams.append('destination_placeId', destination_placeId.toString())
  }

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      queryParams.append('companyId', company.id.toString())
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.get<{ data: Travel[]; meta: any }>(`/api/travels?${queryParams.toString()}`)

  return response.data
}

const fetchTravelById = async (id: string): Promise<Travel> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/travels/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/travels/${id}?companyId=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.get<Travel>(url)

  return response.data
}

const createTravel = async (data: CreateTravelDto): Promise<Travel> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = '/api/travels'

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/travels?companyId=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.post<Travel>(url, data)

  return response.data
}

const createTravelForCashier = async (data: CreateTravelDto): Promise<Travel> => {
  const response = await api.post<Travel>('/api/travels/for-cashier', data)

  return response.data
}

const deleteTravel = async (id: number): Promise<void> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/travels/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/travels/${id}?companyId=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  await api.delete(url)
}

const fetchTravelsForCashier = async (
  filters?: TravelFilters
): Promise<{ data: Travel[]; amounts: { cash: number; qr: number; app: number } }> => {
  const queryParams = new URLSearchParams()

  if (filters?.status) {
    queryParams.append('status', filters.status)
  }

  if (filters?.startDate) {
    queryParams.append('startDate', filters.startDate)
  }

  if (filters?.endDate) {
    queryParams.append('endDate', filters.endDate)
  }

  if (filters?.origin_placeId) {
    queryParams.append('origin_placeId', filters.origin_placeId.toString())
  }

  if (filters?.destination_placeId) {
    queryParams.append('destination_placeId', filters.destination_placeId.toString())
  }

  const url = `/api/travels/for-cashier/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const response = await api.get<{ data: Travel[]; meta: any; amounts: { cash: number; qr: number; app: number } }>(url)

  return { data: response.data.data, amounts: response.data.amounts }
}

const fetchTravelsForAdmin = async (
  filters?: TravelFilters
): Promise<{ data: Travel[]; amounts: { cash: number; qr: number; app: number } }> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  const queryParams = new URLSearchParams()

  if (filters?.status) {
    queryParams.append('status', filters.status)
  }

  if (filters?.startDate) {
    queryParams.append('startDate', filters.startDate)
  }

  if (filters?.endDate) {
    queryParams.append('endDate', filters.endDate)
  }

  if (filters?.origin_placeId) {
    queryParams.append('origin_placeId', filters.origin_placeId.toString())
  }

  if (filters?.destination_placeId) {
    queryParams.append('destination_placeId', filters.destination_placeId.toString())
  }

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      queryParams.append('companyId', company.id.toString())
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const url = `/api/travels${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const response = await api.get<{ data: Travel[]; meta: any; amounts: { cash: number; qr: number; app: number } }>(url)

  return { data: response.data.data, amounts: response.data.amounts || { cash: 0, qr: 0, app: 0 } }
}

const fetchTravelsForOwner = async (
  filters?: TravelFilters
): Promise<{ data: Travel[]; amounts: { cash: number; qr: number; app: number } }> => {
  const params: Record<string, any> = {}

  if (filters?.status) {
    params.status = filters.status
  }

  if (filters?.startDate) {
    params.startDate = filters.startDate
  }

  if (filters?.endDate) {
    params.endDate = filters.endDate
  }

  if (filters?.origin_placeId) {
    params.origin_placeId = filters.origin_placeId
  }

  if (filters?.destination_placeId) {
    params.destination_placeId = filters.destination_placeId
  }

  if (filters?.isPaid !== undefined) {
    params.isPaid = filters.isPaid
  }

  const response = await api.get<{ data: Travel[]; meta: any; amounts: { cash: number; qr: number; app: number } }>(
    '/api/travels/for-cashier/owner/all',
    { params }
  )

  return { data: response.data.data, amounts: response.data.amounts }
}

const deleteTravelForCashier = async (id: number): Promise<void> => {
  await api.delete(`/api/travels/for-cashier/${id}`)
}

const cancelTravelForCashier = async ({ id, password }: { id: number; password: string }): Promise<void> => {
  await api.post(`/api/travels/for-cashier/cancel/${id}`, { password })
}

export const useTravels = (params: UseTravelsParams) => {
  const { companyId } = useAuth()

  return useQuery({
    queryKey: [
      'travels',
      companyId,
      params.page,
      params.limit,
      params.status,
      params.startDate,
      params.endDate,
      params.origin_placeId,
      params.destination_placeId
    ],
    queryFn: () => fetchTravels(params),
    enabled: !!companyId,
    placeholderData: previousData => previousData,
    staleTime: 5 * 60 * 1000,
    retry: 2
  })
}

export const useTravelById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['travel', id],
    queryFn: () => fetchTravelById(id!),
    enabled: !!id
  })
}

export const useCreateTravel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTravel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travels'] })
    },
    onError: error => {
      console.error('Error creating travel:', error)
    }
  })
}

export const useCreateTravelForCashier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTravelForCashier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travelsForCashier'] })

      queryClient.invalidateQueries({ queryKey: ['cashier-travels'] })

      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      queryClient.invalidateQueries({ queryKey: ['tickets-by-travel'] })
      queryClient.invalidateQueries({ queryKey: ['tickets-by-travel-company'] })
    },
    onError: error => {
      console.error('Error creating travel:', error)
    }
  })
}

export const useDeleteTravel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTravel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travels'] })
    }
  })
}

export const useTravelsForCashier = (filters?: TravelFilters) => {
  return useQuery({
    queryKey: ['travelsForCashier', filters],
    queryFn: () => fetchTravelsForCashier(filters),
    retry: 1,
    staleTime: 30000
  })
}

export const useTravelsForAdmin = (filters?: TravelFilters) => {
  return useQuery({
    queryKey: ['travelsForAdmin', filters],
    queryFn: () => fetchTravelsForAdmin(filters),
    retry: 2,
    staleTime: 30000
  })
}

export const useTravelsForOwner = (filters?: TravelFilters) => {
  return useQuery({
    queryKey: ['travelsForOwner', filters],
    queryFn: () => fetchTravelsForOwner(filters),
    retry: 1,
    staleTime: 30000
  })
}

export const useDeleteTravelForCashier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTravelForCashier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travelsForCashier'] })
      queryClient.invalidateQueries({ queryKey: ['tickets-by-travel'] })
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      queryClient.invalidateQueries({ queryKey: ['tickets-by-travel-company'] })
    }
  })
}

export const useCancelTravelForCashier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelTravelForCashier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travelsForCashier'] })
      queryClient.invalidateQueries({ queryKey: ['tickets-by-travel'] })
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      queryClient.invalidateQueries({ queryKey: ['tickets-by-travel-company'] })
    }
  })
}
