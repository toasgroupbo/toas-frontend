export interface DatosEntretenimientoFormulario {
  servicios_es: string | null
  servicios_en: string | null
  horarios_es: string | null
  horarios_en: string | null
  telefono: string | null
  celular: string | null
  sitio_web: string | null

  sub_categoria_id: number
}

export interface DatosEntretenimiento {
  id: number
  servicios_es: string
  servicios_en: string
  horarios_es: string
  horarios_en: string
  telefono: string | null
  celular: string | null
  sitio_web: string | null
}

export interface CrearLugarEntretenimiento extends DatosEntretenimientoFormulario {
  id: number
}

export interface ActualizarLugarEntretenimiento extends DatosEntretenimientoFormulario {
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

export interface LugarEntretenimiento {
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
  l_entretenimiento: DatosEntretenimiento | null
}

export interface LugarEntretenimientoWithActionsType extends LugarEntretenimiento {
  actions?: string
}

export interface SubcategoriaEntretenimiento {
  id: number
  nombre_es: string
  nombre_en: string
  estado: boolean
}

export interface RespuestaLugaresEntretenimiento {
  statusCode: number
  message: string
  data: {
    items: LugarEntretenimiento[]
    totalItems: number
    currentPage: number
    totalPages: number
    pageSize: number
    appliedFilter: string
  }
  error: boolean
}

export interface RespuestaSubcategoriasEntretenimiento {
  statusCode: number
  message: string
  data: {
    items: SubcategoriaEntretenimiento[]
  }
}

export interface FiltrosEntretenimiento {
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

export interface CrearActualizarEntretenimiento {
  servicios_es: string
  servicios_en: string
  horarios_es: string
  horarios_en: string
  telefono?: string | null
  celular?: string | null
  sitio_web?: string | null

  sub_categoria_id: number
}
