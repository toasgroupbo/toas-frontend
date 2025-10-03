export interface Actividad {
  id?: number
  nombre_es: string
  nombre_en: string
  descripcion_es: string
  descripcion_en: string
  programa_es: string
  programa_en: string
  horaInicio: string
  horaFin: string
  estado?: string
  tipo_id?: number
  evento_id: number
  perfil_negocio_id: number
  createdBy?: number
  updatedBy?: number
  tipo_es?: string | null
  tipo_en?: string | null
  lugares?: number[]

  evento?: {
    id: number
    nombre_es: string
    nombre_en: string
    descripcion_es: string
    descripcion_en: string
    relevancia: number
    fecha: string
  }

  perfil_negocio?: {
    id: number
    nombre_publicador: string
  }

  created_at?: string
  updated_at?: string
}

export interface CreateActividadRequest {
  nombre_es: string
  nombre_en: string
  descripcion_es: string
  descripcion_en: string
  programa_es: string
  programa_en: string
  horaInicio: string
  horaFin: string
  evento_id: number
  lugares?: number[]
  tipo_id?: number
  perfil_negocio_id: number
}

export interface UpdateActividadRequest {
  nombre_es?: string
  nombre_en?: string
  descripcion_es?: string
  descripcion_en?: string
  programa_es?: string
  programa_en?: string
  horaInicio?: string
  horaFin?: string
  evento_id?: number
  lugares?: number[]
  tipo_id?: number
  perfil_negocio_id: number
}

export interface ActividadesResponse {
  statusCode: number
  message: string
  error: boolean
  data: {
    items: Actividad[]
    currentPage: number
    totalItems: number
    pageSize: number
    totalPages: number
    appliedFilter: any
  }
}

export interface ActividadResponse {
  statusCode: number
  message: string
  error: boolean
  data: Actividad
}

export interface TipoActividad {
  id: number
  tipo_es: string
  tipo_en: string
  descripcion?: string
}

export interface Lugar {
  id: number
  nombre: string
  nombre_es?: string
  nombre_en?: string
  capacidad?: number
  ubicacion?: string
}

export interface ActividadDetalle extends Omit<Actividad, 'lugares'> {
  lugares?: {
    lugar: {
      id: number
      nombre_es: string
      nombre_en?: string
    }
  }[]
  perfil_negocio?: {
    id: number
    nombre_publicador: string
  }
  createdBy?: number
  updatedBy?: number
  estado?: string
}

export interface ActividadDetalleResponse {
  statusCode: number
  message: string
  error: boolean
  data: ActividadDetalle
}
