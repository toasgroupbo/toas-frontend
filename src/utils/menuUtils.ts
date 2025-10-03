import type { VerticalMenuDataType } from '@/types/menuTypes'

// ==================== CÓDIGO ORIGINAL  ====================
/*
export const filterMenuByRole = (menuItems: VerticalMenuDataType[], userRole: string): VerticalMenuDataType[] => {
  return menuItems.filter((item: any) => {
    if (['Operador', 'Admin_Negocio', 'Operador_Negocio'].includes(userRole)) {
      if (item.label === 'PRINCIPAL') return false
      if (item.href === '/home') return false
    }

    if (!['Super_Admin', 'Admin', 'Admin_Negocio'].includes(userRole)) {
      if (item.label === 'GESTIÓN DE USUARIOS') return false
      if (item.href === '/usuarios/list') return false
    }

    if (['Admin_Negocio', 'Operador_Negocio'].includes(userRole)) {
      if (item.href === '/lugares/list') return false
      if (item.href === '/servicios/list') return false
      if (item.label === 'CATEGORÍAS') return false

      const categoriasToHide = [
        '/turistico/list',
        '/gastronomia/list',
        '/entretenimiento/list',
        '/hospedaje/list',
        '/agenciaviaje/list'
      ]

      if (categoriasToHide.includes(item.href)) return false
    }

    return true
  })
}
*/

export const filterMenuByRole = (menuItems: VerticalMenuDataType[], userRole: string): VerticalMenuDataType[] => {
  return menuItems.filter((item: any) => {
    if (userRole === 'CAJERO') {
      if (item.label === 'MÓDULO ADMINISTRACIÓN') return false
      if (item.label === 'MÓDULO REPORTES') return false
      if (item.label === 'MÓDULO CONFIGURACIÓN') return false
      if (item.label === 'MÓDULO GESTIÓN DE ACCESOS') return false

      if (item.label === 'Empresas') return false
      if (item.href === '/payments') return false
      if (item.href === '/terms') return false
      if (item.href === '/users') return false
      if (item.href === '/roles') return false
      if (item.label === 'Reportes') return false

      if (item.label === 'Arqueo de Caja') return true

      return true
    }

    if (userRole === 'ADMIN_EMPRESA') {
      if (item.label === 'MÓDULO ADMINISTRACIÓN') return false
      if (item.label === 'MÓDULO REPORTES') return false
      if (item.label === 'MÓDULO GESTIÓN DE ACCESOS') return false

      if (item.label === 'Reportes') return false
      if (item.href === '/terms') return false
      if (item.href === '/roles') return false
      if (item.label === 'Empresas') return false
      if (item.label === 'Usuarios') return false

      return true
    }

    if (userRole === 'ADMIN_APLICACION') {
      return true
    }

    if (userRole === 'SUPERADMIN') {
      return true
    }

    return true
  })
}
