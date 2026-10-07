'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'

interface ApprovalSettingsResponse {
  require_travel_approval: boolean
}

interface ApprovalSettingsRequest {
  enabled: boolean
}

interface ApproveRejectResponse {
  message: string
  travelId: number
  travel_status: string
  rejection_reason?: string
}

interface RejectTravelRequest {
  travelId: number
  rejection_reason?: string
}

const getApprovalSettings = async (): Promise<ApprovalSettingsResponse> => {
  const response = await api.get<ApprovalSettingsResponse>('/api/travels/settings/approval')

  return response.data
}

const updateApprovalSettings = async (data: ApprovalSettingsRequest): Promise<ApprovalSettingsResponse> => {
  const response = await api.patch<ApprovalSettingsResponse>('/api/travels/settings/approval', data)

  return response.data
}

const approveTravel = async (travelId: number): Promise<ApproveRejectResponse> => {
  const response = await api.patch<ApproveRejectResponse>(`/api/travels/${travelId}/approve`)

  return response.data
}

const rejectTravel = async ({ travelId, rejection_reason }: RejectTravelRequest): Promise<ApproveRejectResponse> => {
  const response = await api.patch<ApproveRejectResponse>(`/api/travels/${travelId}/reject`, {
    rejection_reason
  })

  return response.data
}

export const useApprovalSettings = () => {
  return useQuery({
    queryKey: ['travel-approval-settings'],
    queryFn: getApprovalSettings
  })
}

export const useUpdateApprovalSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateApprovalSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-approval-settings'] })
    },
    onError: (error: any) => {
      console.error('Error actualizando configuración de aprobación:', error)
    }
  })
}

export const useApproveTravel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: approveTravel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travels'] })
      queryClient.invalidateQueries({ queryKey: ['travel'] })
    },
    onError: (error: any) => {
      console.error('Error aprobando viaje:', error)
    }
  })
}

export const useRejectTravel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: rejectTravel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travels'] })
      queryClient.invalidateQueries({ queryKey: ['travel'] })
    },
    onError: (error: any) => {
      console.error('Error rechazando viaje:', error)
    }
  })
}
