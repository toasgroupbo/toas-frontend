export interface RouteOffice {
  id: number
  city: string
  url_gps: string
  createdAt?: string
  place?: {
    id: number
    name: string
  }
}

export interface Route {
  id: string
  isActive: boolean
  pass_by: string[]
  officeOrigin: RouteOffice
  officeDestination: RouteOffice
}

export interface CreateRouteDto {
  officeOriginId: number
  officeDestinationId: number
  pass_by: string[]
}

export interface UpdateRouteDto {
  officeOriginId?: number
  officeDestinationId?: number
  pass_by?: string[]
}
