export interface BankAccount {
  id?: string
  bank: string
  typeAccount: string
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
    typeAccount: string
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
    typeAccount: string
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
  'Banco Nacional de Bolivia',
  'Banco de Crédito de Bolivia',
  'Banco Mercantil Santa Cruz',
  'Banco Unión',
  'Banco FIE',
  'Banco Ganadero',
  'Banco Económico',
  'Banco PRODEM',
  'BancoSol',
  'BancoVisión',
  'Banco Fortaleza',
  'Banco BISA'
] as const

export const TIPOS_CUENTA = [
  { value: 'caja_ahorro', label: 'Caja de Ahorro' },
  { value: 'cuenta_corriente', label: 'Cuenta Corriente' },
  { value: 'otro', label: 'Otro' }
] as const

export type BancoBolivia = (typeof BANCOS_BOLIVIA)[number]
export type TipoCuenta = (typeof TIPOS_CUENTA)[number]['value']
