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

    const operationsMenus = ['OPERACIONES', 'Venta de Tickets', 'Arqueo de Caja', 'Salidas']

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
            'Usuarios de Aplicación',
            'CONFIGURACIÓN',
            'Configuraciones y términos de uso'
          ]

          return adminOnlyMenus.includes(item.label)
        }

        // Si está impersonando, excluir menús de operaciones (son solo para cajeros)
        if (isImpersonating && operationsMenus.includes(item.label)) {
          return false
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
          'Usuarios de Aplicación'
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
        const empresaMenus = ['GESTIÓN DE EMPRESA', 'Buses', 'Rutas', 'Dueños', 'Cajeros', 'Oficinas', 'Viajes']

        return empresaMenus.includes(item.label)
      }

      return false
    }

    if (!isStaticRole) {
      const resourceMenuMap: Record<string, string> = {
        COMPANY: 'Empresas',
        USER: 'Administradores',
        ROL: 'Roles',
        CUSTOMER: 'Usuarios de Aplicación',
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
        'GESTIÓN DE EMPRESA': ['BUS', 'ROUTE', 'OWNER', 'CASHIER', 'OFFICE', 'TRIP'],
        OPERACIONES: ['TRAVEL', 'TICKET']
      }

      // Menús que requieren empresa
      const companyMenus = ['GESTIÓN DE EMPRESA', 'Buses', 'Rutas', 'Dueños', 'Cajeros', 'Oficinas', 'Viajes']

      if (!hasCompany && !isImpersonating) {
        if (companyMenus.includes(item.label) || operationsMenus.includes(item.label)) {
          return false
        }
      }

      if (isImpersonating && operationsMenus.includes(item.label)) {
        return false
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

      const reportLabels = ['Reporte de Depósitos', 'Reporte de Ventas', 'Reporte de Usuarios', 'REPORTES GLOBALES']

      if (reportLabels.includes(item.label) || item.label?.startsWith('Reporte')) {
        return false
      }

      if (item.label === 'Términos de Uso' || item.label === 'CONFIGURACIÓN') {
        return false
      }

      return false
    }

    return false
  })
}
