'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { Ticket, CreateTicketDto, TicketsResponse } from '@/types/api/tickets'
import { useAuth } from '@/contexts/AuthContext'

export interface CashierSummary {
  id: number
  email: string
  fullName: string
  ci: string
  phone: string
  createdAt: string
  cashTotal: string
  qrTotal: string
}

export interface CurrentCashierResponse {
  cashier: {
    id: number
    email: string
    fullName: string
    ci: string
    phone: string
    createdAt: string
  }
  cashTotal: string
  qrTotal: string
}

export interface TravelTicketsResponse {
  tickets: Ticket[]
  cashiers: CashierSummary[]
  currentCashier?: CurrentCashierResponse
  totals: {
    totalCash: string
    totalQr: string
  }
}

const fetchTickets = async (): Promise<Ticket[]> => {
  const response = await api.get<Ticket[]>('/api/tickets')

  return response.data
}

const fetchTicketById = async (id: number): Promise<Ticket> => {
  const response = await api.get<Ticket>(`/api/tickets/${id}`)

  return response.data
}

const createTicket = async (data: CreateTicketDto): Promise<Ticket> => {
  const response = await api.post<Ticket>('/api/tickets/for-cashier', data)

  return response.data
}

const confirmTicket = async (id: number): Promise<void> => {
  await api.post(`/api/tickets/for-cashier/confirm/${id}`)
}

const cancelTicket = async (id: number): Promise<void> => {
  await api.post(`/api/tickets/for-cashier/cancel/${id}`)
}

const fetchTicketsByTravel = async (travelId: number): Promise<TravelTicketsResponse> => {
  const response = await api.get<TravelTicketsResponse>(`/api/tickets/for-cashier/${travelId}`)

  return response.data
}

const fetchTicketsByTravelAndCompany = async (travelId: number): Promise<TravelTicketsResponse> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/tickets/${travelId}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/tickets/${travelId}?companyId=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.get<TravelTicketsResponse>(url)

  return response.data
}

export const useTickets = () => {
  const { companyId, hasCompany, isImpersonating } = useAuth()

  const shouldFetch = hasCompany || isImpersonating

  return useQuery({
    queryKey: ['tickets', companyId],
    queryFn: fetchTickets,
    enabled: shouldFetch
  })
}

export const useTicketById = (id: number | undefined) => {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => fetchTicketById(id!),
    enabled: !!id
  })
}

export const useCreateTicket = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    }
  })
}

export const useConfirmTicket = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: confirmTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      queryClient.invalidateQueries({ queryKey: ['tickets-by-travel'] })
      queryClient.invalidateQueries({ queryKey: ['cashier-travels'] })
    }
  })
}

export const useCancelTicket = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      queryClient.invalidateQueries({ queryKey: ['tickets-by-travel'] })
      queryClient.invalidateQueries({ queryKey: ['cashier-travels'] })
    }
  })
}

export const useTicketsByTravel = (travelId: number | null) => {
  return useQuery<TravelTicketsResponse>({
    queryKey: ['tickets-by-travel', travelId],
    queryFn: () => fetchTicketsByTravel(travelId!),
    enabled: !!travelId
  })
}

export const useTicketsByTravelAndCompany = (travelId: number | null) => {
  const { hasCompany, isImpersonating } = useAuth()
  const shouldFetch = (hasCompany || isImpersonating) && !!travelId

  return useQuery<TravelTicketsResponse>({
    queryKey: ['tickets-by-travel-company', travelId],
    queryFn: () => fetchTicketsByTravelAndCompany(travelId!),
    enabled: shouldFetch
  })
}
