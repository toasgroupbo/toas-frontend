import type { Route } from './rutas'

export interface TravelSeat {
  id: number
  row: number
  column: number
  deck: number
  price: string
  seatNumber: string
  type: string
  sale_type: string
  status: string
  travel_status: string
  reserve_expiresAt: string | null
  createdAt: string
}

export interface TravelBus {
  id: number
  name: string
  plaque: string
  equipment: string[]
  interior_image: string
  exterior_image: string
  brand: string
  model: string
  decks: boolean
  createdAt: string
}

export interface Travel {
  id: number
  departure_time: string
  arrival_time: string
  price_deck_1: string
  price_deck_2: string
  travel_status: string
  bus: TravelBus
  travelSeats: TravelSeat[]
  route: Route
}

export interface CreateTravelDto {
  busId: number
  routeId: number
  price_deck_1: string
  price_deck_2: string
  departure_time: string
  arrival_time: string
}

export interface UpdateTravelDto {
  busId?: number
  routeId?: number
  price_deck_1?: string
  price_deck_2?: string
  departure_time?: string
  arrival_time?: string
}
