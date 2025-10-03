export interface DatosServicioFormulario {
  horarios_es?: string | null
  horarios_en?: string | null
  telefono?: string | null
  celular?: string | null
  sitio_web?: string | null
  sub_categoria_id: number
}

export interface DatosServicio {
  id: number
  horarios_es: string
  horarios_en: string
  telefono: string | null
  celular: string
  sitio_web: string
}

export interface CrearLugarServicio extends DatosServicioFormulario {
  id: number
}

export interface ActualizarLugarServicio extends DatosServicioFormulario {
  id: number
}

export interface CategoriaAnidada {
  categoria: {
    id: number
    nombre_es: string
    nombre_en: string
  }
}

export interface SubcategoriaAnidada {
  sub_categoria: {
    id: number
    nombre_es: string
    nombre_en: string
  }
}

export interface LugarServicio {
  id: number
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
  createdBy: number
  updatedBy: number
  categorias: CategoriaAnidada[]
  sub_categorias: SubcategoriaAnidada[]
  l_servicio: DatosServicio | null
}

export interface LugarServicioWithActionsType extends LugarServicio {
  actions?: string
}

export interface SubcategoriaServicio {
  id: number
  nombre_es: string
  nombre_en: string
  estado: boolean
}

export interface RespuestaLugaresServicio {
  statusCode: number
  message: string
  data: {
    items: LugarServicio[]
    totalItems: number
    currentPage: number
    totalPages: number
    pageSize: number
    appliedFilter: string
  }
  error: boolean
}

export interface RespuestaSubcategoriasServicio {
  statusCode: number
  message: string
  data: {
    items: SubcategoriaServicio[]
  }
}

export interface FiltrosServicio {
  limit?: number
  offset?: number
  filter?: string
  sub_categoria_id?: number | null
}

export interface RespuestaOperacion {
  statusCode: number
  message: string
  data?: any
}

export interface CrearActualizarServicio {
  horarios_es: string
  horarios_en: string
  telefono?: string | null
  celular: string
  sitio_web: string
  sub_categoria_id: number
}
