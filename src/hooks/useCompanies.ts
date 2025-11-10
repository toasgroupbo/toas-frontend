'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { Company, CreateCompanyDto, UpdateCompanyDto } from '@/types/api/company'

const fetchCompanies = async (): Promise<Company[]> => {
  const response = await api.get<Company[]>('/api/company')

  return response.data
}

const createCompany = async (data: CreateCompanyDto): Promise<Company> => {
  const response = await api.post<Company>('/api/company', data)

  return response.data
}

const updateCompany = async ({ id, data }: { id: string; data: UpdateCompanyDto }): Promise<Company> => {
  const response = await api.patch<Company>(`/api/company/${id}`, data)

  return response.data
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

export const useUpdateCompany = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
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
