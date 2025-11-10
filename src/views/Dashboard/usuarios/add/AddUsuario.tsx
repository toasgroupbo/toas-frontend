'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import CreateUserDialog from '@/views/Dashboard/usuarios/components/CreateUserDialog'
import { useCreateUser } from '@/hooks/useUsers'
import { useSnackbar } from '@/contexts/SnackbarContext'
import type { CreateUserDto } from '@/types/api/users'

const AddUsuario = () => {
  const router = useRouter()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const createMutation = useCreateUser()
  const { showSuccess, showError } = useSnackbar()

  useEffect(() => {
    setCreateDialogOpen(true)
  }, [])

  const handleCreateUser = async (data: CreateUserDto) => {
    try {
      await createMutation.mutateAsync(data)
      setCreateDialogOpen(false)
      showSuccess('Usuario creado correctamente')
      router.push('/usuarios/list')
    } catch (error: any) {
      console.error('Error al crear usuario:', error)
      showError(error?.response?.data?.message || 'Error al crear usuario')
    }
  }

  const handleCancel = () => {
    setCreateDialogOpen(false)
    router.push('/usuarios/list')
  }

  return (
    <CreateUserDialog
      open={createDialogOpen}
      onClose={handleCancel}
      onSubmit={handleCreateUser}
      isLoading={createMutation.isPending}
    />
  )
}

export default AddUsuario
