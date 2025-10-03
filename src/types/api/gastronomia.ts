export interface DatosGastronomiaFormulario {
  especialidad_es?: string | null
  especialidad_en?: string | null
  precios_es?: string | null
  precios_en?: string | null
  otros_servicios_es?: string | null
  otros_servicios_en?: string | null
  horarios_es?: string | null
  horarios_en?: string | null
  telefono?: string | null
  celular?: string | null
  correo?: string | null
  sitio_web?: string | null

  sub_categoria_id: number
}
export interface DatosGastronomia {
  id: number
  especialidad_es: string
  especialidad_en: string
  precios_es: string
  precios_en: string
  otros_servicios_es: string
  otros_servicios_en: string
  horarios_es: string
  horarios_en: string
  telefono: string | null
  celular: string | null
  correo: string | null
  sitio_web: string | null
}

export interface CrearLugarGastronomico extends DatosGastronomiaFormulario {
  id: number
}

export interface ActualizarLugarGastronomico extends DatosGastronomiaFormulario {
  id: number
}

export interface SubcategoriaAnidada {
  sub_categoria: {
    id: number
    nombre_es: string
    nombre_en: string
  }
}

export interface LugarGastronomia {
  id: number
  nombre_es: string
  nombre_en: string
  descripcion_es: string
  descripcion_en: string
  direccion: string
  ubicacion: string
  imagenes: string[]
  url_ubicacion: string | null
  estado: boolean
  verificado: boolean
  createdBy: number
  updatedBy: number
  sub_categorias: SubcategoriaAnidada[]
  l_gastronomia: DatosGastronomia | null
}

export interface LugarGastronomiaWithActionsType extends LugarGastronomia {
  actions?: string
}

export interface SubcategoriaGastronomia {
  id: number
  nombre_es: string
  nombre_en: string
  estado: boolean
}

export interface RespuestaLugaresGastronomia {
  statusCode: number
  message: string
  data: {
    items: LugarGastronomia[]
    totalItems: number
    currentPage: number
    totalPages: number
    pageSize: number
    appliedFilter: string | null
  }
  error: boolean
}

export interface RespuestaSubcategoriasGastronomia {
  statusCode: number
  message: string
  data: {
    items: SubcategoriaGastronomia[]
  }
}

export interface FiltrosGastronomia {
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
