import type { VerticalMenuDataType } from '@/types/menuTypes'
import type { Permission } from '@/types/api/auth'

const hasPermission = (userPermissions: Permission[], resource: string, action: string): boolean => {
  return userPermissions.some(perm => perm.resourse === resource && perm.permissions.includes(action))
}

export const filterMenuByRole = (
  menuItems: VerticalMenuDataType[],
  userRole: string,
  isImpersonating: boolean = false,
  hasCompany: boolean = false,
  userPermissions: Permission[] = [],
  isStaticRole: boolean = true
): VerticalMenuDataType[] => {
  return menuItems.filter((item: any) => {
    if (item.label === 'Inicio') {
      return true
    }

    if (isStaticRole) {
      if (userRole === 'SUPER_ADMIN') {
        if (!isImpersonating && !hasCompany) {
          const adminOnlyMenus = [
            'MÓDULO ADMINISTRACIÓN',
            'Empresas',
            'Administradores',
            'Roles',
            'REPORTES GLOBALES',
            'Reporte de Depósitos',
            'Reporte de Ventas',
            'Reporte de Usuarios',
            'Clientes',
            'CONFIGURACIÓN',
            'Términos de Uso'
          ]

          return adminOnlyMenus.includes(item.label)
        }

        return true
      }

      if (userRole === 'ADMIN_APLICACION') {
        const adminOnlyMenus = [
          'MÓDULO ADMINISTRACIÓN',
          'Empresas',
          'Administradores',
          'Roles',
          'REPORTES GLOBALES',
          'Reporte de Depósitos',
          'Reporte de Ventas',
          'Reporte de Usuarios',
          'Clientes'
        ]

        return adminOnlyMenus.includes(item.label)
      }

      if (userRole === 'CASHIER') {
        const cashierMenus = ['OPERACIONES', 'Venta de Tickets', 'Arqueo de Caja', 'Salidas', 'Viajes']

        return cashierMenus.includes(item.label)
      }

      if (userRole === 'CASHIER_TRIPS') {
        const cashierTripsMenus = ['OPERACIONES', 'Salidas', 'Viajes']

        return cashierTripsMenus.includes(item.label)
      }

      if (userRole === 'CASHIER_SELLER') {
        const cashierSellerMenus = ['OPERACIONES', 'Venta de Tickets', 'Arqueo de Caja', 'Salidas']

        return cashierSellerMenus.includes(item.label)
      }

      if (userRole === 'ADMIN_EMPRESA' || userRole === 'COMPANY_ADMIN') {
        const empresaMenus = [
          'GESTIÓN DE EMPRESA',
          'Buses',
          'Rutas',
          'Dueños',
          'Cajeros',
          'Oficinas',
          'Viajes'
        ]

        return empresaMenus.includes(item.label)
      }

      return false
    }

    if (!isStaticRole) {
      const resourceMenuMap: Record<string, string> = {
        COMPANY: 'Empresas',
        USER: 'Administradores',
        ROL: 'Roles',
        CUSTOMER: 'Clientes',
        BUS: 'Buses',
        ROUTE: 'Rutas',
        OWNER: 'Dueños',
        CASHIER: 'Cajeros',
        TRAVEL: 'Salidas',
        TICKET: 'Venta de Tickets',
        OFFICE: 'Oficinas',
        TRIP: 'Viajes'
      }

      const sectionToResourcesMap: Record<string, string[]> = {
        'MÓDULO ADMINISTRACIÓN': ['COMPANY', 'USER', 'ROL'],
        'REPORTES GLOBALES': ['COMPANY', 'USER', 'CUSTOMER', 'TICKET', 'TRAVEL'],
        'GESTIÓN DE EMPRESA': ['BUS', 'ROUTE', 'OWNER', 'CASHIER', 'OFFICE', 'TRIP'],
        OPERACIONES: ['TRAVEL', 'TICKET']
      }

      const companyMenus = [
        'GESTIÓN DE EMPRESA',
        'Buses',
        'Rutas',
        'Dueños',
        'Cajeros',
        'OPERACIONES',
        'Venta de Tickets',
        'Arqueo de Caja',
        'Salidas',
        'Oficinas',
        'Viajes'
      ]

      if (!hasCompany && !isImpersonating) {
        if (companyMenus.includes(item.label)) {
          return false
        }
      }

      if (item.isSection) {
        const sectionLabel = item.label
        const resourcesInSection = sectionToResourcesMap[sectionLabel]

        if (resourcesInSection) {
          return resourcesInSection.some(resource => hasPermission(userPermissions, resource, 'READ'))
        }

        return false
      }

      for (const [resource, menuLabel] of Object.entries(resourceMenuMap)) {
        if (item.label === menuLabel) {
          return hasPermission(userPermissions, resource, 'READ')
        }
      }

      if (item.label === 'Reporte de Depósitos' || item.label === 'Reporte de Ventas') {
        return hasPermission(userPermissions, 'COMPANY', 'READ') || hasPermission(userPermissions, 'TICKET', 'READ')
      }

      if (item.label === 'Reporte de Usuarios') {
        return hasPermission(userPermissions, 'USER', 'READ')
      }

      if (item.label === 'Términos de Uso' || item.label === 'CONFIGURACIÓN') {
        return false
      }

      return false
    }

    return false
  })
}
