'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { Travel } from '@/types/api/travels'
import { useAuth } from '@/contexts/AuthContext'

interface FetchCashierTravelsParams {
  departure_time?: string
  destination_placeId?: number
}

const fetchCashierTravels = async (params?: FetchCashierTravelsParams): Promise<Travel[]> => {
  const queryParams = new URLSearchParams()

  if (params?.departure_time) {
    queryParams.append('departure_time', params.departure_time)
  }

  if (params?.destination_placeId) {
    queryParams.append('destination_placeId', params.destination_placeId.toString())
  }

  const url = `/api/travels/for-cashier/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

  const response = await api.get<{ data: Travel[]; meta: any; amounts: any }>(url)

  return response.data.data
}

const fetchCashierTravelById = async (id: number): Promise<Travel> => {
  const response = await api.get<Travel>(`/api/travels/for-cashier/${id}`)

  return response.data
}

export const useCashierTravels = (params?: FetchCashierTravelsParams) => {
  const { isCashier } = useAuth()

  return useQuery({
    queryKey: ['cashier-travels', params],
    queryFn: () => fetchCashierTravels(params),
    enabled: isCashier,
    retry: false
  })
}

export const useCashierTravelById = (id: number | null) => {
  const { isCashier } = useAuth()

  return useQuery({
    queryKey: ['cashier-travel', id],
    queryFn: () => fetchCashierTravelById(id!),
    enabled: isCashier && id !== null
  })
}

const closeTravel = async (id: number): Promise<void> => {
  await api.post(`/api/travels/for-cashier/closed/${id}`)
}

export const useCloseTravel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: closeTravel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashier-travels'] })
    }
  })
}

// Tipos para las rutas del cajero
interface Place {
  id: number
  name: string
  createdAt: string
}

interface Office {
  id: number
  url_gps: string
  city: string
  subsidiary: string
  createdAt: string
  place: Place
}

interface CashierRoute {
  id: number
  isActive: boolean
  pass_by: string[]
  createdAt: string
  officeOrigin: Office
  officeDestination: Office
}

const fetchCashierRoutes = async (): Promise<CashierRoute[]> => {
  const response = await api.get<CashierRoute[]>('/api/routes/for-cashier/all')

  return response.data
}

export const useCashierRoutes = () => {
  const { isCashier } = useAuth()

  return useQuery({
    queryKey: ['cashier-routes'],
    queryFn: fetchCashierRoutes,
    enabled: isCashier,
    retry: false
  })
}

const searchStaffByCI = async (ci: string) => {
  const response = await api.get(`/api/travels/for-cashier/staff/${ci}`)

  return response.data
}

const assignStaffToTravel = async (travelId: number, data: any) => {
  const response = await api.post(`/api/travels/for-cashier/assign-staff/${travelId}`, data)

  return response.data
}

export const useSearchStaff = () => {
  return useMutation({
    mutationFn: searchStaffByCI
  })
}

export const useAssignStaff = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ travelId, data }: { travelId: number; data: any }) => assignStaffToTravel(travelId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cashier-travel', variables.travelId] })
    }
  })
}
