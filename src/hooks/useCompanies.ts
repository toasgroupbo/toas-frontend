'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { Company, CreateCompanyDto, UpdateCompanyDto } from '@/types/api/company'

const fetchCompanies = async (): Promise<Company[]> => {
  const response = await api.get<Company[]>('/api/company')

  return response.data
}

const fetchCompanyById = async (id: string): Promise<Company> => {
  const response = await api.get<Company>(`/api/company/${id}`)

  return response.data
}

const createCompany = async (data: CreateCompanyDto): Promise<Company> => {
  const response = await api.post<Company>('/api/company', data)

  return response.data
}

const updateCompany = async ({
  id,
  data
}: {
  id: string
  data: {
    name: string
    logo: string
    commission: number
    hours_before_closing: number
  }
}): Promise<Company> => {
  const response = await api.patch<Company>(`/api/company/${id}`, data)

  return response.data
}

const updateBankAccount = async ({
  bankAccountId,
  data
}: {
  bankAccountId: string
  data: {
    bank: string
    typeAccount: string
    account: string
  }
}): Promise<void> => {
  await api.patch(`/api/bank-accounts/${bankAccountId}`, data)
}

const deleteCompany = async (id: string): Promise<void> => {
  await api.delete(`/api/company/${id}`)
}

export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies
  })
}

export const useCreateCompany = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    }
  })
}

export const useCompanyById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => fetchCompanyById(id!),
    enabled: !!id
  })
}

export const useUpdateCompany = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      companyId,
      bankAccountId,
      companyData,
      bankAccountData,
      originalBankAccount
    }: {
      companyId: string
      bankAccountId: string
      companyData: {
        name: string
        logo: string
        commission: number
        hours_before_closing: number
      }
      bankAccountData: {
        bank: string
        typeAccount: string
        account: string
      }
      originalBankAccount?: {
        bank: string
        typeAccount: string
        account: string
      }
    }) => {
      await updateCompany({ id: companyId, data: companyData })

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
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['company', variables.companyId] })
    },
    onError: error => {}
  })
}

export const useDeleteCompany = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    }
  })
}
