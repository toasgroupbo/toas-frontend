'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { Cashier, CreateCashierDto, UpdateCashierDto, UpdateCashierOfficeDto } from '@/types/api/cashiers'
import { useAuth } from '@/contexts/AuthContext'

const fetchCashiers = async (): Promise<Cashier[]> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = '/api/cashiers'

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/cashiers?companyUUID=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.get<Cashier[]>(url)

  return response.data
}

const fetchCashierById = async (id: string): Promise<Cashier> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/cashiers/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/cashiers/${id}?companyUUID=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.get<Cashier>(url)

  return response.data
}

const createCashier = async (data: CreateCashierDto): Promise<Cashier> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = '/api/cashiers'

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/cashiers?companyUUID=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.post<Cashier>(url, data)

  return response.data
}

const updateCashier = async ({ id, data }: { id: string; data: UpdateCashierDto }): Promise<Cashier> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/users/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/users/${id}?companyUUID=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.patch<Cashier>(url, data)

  return response.data
}

const updateCashierOffice = async ({ id, office }: { id: string; office: string }): Promise<void> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/cashiers/office/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/cashiers/office/${id}?companyUUID=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  await api.put(url, { NewOfficeUUID: office })
}

const deleteCashier = async (id: string): Promise<void> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/users/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/users/${id}?companyUUID=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  await api.delete(url)
}

const changePassword = async ({ id, password }: { id: string; password: string }): Promise<void> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/users/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/users/${id}?companyUUID=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  await api.put(url, { password })
}

// Hooks
export const useCashiers = () => {
  const { companyUUID, hasCompany, isImpersonating } = useAuth()

  const shouldFetch = hasCompany || isImpersonating

  return useQuery({
    queryKey: ['cashiers', companyUUID],
    queryFn: fetchCashiers,
    enabled: shouldFetch
  })
}

export const useCashierById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['cashier', id],
    queryFn: () => fetchCashierById(id!),
    enabled: !!id
  })
}

export const useCreateCashier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCashier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashiers'] })
    }
  })
}

export const useUpdateCashier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      cashierId,
      cashierData,
      officeData,
      originalOffice
    }: {
      cashierId: string
      cashierData: UpdateCashierDto
      officeData: string
      originalOffice?: string
    }) => {
      await updateCashier({ id: cashierId, data: cashierData })

      const officeChanged = !originalOffice || originalOffice !== officeData

      if (officeChanged && officeData) {
        await updateCashierOffice({ id: cashierId, office: officeData })
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cashiers'] })
      queryClient.invalidateQueries({ queryKey: ['cashier', variables.cashierId] })
    }
  })
}

export const useDeleteCashier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCashier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashiers'] })
    }
  })
}

export const useChangePasswordCashier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashiers'] })
    }
  })
}
