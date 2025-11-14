export type AccountType = 'caja_ahorro' | 'cuenta_corriente' | 'otro'

export interface BankAccount {
  id: string
  bank: string
  typeAccount: AccountType
  account: string
  createdAt: string
  updatedAt: string
}

export interface Owner {
  id: string
  name: string
  ci: string
  phone: string
  bankAccount: BankAccount
  createdAt: string
  updatedAt: string
}

export interface CreateOwnerDto {
  name: string
  ci: string
  phone: string
  bankAccount: {
    bank: string
    typeAccount: AccountType
    account: string
  }
}

export interface UpdateOwnerDto {
  name: string
  ci: string
  phone: string
}

export interface UpdateBankAccountDto {
  bank: string
  typeAccount: AccountType
  account: string
}
