export interface Permission {
  id: number
  resourse: string
  permissions: string[]
}

export interface Role {
  id: number
  name: string
  isStatic: boolean
  permissions: Permission[]
}

export interface CreateRolePermissionDto {
  resourse: string
  permissions: string[]
}

export interface CreateRoleDto {
  name: string
  permissions: CreateRolePermissionDto[]
}

export type ResourceType = 
  | 'USER'
  | 'COMPANY'
  | 'CUSTOMER'
  | 'ROL'
  | 'OFFICE'
  | 'OWNER'
  | 'ROUTE'
  | 'BUS'
  | 'TRAVEL'
  | 'CASHIER'
  | 'FILE'
  | 'TICKET'

export type PermissionType = 
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'PUT'
  | 'CLOSE'
  | 'CONFIRM'
  | 'CANCEL'

export const RESOURCES: Array<{ value: ResourceType; label: string }> = [
  { value: 'USER', label: 'Usuarios' },
  { value: 'COMPANY', label: 'Empresas' },
  { value: 'CUSTOMER', label: 'Clientes' },
  { value: 'ROL', label: 'Roles' },
  { value: 'OFFICE', label: 'Oficinas' },
  { value: 'OWNER', label: 'Propietarios' },
  { value: 'ROUTE', label: 'Rutas' },
  { value: 'BUS', label: 'Buses' },
  { value: 'TRAVEL', label: 'Viajes' },
  { value: 'CASHIER', label: 'Cajas' },
  { value: 'FILE', label: 'Archivos' },
  { value: 'TICKET', label: 'Tickets' }
]

export const PERMISSIONS: Array<{ value: PermissionType; label: string }> = [
  { value: 'CREATE', label: 'Crear' },
  { value: 'READ', label: 'Leer' },
  { value: 'UPDATE', label: 'Actualizar' },
  { value: 'DELETE', label: 'Eliminar' },
  { value: 'PUT', label: 'Modificar' },
  { value: 'CLOSE', label: 'Cerrar' },
  { value: 'CONFIRM', label: 'Confirmar' },
  { value: 'CANCEL', label: 'Cancelar' }
]

export const STATIC_ROLES = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'CASHIER']
