import type { Company } from './company'
import type { Office } from './offices'

export interface Permission {
  id: number
  resourse: string
  permissions: string[]
}

export interface CashierRole {
  id: number
  name: string
  isStatic: boolean
  permissions: Permission[]
}

export interface Cashier {
  id: string
  email: string
  fullName: string
  ci: string
  phone: string
  rol: CashierRole | null
  company: Company | null
  office: Office | null
}

export interface CreateCashierDto {
  email: string
  password: string
  fullName: string
  ci: string
  phone: string
  office: string
}

export interface UpdateCashierDto {
  email?: string
  fullName?: string
  ci?: string
  phone?: string
}

export interface UpdateCashierOfficeDto {
  office: string
}
