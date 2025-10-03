// hooks/useEventoActividad.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import { useAuth } from '@/contexts/AuthContext'

import type { Evento, CreateEventoRequest, UpdateEventoRequest, EventoResponse } from '@/types/api/evento'
import type {
  Actividad,
  CreateActividadRequest,
  UpdateActividadRequest,
  Lugar,
  ActividadDetalle
} from '@/types/api/actividades'

export interface PerfilNegocio {
  id: number
  nombre_publicador: string
  lugar: {
    id: number
    nombre_es: string
  }
}

export interface PerfilesNegocioResponse {
  statusCode: number
  message: string
  data: PerfilNegocio[]
  error: boolean
}

export interface LugaresBuscadorResponse {
  statusCode: number
  message: string
  data: Lugar[]
}

export interface FormularioEventoActividad {
  fecha: string
  nombre_dia_es: string
  nombre_dia_en: string
  descripcion_dia_es: string
  descripcion_dia_en: string

  nombre_actividad_es: string
  nombre_actividad_en: string
  descripcion_actividad_es: string
  descripcion_actividad_en: string
  programa_es: string
  programa_en: string
  horaInicio: string
  horaFin: string

  lugares: number[]
  tipo_id?: number
  perfil_negocio_id: number

  actividadId?: number
}

export interface EstadoFormulario {
  evento?: Evento
  actividad?: ActividadDetalle
  modoEvento: 'crear' | 'actualizar'
  modoActividad: 'crear' | 'actualizar'
  actividadId?: number
}

