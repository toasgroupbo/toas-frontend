import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { Company, CreateCompanyDto, UpdateCompanyDto } from '@/types/api/company'

type EnabledFilter = boolean | 'all'

const fetchCompanies = async (enabledStatus?: EnabledFilter): Promise<Company[]> => {
  const queryParams: Record<string, string> = {}

  if (enabledStatus !== undefined && enabledStatus !== 'all') {
    queryParams.enabled = String(enabledStatus)
  }

  const response = await api.get<Company[]>('/api/company', { params: queryParams })

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
    commission_app: number
    commission_company: number
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
    bankCode: string
    account: string
    titularName: string
    branchOfficeId: number
    documentNumber: string
    documentType: string
    documentExtension: string
  }
}): Promise<void> => {
  await api.patch(`/api/bank-accounts/${bankAccountId}`, data)
}

const deleteCompany = async (id: string): Promise<void> => {
  await api.delete(`/api/company/${id}`)
}

export const useCompanies = (enabledStatus?: EnabledFilter, queryEnabled: boolean = true) => {
  // Convertir a string para el queryKey
  const statusKey = enabledStatus === undefined ? 'all' : String(enabledStatus)

  return useQuery({
    queryKey: ['companies', statusKey],
    queryFn: () => fetchCompanies(enabledStatus),
    enabled: queryEnabled,
    placeholderData: previousData => previousData,
    staleTime: 5 * 60 * 1000,
    retry: 2
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
        commission_app: number
        commission_company: number
        hours_before_closing: number
      }
      bankAccountData: {
        bankCode: string
        account: string
        titularName: string
        branchOfficeId: number
        documentNumber: string
        documentType: string
        documentExtension: string
      }
      originalBankAccount?: {
        bankCode: string
        account: string
        titularName: string
        branchOfficeId: number
        documentNumber: string
        documentType: string
        documentExtension: string
      }
    }) => {
      await updateCompany({ id: companyId, data: companyData })

      const bankChanged =
        !originalBankAccount ||
        originalBankAccount.bankCode !== bankAccountData.bankCode ||
        originalBankAccount.account !== bankAccountData.account ||
        originalBankAccount.titularName !== bankAccountData.titularName ||
        originalBankAccount.branchOfficeId !== bankAccountData.branchOfficeId ||
        originalBankAccount.documentNumber !== bankAccountData.documentNumber ||
        originalBankAccount.documentType !== bankAccountData.documentType ||
        originalBankAccount.documentExtension !== bankAccountData.documentExtension

      if (bankChanged) {
        await updateBankAccount({ bankAccountId, data: bankAccountData })
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['company', variables.companyId] })
    }
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
