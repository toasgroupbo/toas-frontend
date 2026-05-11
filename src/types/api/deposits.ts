export interface BankAccount {
  id: number
  bankCode: string
  account: string
  titularName: string
  branchOfficeId: number
  documentNumber: string
  documentType: string
  documentExtension: string
  createdAt: string
}

export interface TravelOwner {
  id: number
  name: string
  ci: string
  phone: string
  createdAt: string
  bankAccount: BankAccount
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
  owner: TravelOwner
}

export interface Driver {
  ci: string
  name: string
  phone: string
}

export interface TravelTransaction {
  id: number
  transactionId: string
  status: 'AUTHORIZED' | 'COMPLETED' | 'FAILED'
}

export interface Travel {
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
  drivers: Driver[] | null
  assistants: any[] | null
  bus: TravelBus
  transaction: TravelTransaction | null
}

export interface TravelsFilters {
  companyId?: number
  status?: string
  isPaid?: boolean
  startDate?: string
  endDate?: string
  origin_placeId?: number
  destination_placeId?: number
}
