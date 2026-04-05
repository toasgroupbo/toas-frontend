export interface Place {
  id: number
  name: string
  createdAt?: string
  updatedAt?: string
}

export interface Office {
  id: number
  url_gps: string
  name: string | null
  address: string | null
  place: Place
  createdAt?: string
  deletedAt?: string | null
  company?: {
    id: string
  }
}

export interface CreateOfficeDto {
  url_gps: string
  name: string
  address: string
  placeId: number
}

export interface UpdateOfficeDto {
  url_gps?: string
  name?: string
  address?: string
  placeId?: number
}
