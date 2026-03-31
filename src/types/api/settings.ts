export interface Settings {
  id: number
  commission: string
  terminos_y_condiciones: string | null
  politicas_de_privacidad: string | null
  createdAt: string
}

export interface UpdateSettingsDto {
  commission?: string
  terminos_y_condiciones?: string
  politicas_de_privacidad?: string
}
