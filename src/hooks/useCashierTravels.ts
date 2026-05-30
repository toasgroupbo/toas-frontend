'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { Travel } from '@/types/api/travels'
import { useAuth } from '@/contexts/AuthContext'

interface FetchCashierTravelsParams {
  departure_time?: string
  destination_placeId?: number
  page?: number
  limit?: number
}

interface CashierTravelsMeta {
  total: number
  page: number
  lastPage: number
  limit: number
  offset: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface CashierTravelsAmounts {
  cash: number
  qr: number
  app: number
}

interface CashierTravelsResponse {
  data: Travel[]
  meta: CashierTravelsMeta
  amounts: CashierTravelsAmounts
}

const fetchCashierTravels = async (params?: FetchCashierTravelsParams): Promise<CashierTravelsResponse> => {
  const queryParams = new URLSearchParams()

  if (params?.departure_time) queryParams.append('departure_time', params.departure_time)
  if (params?.destination_placeId) queryParams.append('destination_placeId', params.destination_placeId.toString())
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())

  const url = `/api/travels/for-cashier/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

  const response = await api.get<CashierTravelsResponse>(url)

  return response.data
}

const fetchCashierTravelById = async (id: number): Promise<Travel> => {
  const response = await api.get<Travel>(`/api/travels/for-cashier/${id}`)

  return response.data
}

export const useCashierTravels = (params?: FetchCashierTravelsParams) => {
  const { isCashier } = useAuth()

  const query = useQuery({
    queryKey: ['cashier-travels', params],
    queryFn: () => fetchCashierTravels(params),
    enabled: isCashier,
    placeholderData: previousData => previousData,
    staleTime: 30000,
    retry: false
  })

  return {
    ...query,
    data: query.data?.data || [],
    meta: query.data?.meta,
    amounts: query.data?.amounts
  }
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

const fetchOwnerRoutes = async () => {
  const response = await api.get('/api/routes/for-cashier/owner/all')

  return response.data
}

export const useOwnerRoutes = () => {
  return useQuery({
    queryKey: ['owner-routes'],
    queryFn: fetchOwnerRoutes
  })
}
