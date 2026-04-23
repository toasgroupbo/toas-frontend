// types/api/travels.ts

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

export type TravelType = 'normal' | 'habilitada'

export interface Travel {
  id: number
  departure_time: string
  arrival_time: string
  price_deck_1: string
  price_deck_2: string
  type: TravelType
  travel_status: string
  enabled: boolean
  bus: TravelBus
  travelSeats: TravelSeat[]
  route: Route
  seatsAvailable?: number
  closedAt?: string | null
  tickets_app_count?: number
  tickets_office_count?: number
  tickets_count?: number
  cash_amount?: string
  qr_amount?: string
  app_amount?: string
  total?: string
  total_commission?: string
  net_to_company?: string
  lane?: number
  isPaid?: boolean
  paidAt?: string | null
  drivers?: any[] | null
  assistants?: any[] | null
}

export interface CreateTravelDto {
  busId: number
  routeId: number
  price_deck_1: string
  price_deck_2: string
  type: TravelType
  lane: number
  departure_time: string
  arrival_time: string
}

export interface UpdateTravelDto {
  busId?: number
  routeId?: number
  price_deck_1?: string
  price_deck_2?: string
  type?: TravelType
  lane?: number
  departure_time?: string
  arrival_time?: string
}

export interface TravelsResponse {
  data: Travel[]
  meta: {
    total: number
    page: number
    lastPage: number
    limit: number
    offset: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  amounts: {
    office: number
    app: number
  }
}

export interface TravelFilters {
  status?: 'active' | 'closed'
  startDate?: string
  endDate?: string
  origin_placeId?: number
  destination_placeId?: number
  busId?: number
  routeId?: number
}