export const useEventoActividad = () => {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const buscarEventoPorFecha = async (fecha: string): Promise<Evento | null> => {
    try {
      const response = await api.get('api/admin/eventos-actividad')
      const eventos: Evento[] = response.data?.data || []
      const eventoExistente = eventos.find(evento => evento.fecha?.split('T')[0] === fecha)

      return eventoExistente || null
    } catch (error) {
      console.error('Error buscando evento por fecha:', error)

      return null
    }
  }

  const cargarDatosFormulario = async (fecha: string, actividadId?: number): Promise<EstadoFormulario> => {
    try {
      let evento: Evento | null = null
      let actividad: ActividadDetalle | null = null
      let fechaABuscar = fecha

      if (actividadId) {
        try {
          const actividadResponse = await api.get(`api/admin/actividades/${actividadId}`)
          const actividadCompleta = actividadResponse.data?.data || actividadResponse.data

          actividad = actividadCompleta

          const eventoIncluido = actividadCompleta?.evento

          if (!fechaABuscar && eventoIncluido?.fecha) {
            fechaABuscar = eventoIncluido.fecha.split('T')[0]
            evento = eventoIncluido
          } else if (fechaABuscar) {
            if (eventoIncluido?.fecha?.split('T')[0] === fechaABuscar) {
              evento = eventoIncluido
            } else {
              evento = await buscarEventoPorFecha(fechaABuscar)
            }
          }
        } catch (error) {
          console.error('Error cargando actividad existente:', error)
          throw new Error(`No se pudo cargar la actividad ${actividadId}`)
        }
      } else if (fechaABuscar) {
        evento = await buscarEventoPorFecha(fechaABuscar)
      }

      const estado: EstadoFormulario = {
        evento: evento || undefined,
        actividad: actividad || undefined,
        modoEvento: evento ? 'actualizar' : 'crear',
        modoActividad: actividadId ? 'actualizar' : 'crear',
        actividadId
      }

      return estado
    } catch (error) {
      console.error('Error cargando datos del formulario:', error)
      throw error
    }
  }

  const traducirFechaAlIngles = (fechaEspanol: string): string => {
    const traducciones = {
      Lunes: 'Monday',
      Martes: 'Tuesday',
      Miércoles: 'Wednesday',
      Jueves: 'Thursday',
      Viernes: 'Friday',
      Sábado: 'Saturday',
      Domingo: 'Sunday',
      enero: 'January',
      febrero: 'February',
      marzo: 'March',
      abril: 'April',
      mayo: 'May',
      junio: 'June',
      julio: 'July',
      agosto: 'August',
      septiembre: 'September',
      octubre: 'October',
      noviembre: 'November',
      diciembre: 'December',
      de: 'of'
    }

    let resultado = fechaEspanol

    Object.entries(traducciones).forEach(([esp, ing]) => {
      resultado = resultado.replace(new RegExp(esp, 'gi'), ing)
    })

    return resultado
  }

  const guardarFormularioCompleto = useMutation({
    mutationFn: async (data: FormularioEventoActividad): Promise<{ evento: Evento; actividad: Actividad }> => {
      try {
        let evento: Evento

        const estadoFormulario = await cargarDatosFormulario(data.fecha, data.actividadId)

        if (estadoFormulario.modoEvento === 'crear') {
          const nuevoEvento: CreateEventoRequest = {
            nombre_es: data.nombre_dia_es,
            nombre_en: data.nombre_dia_en || traducirFechaAlIngles(data.nombre_dia_es),
            descripcion_es: data.descripcion_dia_es,
            descripcion_en: data.descripcion_dia_en,
            fecha: `${data.fecha}T00:00:00-04:00`,
            relevancia: 0
          }

          const eventoResponse = await api.post<EventoResponse>('api/admin/eventos', nuevoEvento)

          evento = eventoResponse.data?.data || eventoResponse.data
        } else {
          if (!estadoFormulario.evento?.id) {
            throw new Error('No se encontró el evento para actualizar')
          }

          const updateEvento: UpdateEventoRequest = {
            nombre_es: data.nombre_dia_es,
            nombre_en: data.nombre_dia_en || traducirFechaAlIngles(data.nombre_dia_es),
            descripcion_es: data.descripcion_dia_es,
            descripcion_en: data.descripcion_dia_en,
            fecha: `${data.fecha}T00:00:00-04:00`,
            relevancia: 0
          }

          const eventoResponse = await api.patch<EventoResponse>(
            `api/admin/eventos/${estadoFormulario.evento.id}`,
            updateEvento
          )

          evento = eventoResponse.data?.data || eventoResponse.data
        }

        if (!evento?.id) {
          throw new Error('No se pudo obtener el ID del evento')
        }

        let actividad: Actividad

        if (estadoFormulario.modoActividad === 'actualizar' && data.actividadId) {
          const updateActividad: UpdateActividadRequest = {
            nombre_es: data.nombre_actividad_es,
            nombre_en: data.nombre_actividad_en,
            descripcion_es: data.descripcion_actividad_es,
            descripcion_en: data.descripcion_actividad_en,
            programa_es: data.programa_es,
            programa_en: data.programa_en,
            horaInicio: data.horaInicio,
            horaFin: data.horaFin,
            evento_id: evento.id,
            lugares: data.lugares.length > 0 ? data.lugares : [],
            tipo_id: data.tipo_id || undefined,
            perfil_negocio_id: data.perfil_negocio_id
          }

          const actividadResponse = await api.patch(`api/admin/actividades/${data.actividadId}`, updateActividad)

          actividad = actividadResponse.data?.data || actividadResponse.data
        } else {
          const nuevaActividad: CreateActividadRequest = {
            nombre_es: data.nombre_actividad_es,
            nombre_en: data.nombre_actividad_en,
            descripcion_es: data.descripcion_actividad_es,
            descripcion_en: data.descripcion_actividad_en,
            programa_es: data.programa_es,
            programa_en: data.programa_en,
            horaInicio: data.horaInicio,
            horaFin: data.horaFin,
            evento_id: evento.id,
            lugares: data.lugares.length > 0 ? data.lugares : [],
            tipo_id: data.tipo_id || undefined,
            perfil_negocio_id: data.perfil_negocio_id
          }

          const actividadResponse = await api.post('api/admin/actividades', nuevaActividad)

          actividad = actividadResponse.data?.data || actividadResponse.data
        }

        return { evento, actividad }
      } catch (error) {
        console.error('Error guardando formulario completo:', error)
        throw error
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] })
      queryClient.invalidateQueries({ queryKey: ['actividades'] })

      queryClient.invalidateQueries({ queryKey: ['formulario-evento-actividad'] })

      if (variables.actividadId) {
        queryClient.invalidateQueries({
          queryKey: ['formulario-evento-actividad', variables.fecha, variables.actividadId]
        })

        queryClient.invalidateQueries({
          queryKey: ['formulario-evento-actividad', '', variables.actividadId]
        })
      }
    }
  })

  const useDatosFormulario = (fecha: string, actividadId?: number) => {
    return useQuery({
      queryKey: ['formulario-evento-actividad', fecha, actividadId],
      queryFn: () => cargarDatosFormulario(fecha, actividadId),
      enabled: (!!fecha || !!actividadId) && isAuthenticated,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: false
    })
  }

  const useTiposActividad = () => {
    return useQuery({
      queryKey: ['tipos-actividad'],
      queryFn: async () => {
        const response = await api.get('api/admin/tipo-actividades')

        return response.data?.data || response.data
      },
      enabled: isAuthenticated
    })
  }

  const useBuscarLugares = (filtro?: string, enabled: boolean = true) => {
    return useQuery({
      queryKey: ['lugares-buscar', filtro],
      queryFn: async () => {
        if (!filtro || filtro.trim().length < 2) {
          return []
        }

        const response = await api.get<LugaresBuscadorResponse>('/api/admin/lugares-buscador', {
          params: {
            limit: 10,
            offset: 0,
            filter: filtro.trim()
          }
        })

        /* 
        console.log('Búsqueda lugares response:', response.data) */

        return response.data?.data || []
      },
      enabled: isAuthenticated && enabled && !!filtro && filtro.trim().length >= 4,
      staleTime: 30000
    })
  }

  const usePerfilesNegocio = (enabled: boolean = true) => {
    return useQuery({
      queryKey: ['perfiles-negocio'],
      queryFn: async () => {
        const response = await api.get<PerfilesNegocioResponse>('/api/auth/perfiles-negocio')

        return response.data?.data || []
      },
      enabled: isAuthenticated && enabled
    })
  }

  return {
    cargarDatosFormulario,
    guardarFormularioCompleto: guardarFormularioCompleto.mutateAsync,
    traducirFechaAlIngles,

    isGuardando: guardarFormularioCompleto.isPending,
    errorGuardando: guardarFormularioCompleto.error,

    useDatosFormulario,
    useTiposActividad,
    useBuscarLugares,

    usePerfilesNegocio,

    refetchAll: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] })
      queryClient.invalidateQueries({ queryKey: ['actividades'] })
      queryClient.invalidateQueries({ queryKey: ['formulario-evento-actividad'] })
      queryClient.invalidateQueries({ queryKey: ['perfiles-negocio'] })
      queryClient.invalidateQueries({ queryKey: ['lugares-buscar'] })
      queryClient.invalidateQueries({ queryKey: ['lugares-por-ids'] })
    }
  }
}
