export interface Evento {
  id?: number
  nombre_es: string
  nombre_en?: string
  descripcion_es?: string
  descripcion_en?: string
  fecha: string
  relevancia?: number
  created_at?: string
  updated_at?: string
}

export interface CreateEventoRequest {
  nombre_es: string
  nombre_en?: string
  descripcion_es?: string
  descripcion_en?: string
  fecha: string
  relevancia?: number
}

export interface UpdateEventoRequest {
  id?: number
  nombre_es?: string
  nombre_en?: string
  descripcion_es?: string
  descripcion_en?: string
  fecha?: string
  relevancia?: number
}

export interface EventosResponse {
  data: Evento[]
  total?: number
  page?: number
  limit?: number
}

export interface EventoResponse {
  data: Evento
}
