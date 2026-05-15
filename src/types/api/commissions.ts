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

export interface Commission {
  id: number
  paid: string
  voucher: string | null
  paidAt: string | null
  total_trips_count: number
  tickets_app_count_total: number
  commission_app_total: string
  net_to_company: string
  commission_per_ticket_at_time: string
  date_to_pay: string
  period_start: string
  period_end: string
  period_key: string
  company: {
    id: number
    name: string
    logo: string
    commission_app: number
    commission_company: string
    hours_before_closing: number
    createdAt: string
    enabled: boolean
  }
}

export interface CommissionsFilters {
  isPaid?: boolean
  startDate?: string
  endDate?: string
  search?: string
}

export interface UpdateCommissionPayload {
  paid: string
  voucherUrl?: string
  paidAt?: string
}

export interface CommissionsTotals {
  total_app: string
  total_net_to_company: string
  total_balance: string
}

export interface CommissionsResponse {
  data: Commission[]
  meta: {
    total: number
    page: number
    lastPage: number
    limit: number
    offset: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  totals: CommissionsTotals
}
