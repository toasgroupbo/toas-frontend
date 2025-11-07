export interface LoginRequest {
  email: string
  password: string
}

export interface Permission {
  id: number
  resourse: string
  permissions: string[]
}

export interface RolResponse {
  id: number
  name: string
  isStatic: boolean
  permissions: Permission[]
}

export interface CompanyResponse {
  id: string
  name: string
  logo?: string
  commission?: number
}

export interface UserResponse {
  id: string
  email: string
  fullName: string
  ci: string
  phone?: string
  rol: RolResponse
  company: CompanyResponse | null
  companyId?: string | null
}

export interface LoginResponse {
  user: UserResponse
  token: string
}

export interface User {
  id: string
  email: string
  fullName: string
  ci: string
  phone?: string
  rol: {
    id: number
    name: string
    isStatic: boolean
    permissions: Permission[]
  }
  company: CompanyResponse | null
  companyId?: string | null
}
