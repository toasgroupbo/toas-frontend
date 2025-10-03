export interface DatosTuristicoFormulario {
  resenia_es?: string | null
  resenia_en?: string | null
  precios_es?: string | null
  precios_en?: string | null
  horarios_es?: string | null
  horarios_en?: string | null
  telefono?: string | null
  celular?: string | null
  relevancia?: number
  sub_categoria_id: number
}

export interface DatosTuristico {
  id: number
  resenia_es: string
  resenia_en: string
  relevancia: number
  horarios_es: string | null
  horarios_en: string | null
  precios_es: string | null
  precios_en: string | null
  telefono?: string | null
  celular?: string | null
  verificado: boolean
}

export interface CrearLugarTuristico extends DatosTuristicoFormulario {
  id: number
}

export interface ActualizarLugarTuristico extends DatosTuristicoFormulario {
  id: number
}

export interface SubcategoriaAnidada {
  sub_categoria: {
    id: number
    nombre_es: string
    nombre_en: string
  }
}

export interface LugarTuristico {
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
  l_turistico: DatosTuristico | null
}

export interface LugarTuristicoWithActionsType extends LugarTuristico {
  actions?: string
}

export interface SubcategoriaTuristico {
  id: number
  nombre_es: string
  nombre_en: string
  estado: boolean
}

export interface RespuestaLugaresTuristico {
  statusCode: number
  message: string
  data: {
    items: LugarTuristico[]
    totalItems: number
    currentPage: number
    totalPages: number
    pageSize: number
    appliedFilter: string | null
  }
  error: boolean
}

export interface RespuestaSubcategoriasTuristico {
  statusCode: number
  message: string
  data: {
    items: SubcategoriaTuristico[]
  }
}

export interface FiltrosTuristico {
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

export interface CrearActualizarTuristico {
  resenia_es: string
  resenia_en: string
  relevancia?: number
  horarios_es?: string | null
  horarios_en?: string | null
  precios_es?: string | null
  precios_en?: string | null
  telefono?: string | null
  celular?: string | null
  sub_categoria_id: number
}
