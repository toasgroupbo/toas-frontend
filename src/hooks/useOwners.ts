'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { Owner, CreateOwnerDto, UpdateOwnerDto, UpdateBankAccountDto } from '@/types/api/owners'
import { useAuth } from '@/contexts/AuthContext'

const fetchOwners = async (): Promise<Owner[]> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = '/api/owners'

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/owners?companyUUID=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.get<Owner[]>(url)

  return response.data
}

const fetchOwnerById = async (id: string): Promise<Owner> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/owners/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/owners/${id}?companyUUID=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.get<Owner>(url)

  return response.data
}

const createOwner = async (data: CreateOwnerDto): Promise<Owner> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = '/api/owners'

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/owners?companyUUID=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.post<Owner>(url, data)

  return response.data
}

const updateOwner = async ({ id, data }: { id: string; data: UpdateOwnerDto }): Promise<Owner> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/owners/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/owners/${id}?companyUUID=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.patch<Owner>(url, data)

  return response.data
}

const updateBankAccount = async ({
  bankAccountId,
  data
}: {
  bankAccountId: string
  data: UpdateBankAccountDto
}): Promise<void> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/bank-accounts/${bankAccountId}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/bank-accounts/${bankAccountId}?companyUUID=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  await api.patch(url, data)
}

const deleteOwner = async (id: string): Promise<void> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/owners/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/owners/${id}?companyUUID=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  await api.delete(url)
}

export const useOwners = () => {
  const { companyUUID, hasCompany, isImpersonating } = useAuth()

  const shouldFetch = hasCompany || isImpersonating

  return useQuery({
    queryKey: ['owners', companyUUID],
    queryFn: fetchOwners,
    enabled: shouldFetch
  })
}

export const useOwnerById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['owner', id],
    queryFn: () => fetchOwnerById(id!),
    enabled: !!id
  })
}

export const useCreateOwner = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOwner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] })
    }
  })
}

export const useUpdateOwner = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      ownerId,
      bankAccountId,
      ownerData,
      bankAccountData,
      originalBankAccount
    }: {
      ownerId: string
      bankAccountId: string
      ownerData: UpdateOwnerDto
      bankAccountData: UpdateBankAccountDto
      originalBankAccount?: UpdateBankAccountDto
    }) => {
      await updateOwner({ id: ownerId, data: ownerData })

      const bankChanged =
        !originalBankAccount ||
        originalBankAccount.bank !== bankAccountData.bank ||
        originalBankAccount.typeAccount !== bankAccountData.typeAccount ||
        originalBankAccount.account !== bankAccountData.account

      if (bankChanged) {
        await updateBankAccount({ bankAccountId, data: bankAccountData })
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['owners'] })
      queryClient.invalidateQueries({ queryKey: ['owner', variables.ownerId] })
    }
  })
}

export const useDeleteOwner = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteOwner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] })
    }
  })
}
