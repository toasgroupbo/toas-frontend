'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { Ticket, CreateTicketDto, TicketsResponse } from '@/types/api/tickets'
import { useAuth } from '@/contexts/AuthContext'

const fetchTickets = async (): Promise<Ticket[]> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = '/api/tickets'

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/tickets?companyId=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.get<Ticket[]>(url)

  return response.data
}

const fetchTicketById = async (id: number): Promise<Ticket> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/tickets/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/tickets/${id}?companyId=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.get<Ticket>(url)

  return response.data
}

const createTicket = async (data: CreateTicketDto): Promise<Ticket> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = '/api/tickets/in-office'

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/tickets/in-office?companyId=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.post<Ticket>(url, data)

  return response.data
}

const confirmTicket = async (id: number): Promise<void> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/tickets/confirm/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/tickets/confirm/${id}?companyId=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  await api.post(url)
}

const cancelTicket = async (id: number): Promise<void> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/tickets/cancel/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/tickets/cancel/${id}?companyId=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  await api.post(url)
}

// Hooks
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
    }
  })
}

export const useCancelTicket = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    }
  })
}
