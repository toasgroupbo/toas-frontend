export enum DocumentExtension {
  CB = 'CB',
  LP = 'LP',
  SC = 'SC',
  OR = 'OR',
  PT = 'PO',
  TJ = 'TJ',
  CH = 'CH',
  BE = 'BE',
  PA = 'PA',
  SN = 'SN',
  NN = 'NN'
}

export enum DocumentType {
  CI = 'Q',
  NIT = 'T',
  RUC = 'R',
  OTHER = 'O',
  PASSPORT = 'P',
  FISCAL_ID = 'U',
  BANK_GENERIC = 'W'
}

export enum BranchOfficeId {
  CHUQUISACA = 101,
  LA_PAZ = 201,
  COCHABAMBA = 301,
  ORURO = 401,
  POTOSI = 501,
  TARIJA = 601,
  SANTA_CRUZ = 701,
  BENI = 801,
  PANDO = 901,
  NA = 999
}

export enum BankCode {
  BANCO_CENTRAL_DE_BOLIVIA = '1004',
  BANCO_DE_CREDITO = '1005',
  BANCO_UNION = '1014'
}

export interface BankAccount {
  id?: string
  bankCode: string
  account: string
  titularName: string
  branchOfficeId: number
  documentNumber: string
  documentType: string
  documentExtension: string
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
    bankCode: string
    account: string
    titularName: string
    branchOfficeId: number
    documentNumber: string
    documentType: string
    documentExtension: string
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
    bankCode: string
    account: string
    titularName: string
    branchOfficeId: number
    documentNumber: string
    documentType: string
    documentExtension: string
  }
  manager?: {
    email?: string
    password?: string
    fullName?: string
    ci?: string
    phone?: string
  }
}

export const BANCOS_OPTIONS = [
  { value: BankCode.BANCO_CENTRAL_DE_BOLIVIA, label: 'Banco Central de Bolivia' },
  { value: BankCode.BANCO_DE_CREDITO, label: 'Banco de Crédito' },
  { value: BankCode.BANCO_UNION, label: 'Banco Unión' }
] as const

export const BRANCH_OFFICE_OPTIONS = [
  { value: BranchOfficeId.CHUQUISACA, label: 'Chuquisaca' },
  { value: BranchOfficeId.LA_PAZ, label: 'La Paz' },
  { value: BranchOfficeId.COCHABAMBA, label: 'Cochabamba' },
  { value: BranchOfficeId.ORURO, label: 'Oruro' },
  { value: BranchOfficeId.POTOSI, label: 'Potosí' },
  { value: BranchOfficeId.TARIJA, label: 'Tarija' },
  { value: BranchOfficeId.SANTA_CRUZ, label: 'Santa Cruz' },
  { value: BranchOfficeId.BENI, label: 'Beni' },
  { value: BranchOfficeId.PANDO, label: 'Pando' },
  { value: BranchOfficeId.NA, label: 'No Aplica' }
] as const

export const DOCUMENT_TYPE_OPTIONS = [
  { value: DocumentType.CI, label: 'Cédula de Identidad' },
  { value: DocumentType.NIT, label: 'NIT' },
  { value: DocumentType.RUC, label: 'RUC' },
  { value: DocumentType.PASSPORT, label: 'Pasaporte' },
  { value: DocumentType.FISCAL_ID, label: 'ID Fiscal' },
  { value: DocumentType.BANK_GENERIC, label: 'Genérico Bancario' },
  { value: DocumentType.OTHER, label: 'Otro' }
] as const

export const DOCUMENT_EXTENSION_OPTIONS = [
  { value: DocumentExtension.CB, label: 'Cochabamba' },
  { value: DocumentExtension.LP, label: 'La Paz' },
  { value: DocumentExtension.SC, label: 'Santa Cruz' },
  { value: DocumentExtension.OR, label: 'Oruro' },
  { value: DocumentExtension.PT, label: 'Potosí' },
  { value: DocumentExtension.TJ, label: 'Tarija' },
  { value: DocumentExtension.CH, label: 'Chuquisaca' },
  { value: DocumentExtension.BE, label: 'Beni' },
  { value: DocumentExtension.PA, label: 'Pando' },
  { value: DocumentExtension.SN, label: 'Sin Extensión' },
  { value: DocumentExtension.NN, label: 'No Nacional' }
] as const
