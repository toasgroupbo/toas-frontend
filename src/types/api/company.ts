export interface BankAccount {
  id?: string
  bank: string
  typeAccount: 'caja_ahorro' | 'cuenta_corriente'
  account: string
}

export interface CompanyAdmin {
  id?: string
  email: string
  fullName: string
  ci: string
  phone: string
  password?: string
}

export interface Company {
  id: string
  name: string
  logo: string
  commission: number
  hours_before_closing: number
  bankAccount: BankAccount
  admin: CompanyAdmin
}

export interface CreateCompanyDto {
  name: string
  logo: string
  commission: number
  hours_before_closing: number
  bankAccount: {
    bank: string
    typeAccount: 'caja_ahorro' | 'cuenta_corriente'
    account: string
  }
  manager: {
    email: string
    password: string
    fullName: string
    ci: string
    phone: string
  }
}

export interface UpdateCompanyDto {
  name?: string
  logo?: string
  commission?: number
  hours_before_closing?: number
  bankAccount?: {
    bank: string
    typeAccount: 'caja_ahorro' | 'cuenta_corriente'
    account: string
  }
  manager?: {
    email?: string
    password?: string
    fullName?: string
    ci?: string
    phone?: string
  }
}

export const BANCOS_BOLIVIA = [
  'Banco de Crédito de Bolivia',
  'Banco Unión',
  'Banco Nacional de Bolivia',
  'Banco Mercantil Santa Cruz',
  'Banco FIE',
  'Banco Sol',
  'Banco Ganadero',
  'Banco Económico',
  'Banco Bisa',
  'Banco Fortaleza'
] as const

export const TIPOS_CUENTA = [
  { value: 'caja_ahorro', label: 'Caja de Ahorro' },
  { value: 'cuenta_corriente', label: 'Cuenta Corriente' }
] as const
