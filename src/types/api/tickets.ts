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
  travel?: Travel
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
