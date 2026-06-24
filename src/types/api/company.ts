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
  BANCO_DE_CREDITO = '1005',
  BANCO_ECONOMICO_SA = '1016',
  BANCO_FORTALEZA = '1034',
  BANCO_GANADERO_SA = '1018',
  BANCO_FIE = '1033',
  BANCO_BISA_SA = '1009',
  BANCO_MERCANTIL_SANTA_CRUZ = '1003',
  BANCO_DE_LA_NACION_ARGENTINA = '1007',
  BANCO_NACIONAL_DE_BOLIVIA_SA = '1001',
  BANCO_SOLIDARIO_SA = '1017',
  BANCO_UNION_SA = '1014',
  COOPERATIVA_DE_AHORRO_Y_CREDITO_ABIERTA_COMARAPA = 'MLD3022',
  COOPERATIVA_DE_AHORRO_Y_CREDITO_ABIERTA_CATEDRAL = 'MLD3030',
  EL_CHOROLQUE_RL = 'MLD3026',
  COOPERATIVA_FACTIMA = '3003',
  COOPERATIVA_DE_AHORRO_Y_CREDITO_ABIERTA_INCA_HUASI_LTDA = 'MLD3012',
  COOPERATIVA_JESUS_NAZARENO = '3001',
  COOPERATIVA_DE_AHORRO_Y_CREDITO_ABIERTA_MAGISTERI = 'MLD3048',
  COOPERATIVA_DE_AHORRO_Y_CREDITO_MADRE_Y_MAESTRA_LT = 'MLD3028',
  COOPERATIVA_DE_AHORRO_Y_CREDITO_ABIERTA = 'MLD3034',
  COOPERATIVA_DE_AHORRO_Y_CREDITO_ABIERTA_PIO_X_LTDA = 'MLD3011',
  COOPERATIVA_DE_AHORRO_Y_CREDITO_ABIERTA_QUILLACOLLO_LTDA = '3015',
  COOPERATIVA_SAN_MARTIN_DE_PORRES = '3002',
  COOPERATIVA_SAN_MATEO = '3025',
  COOPERATIVA_DE_AHORRO_Y_CREDITO_TRINIDAD_LTDA = 'MLD3021',
  CIDRE_IFD = '27002',
  CRECER_IFD = '27003',
  DIACONIA_IFD = '27004',
  INSTITUCION_FINANCIERA_DE_DESARROLLO_IDEPRO = '27009',
  INSTITUCION_FINANCIERA_DE_DESARROLLO_PRO_MUJER = '27012',
  BANCO_ECONOMICO_SA_MLD = 'MLD1016',
  BANCO_FORTALEZA_MLD = 'MLD1034',
  BANCO_GANADERO_SA_MLD = 'MLD1018',
  BANCO_FIE_MLD = 'MLD1033',
  BANCO_NACIONAL_DE_BOLIVIA_SA_MLD = 'MLD1001',
  BANCO_SOLIDARIO_SA_MLD = 'MLD1017',
  BANCO_UNION_SA_MLD = 'MLD1014',
  TIGO_MONEY = '53001',
  BANCO_PYME_DE_LA_COMUNIDAD = '74003',
  BANCO_PYME_ECOFUTURO_SA = '74002',
  COOPERATIVA_SAN_MATEO_UNI = 'UNI3025',
  INSTITUCION_FINANCIERA_DE_DESARROLLO_IDEPRO_UNI = 'UNI27009',
  INSTITUCION_FINANCIERA_DE_DESARROLLO_PRO_MUJER_UNI = 'UNI27012',
  LA_PRIMERA_ENTIDAD_FINANCIERA_DE_VIVIENDA = 'MLD75001',
  LA_PROMOTORA_EFV = '75003'
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
  commission_app: number
  commission_company: number
  hours_before_closing: number
  createdAt: string
  enabled: boolean
  bankAccount: BankAccount
  users: CompanyAdmin[]
}

