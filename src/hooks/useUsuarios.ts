import { useState, useEffect, useCallback } from 'react'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import { useAuth } from '@/contexts/AuthContext'
import type {
  Usuario,
  CrearUsuario,
  ActualizarUsuario,
  RespuestaUsuarios,
  UsuarioResponse,
  FiltrosUsuarios,
  DatosUsuarioFormulario,
  PerfilNegocioExistente,
  RespuestaPerfilesNegocio
} from '@/types/api/usuarios'
import { Roles } from '@/types/api/usuarios'

export const useUsuarios = (page?: number, pageSize?: number, searchQuery?: string, enabled: boolean = true) => {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const usuariosQuery = useQuery<RespuestaUsuarios>({
    queryKey: ['usuarios-paginated', page, pageSize, searchQuery],
    queryFn: async () => {
      const params: any = {
        limit: pageSize || 10,
        offset: ((page || 1) - 1) * (pageSize || 10),
        filter: searchQuery || ''
      }

      const response = await api.get<RespuestaUsuarios>('/api/auth/usuarios', {
        params
      })

      return response.data
    },
    enabled: isAuthenticated && enabled && page !== undefined,
    placeholderData: previousData => previousData
  })

  const useGetUsuarios = (params?: FiltrosUsuarios) => {
    return useQuery({
      queryKey: ['usuarios', params],
      queryFn: async () => {
        const response = await api.get<RespuestaUsuarios>('/api/auth/usuarios', {
          params: {
            limit: 1000,
            offset: 0,
            filter: '',
            ...params
          }
        })

        return response.data?.data?.items || []
      },
      enabled: isAuthenticated
    })
  }

  const useGetUsuario = (id?: number) => {
    return useQuery({
      queryKey: ['usuario', id],
      queryFn: async () => {
        if (!id) return null
        const response = await api.get<UsuarioResponse>(`/api/auth/${id}`)

        return response.data?.data || response.data
      },
      enabled: isAuthenticated && !!id
    })
  }

  const useGetPerfilesNegocio = (enabled: boolean = true) => {
    return useQuery<PerfilNegocioExistente[]>({
      queryKey: ['perfiles-negocio'],
      queryFn: async () => {
        const response = await api.get<RespuestaPerfilesNegocio>('/api/auth/perfiles-negocio')

        return response.data.data || []
      },
      enabled: isAuthenticated && enabled,
      staleTime: 1000 * 60 * 10
    })
  }

  const useCreateUsuario = () => {
    const { userRole } = useAuth()

    return useMutation({
      mutationFn: async (data: CrearUsuario): Promise<Usuario> => {
        const datosLimpios = { ...data }

        if (['Admin_Negocio', 'Operador_Negocio'].includes(userRole)) {
          datosLimpios.perfil_negocio_id = undefined
          datosLimpios.nombre_publicador = undefined
          datosLimpios.lugar_id = undefined
        }

        const response = await api.post<UsuarioResponse>('/api/auth/registrar', datosLimpios)

        return response.data?.data || response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['usuarios'] })
        queryClient.invalidateQueries({ queryKey: ['usuarios-paginated'] })
      },
      onError: (error: any) => {
        console.error('Error creating usuario:', error)
        throw error
      }
    })
  }

  const useUpdateUsuario = () => {
    const { userRole } = useAuth()

    return useMutation({
      mutationFn: async (data: ActualizarUsuario): Promise<Usuario> => {
        const { id, ...updateData } = data

        const datosLimpios = { ...updateData }

        if (['Admin_Negocio', 'Operador_Negocio'].includes(userRole)) {
          datosLimpios.perfil_negocio_id = undefined
          datosLimpios.nombre_publicador = undefined
          datosLimpios.lugar_id = undefined
        }

        const response = await api.patch<UsuarioResponse>(`/api/auth/actualizar/${id}`, datosLimpios)

        return response.data?.data || response.data
      },
      onSuccess: data => {
        queryClient.invalidateQueries({ queryKey: ['usuarios'] })
        queryClient.invalidateQueries({ queryKey: ['usuarios-paginated'] })
        queryClient.invalidateQueries({ queryKey: ['usuario', data.id] })
      },
      onError: (error: any) => {
        console.error('Error updating usuario:', error)
        throw error
      }
    })
  }

  const useDeleteUsuario = () => {
    return useMutation({
      mutationFn: async (id: number): Promise<void> => {
        await api.delete(`/api/auth/eliminar/${id}`)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['usuarios'] })
        queryClient.invalidateQueries({ queryKey: ['usuarios-paginated'] })
      },
      onError: (error: any) => {
        console.error('Error deleting usuario:', error)
        throw error
      }
    })
  }

  const useToggleUsuarioEstado = () => {
    return useMutation({
      mutationFn: async ({ id, estado }: { id: number; estado: boolean }): Promise<Usuario> => {
        const response = await api.patch<UsuarioResponse>(`/api/auth/actualizar/${id}`, { estado })

        return response.data?.data || response.data
      },
      onSuccess: data => {
        queryClient.invalidateQueries({ queryKey: ['usuarios'] })
        queryClient.invalidateQueries({ queryKey: ['usuarios-paginated'] })
        queryClient.invalidateQueries({ queryKey: ['usuario', data.id] })
      },
      onError: (error: any) => {
        console.error('Error toggling usuario estado:', error)
        throw error
      }
    })
  }

  const useToggleUsuarioVerificacion = () => {
    return useMutation({
      mutationFn: async ({ id, verificado }: { id: number; verificado: boolean }): Promise<Usuario> => {
        const response = await api.patch<UsuarioResponse>(`/api/auth/actualizar/${id}`, { verificado })

        return response.data?.data || response.data
      },
      onSuccess: data => {
        queryClient.invalidateQueries({ queryKey: ['usuarios'] })
        queryClient.invalidateQueries({ queryKey: ['usuarios-paginated'] })
        queryClient.invalidateQueries({ queryKey: ['usuario', data.id] })
      },
      onError: (error: any) => {
        console.error('Error toggling usuario verification:', error)
        throw error
      }
    })
  }

  const useCambiarContrasenia = () => {
    return useMutation({
      mutationFn: async ({ id, contraseña }: { id: number; contraseña: string }): Promise<void> => {
        await api.patch(`/api/auth/cambiar-contrasenia/${id}`, { contraseña })
      },
      onSuccess: () => {},
      onError: (error: any) => {
        console.error('Error changing user password:', error)
        throw error
      }
    })
  }

  return {
    usuarios: usuariosQuery.data?.data?.items || [],
    total: usuariosQuery.data?.data?.totalItems || 0,
    currentPage: page || 1,
    totalPages: Math.ceil((usuariosQuery.data?.data?.totalItems || 0) / (pageSize || 10)),
    pageSize: pageSize || 10,
    isLoading: usuariosQuery.isLoading,
    isFetching: usuariosQuery.isFetching,
    error: usuariosQuery.error,

    useGetUsuarios,
    useGetUsuario,
    useGetPerfilesNegocio,
    useCreateUsuario,
    useUpdateUsuario,
    useDeleteUsuario,
    useToggleUsuarioEstado,
    useToggleUsuarioVerificacion,
    useCambiarContrasenia,

    refetchUsuarios: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      queryClient.invalidateQueries({ queryKey: ['usuarios-paginated'] })
    }
  }
}

