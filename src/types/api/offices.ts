export enum BoliviaCities {
  SANTA_CRUZ = 'Santa Cruz de la Sierra',
  COCHABAMBA = 'Cochabamba',
  CHUQUISACA = 'Chuquisaca',
  LA_PAZ = 'La Paz',
  POTOSI = 'Potosi',
  TARIJA = 'Tarija',
  PANDO = 'Pando',
  ORURO = 'Oruro',
  BENI = 'Beni'
}

export interface Place {
  id: number
  name: string
  createdAt?: string
  updatedAt?: string
}

export interface Office {
  id: number
  url_gps: string
  city: string
  name: string | null
  address: string | null
  subsidiary: string
  place: Place
  createdAt?: string
  deletedAt?: string | null
  company?: {
    id: string
  }
}

export interface CreateOfficeDto {
  url_gps: string
  city: string
  name: string
  address: string
  subsidiary: string
  placeId: number
}

export interface UpdateOfficeDto {
  url_gps?: string
  city?: string
  name?: string
  address?: string
  subsidiary?: string
  placeId?: number
}