export interface CreateCompanyDto {
  name: string
  logo: string
  commission_app: number
  commission_company: number
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
  commission_app?: number
  commission_company?: number
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
  { value: BankCode.BANCO_DE_CREDITO, label: 'Banco de Crédito' },
  { value: BankCode.BANCO_ECONOMICO_SA, label: 'Banco Económico S.A.' },
  { value: BankCode.BANCO_FORTALEZA, label: 'Banco Fortaleza' },
  { value: BankCode.BANCO_GANADERO_SA, label: 'Banco Ganadero S.A.' },
  { value: BankCode.BANCO_FIE, label: 'Banco FIE' },
  { value: BankCode.BANCO_BISA_SA, label: 'Banco BISA S.A.' },
  { value: BankCode.BANCO_MERCANTIL_SANTA_CRUZ, label: 'Banco Mercantil Santa Cruz' },
  { value: BankCode.BANCO_DE_LA_NACION_ARGENTINA, label: 'Banco de la Nación Argentina' },
  { value: BankCode.BANCO_NACIONAL_DE_BOLIVIA_SA, label: 'Banco Nacional de Bolivia S.A.' },
  { value: BankCode.BANCO_SOLIDARIO_SA, label: 'Banco Solidario S.A.' },
  { value: BankCode.BANCO_UNION_SA, label: 'Banco Unión S.A.' },
  { value: BankCode.COOPERATIVA_DE_AHORRO_Y_CREDITO_ABIERTA_COMARAPA, label: 'Cooperativa Comarapa' },
  { value: BankCode.COOPERATIVA_DE_AHORRO_Y_CREDITO_ABIERTA_CATEDRAL, label: 'Cooperativa Catedral' },
  { value: BankCode.EL_CHOROLQUE_RL, label: 'Cooperativa El Chorolque RL' },
  { value: BankCode.COOPERATIVA_FACTIMA, label: 'Cooperativa Fátima' },
  { value: BankCode.COOPERATIVA_DE_AHORRO_Y_CREDITO_ABIERTA_INCA_HUASI_LTDA, label: 'Cooperativa Inca Huasi Ltda.' },
  { value: BankCode.COOPERATIVA_JESUS_NAZARENO, label: 'Cooperativa Jesús Nazareno' },
  { value: BankCode.COOPERATIVA_DE_AHORRO_Y_CREDITO_ABIERTA_MAGISTERI, label: 'Cooperativa Magisterio' },
  { value: BankCode.COOPERATIVA_DE_AHORRO_Y_CREDITO_MADRE_Y_MAESTRA_LT, label: 'Cooperativa Madre y Maestra' },
  { value: BankCode.COOPERATIVA_DE_AHORRO_Y_CREDITO_ABIERTA, label: 'Cooperativa Abierta' },
  { value: BankCode.COOPERATIVA_DE_AHORRO_Y_CREDITO_ABIERTA_PIO_X_LTDA, label: 'Cooperativa Pío X Ltda.' },
  { value: BankCode.COOPERATIVA_DE_AHORRO_Y_CREDITO_ABIERTA_QUILLACOLLO_LTDA, label: 'Cooperativa Quillacollo Ltda.' },
  { value: BankCode.COOPERATIVA_SAN_MARTIN_DE_PORRES, label: 'Cooperativa San Martín de Porres' },
  { value: BankCode.COOPERATIVA_SAN_MATEO, label: 'Cooperativa San Mateo' },
  { value: BankCode.COOPERATIVA_DE_AHORRO_Y_CREDITO_TRINIDAD_LTDA, label: 'Cooperativa Trinidad Ltda.' },
  { value: BankCode.CIDRE_IFD, label: 'CIDRE IFD' },
  { value: BankCode.CRECER_IFD, label: 'CRECER IFD' },
  { value: BankCode.DIACONIA_IFD, label: 'DIACONIA IFD' },
  { value: BankCode.INSTITUCION_FINANCIERA_DE_DESARROLLO_IDEPRO, label: 'IDEPRO IFD' },
  { value: BankCode.INSTITUCION_FINANCIERA_DE_DESARROLLO_PRO_MUJER, label: 'Pro Mujer IFD' },
  { value: BankCode.BANCO_ECONOMICO_SA_MLD, label: 'Banco Económico S.A. MLD' },
  { value: BankCode.BANCO_FORTALEZA_MLD, label: 'Banco Fortaleza MLD' },
  { value: BankCode.BANCO_GANADERO_SA_MLD, label: 'Banco Ganadero S.A. MLD' },
  { value: BankCode.BANCO_FIE_MLD, label: 'Banco FIE MLD' },
  { value: BankCode.BANCO_NACIONAL_DE_BOLIVIA_SA_MLD, label: 'Banco Nacional de Bolivia S.A. MLD' },
  { value: BankCode.BANCO_SOLIDARIO_SA_MLD, label: 'Banco Solidario S.A. MLD' },
  { value: BankCode.BANCO_UNION_SA_MLD, label: 'Banco Unión S.A. MLD' },
  { value: BankCode.TIGO_MONEY, label: 'Tigo Money' },
  { value: BankCode.BANCO_PYME_DE_LA_COMUNIDAD, label: 'Banco PYME de la Comunidad' },
  { value: BankCode.BANCO_PYME_ECOFUTURO_SA, label: 'Banco PYME Ecofuturo S.A.' },
  { value: BankCode.COOPERATIVA_SAN_MATEO_UNI, label: 'Cooperativa San Mateo UNI' },
  { value: BankCode.INSTITUCION_FINANCIERA_DE_DESARROLLO_IDEPRO_UNI, label: 'IDEPRO IFD UNI' },
  { value: BankCode.INSTITUCION_FINANCIERA_DE_DESARROLLO_PRO_MUJER_UNI, label: 'Pro Mujer IFD UNI' },
  { value: BankCode.LA_PRIMERA_ENTIDAD_FINANCIERA_DE_VIVIENDA, label: 'La Primera EFV' },
  { value: BankCode.LA_PROMOTORA_EFV, label: 'La Promotora EFV' }
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
