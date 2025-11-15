export enum OfficePlaces {
  SANTA_CRUZ = 'Santa Cruz de la Sierra',
  MONTERO = 'Montero',
  WARNES = 'Warnes',
  COTOCA = 'Cotoca',
  LA_GUARDIA = 'La Guardia',
  EL_TORNO = 'El Torno',
  MINEROS = 'Mineros'
}

export interface Office {
  id: string
  name: string
  place: OfficePlaces
  createdAt?: string
  deletedAt?: string | null
  company?: {
    id: string
  }
}

export interface CreateOfficeDto {
  name: string
  place: string
}

export interface UpdateOfficeDto {
  name?: string
  place?: string
}
