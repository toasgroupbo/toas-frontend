import type { Role } from './roles'
import type { Company } from './company'

export interface Permission {
  id: number
  resourse: string
  permissions: string[]
}

export interface UserRole {
  id: number
  name: string
  isStatic: boolean
  permissions: Permission[]
}

export interface User {
  id: string
  email: string
  fullName: string
  ci: string
  phone: string
  rol: UserRole | null
  company: Company | null
  office: any | null
}

export interface CreateUserDto {
  email: string
  password: string
  fullName: string
  ci: string
  phone: string
  rol: number
}

export interface UpdateUserDto {
  email?: string
  password?: string
  fullName?: string
  ci?: string
  phone?: string
  rol?: number
}
