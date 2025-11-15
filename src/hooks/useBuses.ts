'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { Bus, CreateBusDto, UpdateBusDto } from '@/types/api/buses'
import { useAuth } from '@/contexts/AuthContext'

const fetchBuses = async (): Promise<Bus[]> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = '/api/buses'

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/buses?companyUUID=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.get<Bus[]>(url)

  return response.data
}

const fetchBusById = async (id: string): Promise<Bus> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/buses/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/buses/${id}?companyUUID=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.get<Bus>(url)

  return response.data
}

const createBus = async (data: CreateBusDto): Promise<Bus> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = '/api/buses'

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/buses?companyUUID=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.post<Bus>(url, data)

  return response.data
}

const updateBus = async ({ id, data }: { id: string; data: UpdateBusDto }): Promise<Bus> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/buses/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/buses/${id}?companyUUID=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.patch<Bus>(url, data)

  return response.data
}

const deleteBus = async (id: string): Promise<void> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/buses/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/buses/${id}?companyUUID=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  await api.delete(url)
}

// Hooks
export const useBuses = () => {
  const { companyUUID, hasCompany, isImpersonating } = useAuth()

  const shouldFetch = hasCompany || isImpersonating

  return useQuery({
    queryKey: ['buses', companyUUID],
    queryFn: fetchBuses,
    enabled: shouldFetch
  })
}

export const useBusById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['bus', id],
    queryFn: () => fetchBusById(id!),
    enabled: !!id
  })
}

export const useCreateBus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buses'] })
    }
  })
}

export const useUpdateBus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateBus,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['buses'] })
      queryClient.invalidateQueries({ queryKey: ['bus', variables.id] })
    }
  })
}

export const useDeleteBus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buses'] })
    }
  })
}
