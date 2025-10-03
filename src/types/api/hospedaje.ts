export interface DatosHospedajeFormulario {
  calificacion?: number
  otros_servicios_es?: string | null
  otros_servicios_en?: string | null
  telefono?: string | null
  celular?: string | null
  correo?: string | null
  sitio_web?: string | null
  sub_categoria_id: number
}

export interface DatosHospedaje {
  id: number
  calificacion?: number | null
  otros_servicios_es?: string | null
  otros_servicios_en?: string | null
  telefono?: string | null
  celular?: string | null
  correo?: string | null
  sitio_web?: string | null
}

export interface CrearLugarHospedaje extends DatosHospedajeFormulario {
  id: number
}

export interface ActualizarLugarHospedaje extends DatosHospedajeFormulario {
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

export interface LugarHospedaje {
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
  l_hospedaje: DatosHospedaje | null
}

export interface LugarHospedajeWithActionsType extends LugarHospedaje {
  actions?: string
}

export interface SubcategoriaHospedaje {
  id: number
  nombre_es: string
  nombre_en: string
  estado: boolean
}

export interface RespuestaLugaresHospedaje {
  statusCode: number
  message: string
  data: {
    items: LugarHospedaje[]
    totalItems: number
    currentPage: number
    totalPages: number
    pageSize: number
    appliedFilter: string
  }
  error: boolean
}

export interface RespuestaSubcategoriasHospedaje {
  statusCode: number
  message: string
  data: {
    items: SubcategoriaHospedaje[]
  }
}

export interface FiltrosHospedaje {
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

export interface CrearActualizarHospedaje {
  calificacion?: number | null
  otros_servicios_es?: string | null
  otros_servicios_en?: string | null
  telefono?: string | null
  celular?: string | null
  correo?: string | null
  sitio_web?: string | null
  sub_categoria_id: number
}
