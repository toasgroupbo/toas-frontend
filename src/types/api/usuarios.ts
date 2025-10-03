// ==================== CÓDIGO ORIGINAL (COMENTADO) ====================
/*
export enum Roles {
  super_admin = 'Super_Admin',
  admin = 'Admin',
  operador = 'Operador',
  admin_negocio = 'Admin_Negocio',
  operador_negocio = 'Operador_Negocio'
}
*/

// ==================== VERSIÓN ESTÁTICA TEMPORAL - SISTEMA DE AUTOBUSES ====================
export enum Roles {
  superadmin = 'SUPERADMIN',
  admin_aplicacion = 'ADMIN_APLICACION',
  admin_empresa = 'ADMIN_EMPRESA',
  cajero = 'CAJERO'
}

export interface LugarBasico {
  id: number
  nombre_es: string
}

export interface PerfilNegocio {
  id: number
  nombre_publicador: string
  lugar: LugarBasico
}

export interface Usuario {
  id: number
  usuario: string
  contraseña: string
  correo: string
  verificado: boolean
  estado: boolean
  roles: Roles
  perfil_negocio_id: number
  nombre_publicador?: string
  lugar_id?: number
  perfil_negocio: PerfilNegocio
}

export interface UsuarioWithActionsType extends Usuario {
  actions?: string
}

// Datos para crear usuario
export interface CrearUsuario {
  usuario: string
  contraseña: string
  estado: boolean
  correo: string
  perfil_negocio_id?: number
  nombre_publicador?: string
  lugar_id?: number
  roles: Roles | ''
}

// Datos para actualizar usuario
export interface ActualizarUsuario {
  id: number
  usuario?: string
  contraseña?: string
  estado?: boolean
  correo?: string
  perfil_negocio_id?: number
  nombre_publicador?: string
  lugar_id?: number
  roles: Roles | ''
}

// Respuesta de la API
export interface RespuestaUsuarios {
  statusCode: number
  message: string
  data: {
    items: Usuario[]
    totalItems: number
    limit: number
    offset: number
  }
  error: boolean
}

// Respuesta individual
export interface UsuarioResponse {
  statusCode: number
  message: string
  data: Usuario
}

// Filtros para búsqueda
export interface FiltrosUsuarios {
  limit?: number
  offset?: number
  filter?: string
}

export interface PerfilNegocioExistente {
  id: number
  nombre_publicador: string
  lugar: {
    id: number
    nombre_es: string
  }
}

export interface RespuestaPerfilesNegocio {
  statusCode: number
  message: string
  data: PerfilNegocioExistente[]
  error: boolean
}

// Para formularios
export interface DatosUsuarioFormulario {
  usuario: string
  contraseña: string
  confirmarContraseña: string
  correo: string
  estado: boolean
  roles: Roles | ''
  perfil_negocio_id: number
  nombre_publicador: string
  lugar_id: number
  tipoPublicador: 'perfil' | 'otro'
}

// Opciones de roles para select
export interface OpcionRol {
  value: Roles
  label: string
}

// ==================== OPCIONES DE ROLES ACTUALIZADAS ====================
/*
// Roles originales (comentado):
export const OPCIONES_ROLES: OpcionRol[] = [
  {
    value: Roles.super_admin,
    label: 'Super Admin'
  },
  {
    value: Roles.admin,
    label: 'Administrador'
  },
  {
    value: Roles.operador,
    label: 'Operador'
  },
  {
    value: Roles.admin_negocio,
    label: 'Admin de Negocio'
  },
  {
    value: Roles.operador_negocio,
    label: 'Operador de Negocio'
  }
]
*/

// 🚌 Roles para sistema de autobuses:
export const OPCIONES_ROLES: OpcionRol[] = [
  {
    value: Roles.superadmin,
    label: 'Super Administrador'
  },
  {
    value: Roles.admin_aplicacion,
    label: 'Administrador de Aplicación'
  },
  {
    value: Roles.admin_empresa,
    label: 'Administrador de Empresa'
  },
  {
    value: Roles.cajero,
    label: 'Cajero'
  }
]

// Estados para UI
export interface EstadosUsuarios {
  usuarios: Usuario[]
  total: number
  currentPage: number
  totalPages: number
  pageSize: number
  isLoading: boolean
  isFetching: boolean
  error: Error | null
}

// Para filtros avanzados
export interface FiltrosAvanzados {
  roles?: Roles[]
  estado?: boolean
  verificado?: boolean
  perfil_negocio_id?: number
}
