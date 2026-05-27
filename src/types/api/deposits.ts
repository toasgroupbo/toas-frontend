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

export interface TransactionPaymentDetail {
  Line: number
  Mail: string
  Amount: number
  BankId: string
  Commission: number
  AccountType: string
  Description: string
  FirstDetail: string
  PaymentType: string
  TitularName: string
  DocumentType: string
  GlossPayment: string
  SecondDetail: string
  AccountNumber: string
  FirstLastName: string
  BranchOfficeId: number | null
  DocumentNumber: string
  SecondLastName: string
  BankDescription: string | null
  DocumentExtension: string
  CommissionCurrency: string
  InstruccionsPayment: string
  BranchOfficeDescription: string | null
  OperationNumberDebitHost: string
  OperationStatusDescription: string
}

export interface TransactionBatchDetailResponse {
  Amount: number
  Currency: string
  FundSource: string
  DateProcess: string
  Description: string
  Spreadsheet: {
    FormAchPayments: any[]
    FormOddPayments: any[]
    FormYapePayments: any[]
    FormProvidersPayments: TransactionPaymentDetail[]
  }
  SourceAccount: string
  TypeOperation: string
  UserInvolveds: Array<{
    UserName: string
    DateAction: string
    UserDescription: string
  }>
  ProcessBatchId: number
  FundDestination: string
  StatusOperation: string
  OperationNumberDebitHost: string
}

export interface TravelTransaction {
  id: number
  transactionId: string
  status: 'AUTHORIZED' | 'COMPLETED' | 'FAILED' | 'IN_PROGRESS'
  processResponse?: {
    Code: string
    Message: string
    TransactionId: string
  }
  authorizeResponse?: {
    Code: string
    Result: string
    Message: string
  }
  batchDetailRequest?: {
    transactionsId: number[]
  }
  batchDetailResponse?: TransactionBatchDetailResponse
  bankErrors?: any
  errorMessage?: string | null
  travelsSnapshot?: Array<{
    line: number
    amount: number
    travelId: number
  }>
  totalAmount?: string
  totalTravels?: number
  createdAt?: string
  processedAt?: string
  authorizedAt?: string
  completedAt?: string
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
  page?: number
  limit?: number
}

// Company with transaction debt info
export interface CompanyUser {
  id: number
  email: string
  fullName: string
  ci: string
  phone: string
  createdAt: string
}

export interface CompanyWithDebt {
  id: number
  name: string
  logo: string
  commission_app: number
  commission_company: number
  hours_before_closing: number
  createdAt: string
  enabled: boolean
  bankAccount: BankAccount
  users: CompanyUser[]
  currentDebt: number
  lastPaidAt: string | null
}

// Paginated travels response
export interface TravelsPaginatedResponse {
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
}
