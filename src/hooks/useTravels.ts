'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { Travel, CreateTravelDto } from '@/types/api/travels'
import { useAuth } from '@/contexts/AuthContext'

export interface TravelFilters {
  status?: 'active' | 'closed'
  startDate?: string
  endDate?: string
  origin_placeId?: number
  destination_placeId?: number
}

const fetchTravels = async (params: {
  page: number
  limit: number
  status?: string
}): Promise<{ data: Travel[]; meta: any }> => {
  const { page = 1, limit = 10, status } = params
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = '/api/travels'

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  })

  if (status && status !== 'all') {
    queryParams.append('status', status)
  }

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      queryParams.append('companyId', company.id.toString())
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  url = `${url}?${queryParams.toString()}`

  const response = await api.get<{ data: Travel[]; meta: any }>(url)

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

// Cashier-specific functions
const fetchTravelsForCashier = async (filters?: TravelFilters): Promise<Travel[]> => {
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
  const response = await api.get<{ data: Travel[]; meta: any; amounts: any }>(url)

  return response.data.data
}

// Owner-specific functions
const fetchTravelsForOwner = async (filters?: TravelFilters): Promise<Travel[]> => {
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

  const url = `/api/travels/for-cashier/owner/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const response = await api.get<{ data: Travel[]; meta: any; amounts: any }>(url)

  return response.data.data
}

const deleteTravelForCashier = async (id: number): Promise<void> => {
  await api.delete(`/api/travels/for-cashier/${id}`)
}

const cancelTravelForCashier = async (id: number): Promise<void> => {
  await api.post(`/api/travels/for-cashier/cancel/${id}`)
}

export const useTravels = (params: { page: number; limit: number; status?: string }) => {
  const { companyId } = useAuth()

  return useQuery({
    queryKey: ['travels', companyId, params.page, params.limit, params.status],
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

// Cashier hooks
export const useTravelsForCashier = (filters?: TravelFilters) => {
  return useQuery({
    queryKey: ['travelsForCashier', filters],
    queryFn: () => fetchTravelsForCashier(filters),
    retry: 1,
    staleTime: 30000
  })
}

// Owner hooks
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
    }
  })
}

export const useCancelTravelForCashier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelTravelForCashier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travelsForCashier'] })
    }
  })
}
