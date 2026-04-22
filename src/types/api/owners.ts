export interface BankAccount {
  id: string
  bankCode: string
  account: string
  titularName: string
  branchOfficeId: number
  documentNumber: string
  documentType: string
  documentExtension: string
  createdAt: string
  updatedAt: string
}

export interface OwnerUser {
  id: number
  email: string
  fullName: string
  ci: string
  phone: string
  createdAt: string
}

export interface OwnerCompany {
  id: number
  name: string
  logo: string
  commission: number
  hours_before_closing: number
  createdAt: string
}

export interface Owner {
  id: string
  name: string
  ci: string
  phone: string
  bankAccount: BankAccount
  buses: any[]
  companies: OwnerCompany[]
  users: OwnerUser[]
  createdAt: string
  updatedAt?: string
}

export interface CreateOwnerDto {
  name: string
  ci: string
  phone: string
  email: string
  password: string
  bankAccount: {
    bankCode: string
    account: string
    titularName: string
    branchOfficeId: number
    documentNumber: string
    documentType: string
    documentExtension: string
  }
}

export interface UpdateOwnerDto {
  name: string
  ci: string
  phone: string
  bankAccount: {
    bankCode: string
    account: string
    titularName: string
    branchOfficeId: number
    documentNumber: string
    documentType: string
    documentExtension: string
  }
}
