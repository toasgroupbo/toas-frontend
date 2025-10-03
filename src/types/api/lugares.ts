export interface LugarBusqueda {
  id: number
  nombre_es: string
  nombre_en?: string
  direccion?: string
}

export interface Lugar {
  id?: number
  nombre_es: string
  nombre_en: string
  descripcion_es: string
  descripcion_en: string
  direccion: string
  ubicacion: string | null
  imagenes: string[]
  url_ubicacion: string | null
  estado: boolean
  verificado: boolean
  createdBy?: number
  updatedBy?: number
  created_at?: string
  updated_at?: string
}

export interface CreateLugarRequest {
  nombre_es: string
  nombre_en: string
  descripcion_es: string
  descripcion_en: string
  direccion: string
  ubicacion: string
  imagenes: string[]
  url_ubicacion: string
  estado: boolean
}

export interface UpdateLugarRequest {
  id: number
  nombre_es?: string
  nombre_en?: string
  descripcion_es?: string
  descripcion_en?: string
  direccion?: string
  ubicacion?: string
  imagenes?: string[]
  url_ubicacion?: string
  estado?: boolean
}

export interface LugaresResponse {
  data: {
    items: Lugar[]
    totalItems: number
    currentPage: number
    totalPages: number
    pageSize: number
    appliedFilter: string | null
  }
}

export interface LugarResponse {
  data: Lugar
}
