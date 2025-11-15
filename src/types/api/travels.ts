import type { Bus } from './buses'
import type { Route } from './rutas'

export interface Travel {
  id: string
  bus: Bus
  route: Route
  price_deck_1: string
  price_deck_2: string
  departure_time: string
  arrival_time: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTravelDto {
  busUUID: string
  routeUUID: string
  price_deck_1: string
  price_deck_2: string
  departure_time: string
  arrival_time: string
}
