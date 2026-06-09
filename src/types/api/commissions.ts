export interface CommissionCompany {
  id: number
  name: string
  logo: string
  commission_app: number
  commission_company: string
  hours_before_closing: number
  createdAt: string
  enabled: boolean
}

export interface CommissionOffice {
  id: number
  name: string
  address: string
}

export interface CommissionRoute {
  id: number
  officeOrigin?: CommissionOffice
  officeDestination?: CommissionOffice
}

export interface CommissionBus {
  id: number
  name: string
  plaque: string
}

export interface CommissionTravel {
  id: number
  departure_time: string
  arrival_time: string
  price_deck_1: string
  price_deck_2: string
  travel_status: string
  type: string
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
  drivers: Array<{ ci: string; name: string; phone: string }>
  assistants: Array<{ ci: string; name: string; phone: string }>
  enabled: boolean
  company: CommissionCompany
  route?: CommissionRoute
  bus?: CommissionBus
}

export interface Commission {
  id: number
  commission_company: string
  tickets_app_count: number
  commission_app_total: string
  commission_company_total: string
  departure_time: string
  createdAt: string
  travel: CommissionTravel
}

export interface CommissionsFilters {
  startDate?: string
  endDate?: string
  search?: string
  companyId?: number
  page?: number
  limit?: number
}

export interface UpdateCommissionPayload {
  paid: string
  voucherUrl?: string
  paidAt?: string
}

export interface CommissionsTotals {
  total_commission_app?: string
  total_commission_company: string
}

export interface CommissionsMeta {
  total: number
  page: number
  lastPage: number
  limit: number
  offset: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface CommissionsResponse {
  data: Commission[]
  meta: CommissionsMeta
  totals: CommissionsTotals
}
