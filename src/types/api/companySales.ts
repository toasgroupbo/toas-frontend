export interface CompanySalesReport {
  companyId: number
  companyName: string
  total: string
  totalCommission: string
  netToCompany: string
  ticketsOfficeCount: string
  cashAmount: string
  qrAmount: string
  ticketsAppCount: string
  appAmount: string
  ticketsCount: string
}

export interface CompanySalesQueryParams {
  startDate?: string
  endDate?: string
}
