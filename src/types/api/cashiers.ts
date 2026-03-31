import type { Company } from './company'

export interface Permission {
  id: number
  resourse: string
  permissions: string[]
  createdAt: string
}

export interface CashierRole {
  id: number
  name: string
  isStatic: boolean
  createdAt: string
  permissions: Permission[]
}

export interface CashierOffice {
  id: number
  url_gps: string
  city: string
  createdAt: string
}

export interface Cashier {
  id: number
  email: string
  fullName: string
  ci: string
  phone: string
  createdAt: string
  rol: CashierRole | null
  company: Company | null
  office: CashierOffice | null
}

export interface CreateCashierDto {
  email: string
  password: string
  fullName: string
  ci: string
  phone: string
  cashierRol: number
  officeId: number
}

export interface UpdateCashierDto {
  email?: string
  fullName?: string
  ci?: string
  phone?: string
  rol?: number
}

export interface UpdateCashierOfficeDto {
  officeId: number
}
