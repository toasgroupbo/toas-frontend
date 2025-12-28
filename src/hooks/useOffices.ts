'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { Office, CreateOfficeDto, UpdateOfficeDto, Place } from '@/types/api/offices'
import { useAuth } from '@/contexts/AuthContext'

const fetchPlaces = async (): Promise<Place[]> => {
  const response = await api.get<Place[]>('/api/places')

  return response.data
}

const fetchOffices = async (): Promise<Office[]> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = '/api/offices'

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/offices?companyId=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.get<Office[]>(url)

  return response.data
}

const fetchOfficeById = async (id: number): Promise<Office> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/offices/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/offices/${id}?companyId=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.get<Office>(url)

  return response.data
}

const createOffice = async (data: CreateOfficeDto): Promise<Office> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = '/api/offices'

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/offices?companyId=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.post<Office>(url, data)

  return response.data
}

const updateOffice = async ({ id, data }: { id: number; data: UpdateOfficeDto }): Promise<Office> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/offices/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/offices/${id}?companyId=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.patch<Office>(url, data)

  return response.data
}

const deleteOffice = async (id: number): Promise<void> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/offices/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/offices/${id}?companyId=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  await api.delete(url)
}

// Hooks
export const usePlaces = () => {
  return useQuery({
    queryKey: ['places'],
    queryFn: fetchPlaces
  })
}

export const useOffices = () => {
  const { companyId, hasCompany, isImpersonating } = useAuth()

  const shouldFetch = hasCompany || isImpersonating

  return useQuery({
    queryKey: ['offices', companyId],
    queryFn: fetchOffices,
    enabled: shouldFetch
  })
}

export const useOfficeById = (id: number | undefined) => {
  return useQuery({
    queryKey: ['office', id],
    queryFn: () => fetchOfficeById(id!),
    enabled: !!id
  })
}

export const useCreateOffice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOffice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offices'] })
    }
  })
}

export const useUpdateOffice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateOffice,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['offices'] })
      queryClient.invalidateQueries({ queryKey: ['office', variables.id] })
    }
  })
}

export const useDeleteOffice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteOffice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offices'] })
    }
  })
}