// Hook especializado para filtros de usuarios
export const useUsuariosFilters = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [rolSeleccionado, setRolSeleccionado] = useState<string>('')
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>('')
  const [verificadoSeleccionado, setVerificadoSeleccionado] = useState<string>('')

  const resetFilters = useCallback(() => {
    setSearchQuery('')
    setRolSeleccionado('')
    setEstadoSeleccionado('')
    setVerificadoSeleccionado('')
    setCurrentPage(1)
  }, [])

  return {
    searchQuery,
    currentPage,
    pageSize,
    rolSeleccionado,
    estadoSeleccionado,
    verificadoSeleccionado,
    setSearchQuery: (query: string) => {
      setSearchQuery(query)
      setCurrentPage(1)
    },
    setCurrentPage,
    setPageSize: (size: number) => {
      setPageSize(size)
      setCurrentPage(1)
    },
    setRolSeleccionado: (rol: string) => {
      setRolSeleccionado(rol)
      setCurrentPage(1)
    },
    setEstadoSeleccionado: (estado: string) => {
      setEstadoSeleccionado(estado)
      setCurrentPage(1)
    },
    setVerificadoSeleccionado: (verificado: string) => {
      setVerificadoSeleccionado(verificado)
      setCurrentPage(1)
    },
    resetFilters
  }
}

