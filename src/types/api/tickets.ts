import type { Travel } from './travels'
import type { Customer } from './customers'

export interface SeatSelection {
  seatId: string
  price?: string
}

export interface Passenger {
  ci: string
  name: string
}

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
  createdAt: string
  passenger: Passenger | null
}

export interface Buyer {
  id: number
  email: string | null
  name: string
  ci: string
  phone: string | null
  is_verified: boolean
  provider: string | null
  idProvider: string | null
  birthDate: string | null
  photo: string | null
  createdAt: string
}

export interface User {
  id: number
  email: string
  fullName: string
  ci: string
  phone: string
  sessionToken?: string
  createdAt: string
}

export interface TicketSeat {
  deck: any
  id: number
  seatNumber: string
  price: string
}

export interface Billing {
  id: number
  nombre: string
  ci: string
  createdAt: string
}

export interface Place {
  id: number
  name: string
  createdAt: string
}

export interface Office {
  id: number
  url_gps: string
  name: string
  address: string
  enabled: boolean
  createdAt: string
  place: Place
}

export interface Route {
  id: number
  isActive: boolean
  pass_by: string[]
  travel_hours: number
  enabled: boolean
  createdAt: string
  officeOrigin: Office
  officeDestination: Office
}

export interface TravelCompany {
  id: number
  name: string
  logo: string
  commission: number
  hours_before_closing: number
  createdAt: string
}

export interface TravelBus {
  id: number
  name: string
  plaque: string
}

export interface TicketTravel {
  id: number
  departure_time: string
  arrival_time: string
  price_deck_1: string
  price_deck_2: string
  travel_status: string
  type: string
  enabled: boolean
  lane: number
  closedAt: string | null
  isPaid: boolean
  paidAt: string | null
  total: string
  total_commission: string
  net_to_company: string
  cash_amount: string
  qr_amount: string
  app_amount: string
  tickets_app_count: number
  tickets_office_count: number
  tickets_count: number
  drivers: any
  assistants: any
  route: Route
  company: TravelCompany
  bus?: TravelBus
}

export interface Ticket {
  id: number
  type: string
  payment_type?: 'qr' | 'cash'
  status: string
  total_price: string
  seats: TicketSeat[]
  reserve_expiresAt: string | null
  createdAt: string
  travelSeats: TravelSeat[]
  buyer: Buyer | null
  confirmedAt?: string | null
  cancelledAt?: string | null
  travel?: TicketTravel
  customer?: Customer
  soldBy?: User
  canceledBy?: User | null
  commission?: string
  wallet_amount?: string
  qr_amount?: string
  past?: boolean
  billing?: Billing
}

export interface BillingInfo {
  ci: string
  nombre: string
}

export interface CreateTicketDto {
  travelId: number
  seatSelections: SeatSelection[]
  billing: BillingInfo
  payment_type: 'qr' | 'cash'
}

export interface TicketsResponse {
  tickets: Ticket[]
  total: number
}
