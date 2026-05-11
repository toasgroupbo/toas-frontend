export interface CommissionCompany {
  id: number
  name: string
  logo: string
  commission: number
  hours_before_closing: number
  createdAt: string
}

export interface Commission {
  id: number
  paid: string
  voucher: string | null
  paidAt: string | null
  total_trips_count: number
  tickets_app_count_total: number
  commission_app_total: string
  commission_company: string
  commission_rate_at_time: number
  date_to_pay: string
  period_start: string
  period_end: string
  period_key: string
  company: CommissionCompany
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
