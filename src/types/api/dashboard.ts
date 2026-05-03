export interface DashboardSummary {
  companies: number
  owners: number
  buses: number
  offices: number
  routes: number
  cashiers: number
}

export interface TravelsToday {
  actives: number
  canceled: number
  closed: number
  total: number
}

export interface Depositos {
  pendingDeposits: number
  amount_pending: number
}

export interface DashboardDriver {
  ci: string
  name: string
  phone: string
}

export interface DashboardBus {
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

export interface DashboardPlace {
  id: number
  name: string
  createdAt: string
}

export interface DashboardOffice {
  id: number
  url_gps: string
  name: string
  address: string
  enabled: boolean
  createdAt: string
  place: DashboardPlace
}

export interface DashboardRoute {
  id: number
  isActive: boolean
  pass_by: string[]
  travel_hours: number
  enabled: boolean
  createdAt: string
  officeOrigin: DashboardOffice
  officeDestination: DashboardOffice
}

export interface DashboardCompany {
  id: number
  name: string
  logo: string
  commission: number
  hours_before_closing: number
  createdAt: string
}

export interface DashboardTravel {
  id: number
  departure_time: string
  arrival_time: string
  price_deck_1: string
  price_deck_2: string
  travel_status: 'active' | 'closed' | 'cancelled'
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
  drivers: DashboardDriver[] | null
  assistants: DashboardDriver[] | null
  bus: DashboardBus
  route: DashboardRoute
  company: DashboardCompany
}

export interface DashboardData {
  summary: DashboardSummary
  travels_today: TravelsToday
  depositos: Depositos
  travels: DashboardTravel[]
}
