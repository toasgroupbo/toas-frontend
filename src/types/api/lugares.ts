export interface Place {
  id: number
  name: string
  createdAt: string
}

export interface CreatePlaceDto {
  name: string
}

export interface UpdatePlaceDto {
  name: string
}
