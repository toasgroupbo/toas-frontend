export interface LoginRequest {
  correo: string
  contrasenia: string
}

export interface LoginResponse {
  statusCode: number
  message: string
  data: {
    id: number
    usuario: string
    correo: string
    verificado: boolean
    estado: boolean
    roles: string
    perfil_negocio_id: number
    token: string
  }
  error: boolean
}
export interface User {
  id: number
  usuario: string
  correo: string
  verificado: boolean
  estado: boolean
  roles: string
  perfil_negocio_id: number
}