export const useUsuarioForm = (usuarioId?: number) => {
  const { useGetUsuario } = useUsuarios()
  const { userRole } = useAuth()

  const [formData, setFormData] = useState<DatosUsuarioFormulario>({
    usuario: '',
    contraseña: '',
    confirmarContraseña: '',
    correo: '',
    estado: true,
    roles: '',
    perfil_negocio_id: 0,
    nombre_publicador: '',
    lugar_id: 0,
    tipoPublicador: 'perfil'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!usuarioId && usuarioId > 0
  const { data: usuarioExistente, isLoading } = useGetUsuario(isEditing ? usuarioId : undefined)

  useEffect(() => {
    if (isEditing && usuarioExistente && !isLoading) {
      setFormData({
        usuario: usuarioExistente.usuario || '',
        contraseña: '',
        confirmarContraseña: '',
        correo: usuarioExistente.correo || '',
        estado: usuarioExistente.estado ?? true,
        roles: usuarioExistente.roles || Roles.operador_negocio,
        perfil_negocio_id: usuarioExistente.perfil_negocio_id || 0,
        nombre_publicador: '',
        lugar_id: 0,
        tipoPublicador: 'perfil'
      })
    }
  }, [isEditing, usuarioExistente, isLoading])

  const updateField = (field: keyof DatosUsuarioFormulario, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const setFieldError = (field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const clearFieldError = (field: string) => {
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const resetForm = () => {
    setFormData({
      usuario: '',
      contraseña: '',
      confirmarContraseña: '',
      correo: '',
      estado: true,
      roles: '',
      perfil_negocio_id: 0,
      nombre_publicador: '',
      lugar_id: 0,
      tipoPublicador: 'perfil'
    })
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.usuario.trim()) {
      newErrors.usuario = 'El nombre de usuario es requerido'
    }

    if (!formData.roles) {
      newErrors.roles = 'Debe seleccionar un rol'
    }

    if (!isEditing && !formData.contraseña.trim()) {
      newErrors.contraseña = 'La contraseña es requerida'
    } else if (!isEditing && formData.contraseña.length < 6) {
      newErrors.contraseña = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (!isEditing && formData.contraseña !== formData.confirmarContraseña) {
      newErrors.confirmarContraseña = 'Las contraseñas no coinciden'
    }

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'El formato del correo no es válido'
    }

    if (!['Admin_Negocio', 'Operador_Negocio'].includes(userRole)) {
      if (formData.tipoPublicador === 'perfil') {
        if (!formData.perfil_negocio_id || formData.perfil_negocio_id === 0) {
          newErrors.perfil_negocio_id = 'Debe seleccionar un perfil de negocio'
        }
      } else {
        if (!formData.nombre_publicador.trim()) {
          newErrors.nombre_publicador = 'El nombre del publicador es requerido'
        }

        if (!formData.lugar_id || formData.lugar_id === 0) {
          newErrors.lugar_id = 'Debe seleccionar un lugar'
        }
      }
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  return {
    formData,
    errors,
    isEditing,
    isLoading,
    updateField,
    setFieldError,
    clearFieldError,
    resetForm,
    validateForm,
    usuarioExistente
  }
}
