'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'

export interface Passenger {
  id: number
  fullName: string
  ci: string
  customerId: number
}

export interface CreatePassengerDto {
  customerId: number
  fullName: string
  ci: string
}

export interface PassengerAssignment {
  seatId: number
  passenger: {
    name: string
    ci: string
  }
}

export interface AssignPassengersDto {
  ticketId: number
  customerId: number
  passengers: PassengerAssignment[]
}

const fetchPassengersByCustomer = async (customerId: number): Promise<Passenger[]> => {
  const response = await api.get<Passenger[]>(`/api/customers/for-cashier/passengers/${customerId}`)

  return response.data
}

const searchPassengerByCI = async (ci: string): Promise<Passenger | null> => {
  try {
    const response = await api.get<Passenger>(`/api/customers/for-cashier/passengers/${ci}`)

    return response.data
  } catch {
    return null
  }
}

const createPassenger = async (data: CreatePassengerDto): Promise<Passenger> => {
  const response = await api.post<Passenger>('/api/customers/for-cashier/passengers', data)

  return response.data
}

const assignPassengers = async (data: AssignPassengersDto): Promise<void> => {
  await api.post('/api/tickets/for-cashier/assign-passenger', data)
}

export const usePassengersByCustomer = (customerId: number | null) => {
  return useQuery({
    queryKey: ['passengers', customerId],
    queryFn: () => fetchPassengersByCustomer(customerId!),
    enabled: !!customerId
  })
}

export const useSearchPassengerByCI = () => {
  return useMutation({
    mutationFn: searchPassengerByCI
  })
}

export const useCreatePassenger = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPassenger,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['passengers', variables.customerId] })
    }
  })
}

export const useAssignPassengers = () => {
  return useMutation({
    mutationFn: assignPassengers
  })
}
