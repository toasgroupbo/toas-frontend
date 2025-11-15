'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { Route, CreateRouteDto, UpdateRouteDto } from '@/types/api/rutas'
import { useAuth } from '@/contexts/AuthContext'

const fetchRoutes = async (): Promise<Route[]> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = '/api/routes'

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/routes?companyUUID=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.get<Route[]>(url)

  return response.data
}

const fetchRouteById = async (id: string): Promise<Route> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/routes/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/routes/${id}?companyUUID=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.get<Route>(url)

  return response.data
}

const createRoute = async (data: CreateRouteDto): Promise<Route> => {
  // POST no lleva companyUUID según tu especificación
  const response = await api.post<Route>('/api/routes', data)

  return response.data
}

const updateRoute = async ({ id, data }: { id: string; data: UpdateRouteDto }): Promise<Route> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/routes/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/routes/${id}?companyUUID=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.patch<Route>(url, data)

  return response.data
}

const deleteRoute = async (id: string): Promise<void> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/routes/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/routes/${id}?companyUUID=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  await api.delete(url)
}

// Hooks
export const useRoutes = () => {
  const { companyUUID, hasCompany, isImpersonating } = useAuth()

  const shouldFetch = hasCompany || isImpersonating

  return useQuery({
    queryKey: ['routes', companyUUID],
    queryFn: fetchRoutes,
    enabled: shouldFetch
  })
}

export const useRouteById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['route', id],
    queryFn: () => fetchRouteById(id!),
    enabled: !!id
  })
}

export const useCreateRoute = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] })
    }
  })
}

export const useUpdateRoute = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateRoute,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routes'] })
      queryClient.invalidateQueries({ queryKey: ['route', variables.id] })
    }
  })
}

export const useDeleteRoute = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] })
    }
  })
}
