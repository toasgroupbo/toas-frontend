import type { Travel } from './travels'
import type { Customer } from './customers'

export interface SeatSelection {
  seatId: string
  price?: string
}

export interface Ticket {
  id: number
  type: string
  status: string
  total_price: string
  createdAt: string
  reserve_expiresAt: string | null
  confirmedAt?: string | null
  cancelledAt?: string | null
  travel?: Travel
  customer?: Customer
  seats: TicketSeat[]
}

export interface TicketSeat {
  id?: number
  seatNumber: string
  price: string
  deck?: number
}

export interface CreateTicketDto {
  travelId: number
  seatSelections: SeatSelection[]
  customerId: number
}

export interface TicketsResponse {
  tickets: Ticket[]
  total: number
}
