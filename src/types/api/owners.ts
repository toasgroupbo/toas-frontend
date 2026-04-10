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
