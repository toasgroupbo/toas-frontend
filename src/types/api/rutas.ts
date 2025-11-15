export interface RouteOffice {
  id: string
  name: string
  place: string
}

export interface Route {
  id: string
  isActive: boolean
  pass_by: string[]
  officeOrigin: RouteOffice
  officeDestination: RouteOffice
}

export interface CreateRouteDto {
  officeOriginUUID: string
  officeDestinationUUID: string
  pass_by: string[]
}

export interface UpdateRouteDto {
  officeOriginUUID?: string
  officeDestinationUUID?: string
  pass_by?: string[]
}
