'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { Owner, CreateOwnerDto, UpdateOwnerDto } from '@/types/api/owners'
import { useAuth } from '@/contexts/AuthContext'

const fetchOwners = async (): Promise<Owner[]> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = '/api/owners'

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/owners?companyId=${company.id}`
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

      url = `/api/owners/${id}?companyId=${company.id}`
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

      url = `/api/owners?companyId=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.post<Owner>(url, data)

  return response.data
}

const updateOwner = async ({
  id,
  data,
  userId,
  newPassword
}: {
  id: string
  data: UpdateOwnerDto
  userId?: number
  newPassword?: string
}): Promise<Owner> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/owners/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/owners/${id}?companyId=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.patch<Owner>(url, data)

  // Si hay nueva contraseña, actualizar con PUT /api/users/{userId}
  if (newPassword && newPassword.trim() !== '' && userId) {
    await api.put(`/api/users/${userId}`, { password: newPassword })
  }

  return response.data
}

const deleteOwner = async (id: string): Promise<void> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/owners/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/owners/${id}?companyId=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  await api.delete(url)
}

export const useOwners = () => {
  const { companyId, hasCompany, isImpersonating } = useAuth()

  const shouldFetch = hasCompany || isImpersonating

  return useQuery({
    queryKey: ['owners', companyId],
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
    mutationFn: updateOwner,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['owners'] })
      queryClient.invalidateQueries({ queryKey: ['owner', variables.id] })
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
