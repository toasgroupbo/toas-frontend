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
          'Clientes',
          'CONFIGURACIÓN',
          'Términos de Uso'
        ]

        return adminOnlyMenus.includes(item.label)
      }

      if (userRole === 'CAJERO') {
        const cajeroMenus = ['OPERACIONES', 'Arqueo de Caja', 'Salidas']

        return cajeroMenus.includes(item.label)
      }

      if (userRole === 'ADMIN_EMPRESA' || userRole === 'COMPANY_ADMIN') {
        const empresaMenus = [
          'GESTIÓN DE EMPRESA',
          'Buses',
          'Rutas',
          'Dueños',
          'Cajeros',
          'Oficinas',
          'OPERACIONES',
          'Arqueo de Caja',
          'Salidas',
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
        TICKET: 'Arqueo de Caja',
        OFFICE: 'Oficinas',
        TRIP: 'Viajes'
      }

      const sectionToResourcesMap: Record<string, string[]> = {
        'MÓDULO ADMINISTRACIÓN': ['COMPANY', 'USER', 'ROL'],
        'REPORTES GLOBALES': ['COMPANY', 'USER', 'CUSTOMER', 'TICKET', 'TRAVEL'],
        'GESTIÓN DE EMPRESA': ['BUS', 'ROUTE', 'OWNER', 'CASHIER', 'OFFICE', 'TRIP'],
        OPERACIONES: ['TRAVEL', 'TICKET'],
        CONFIGURACIÓN: ['COMPANY', 'USER', 'ROL']
      }

      const companyMenus = [
        'GESTIÓN DE EMPRESA',
        'Buses',
        'Rutas',
        'Dueños',
        'Cajeros',
        'OPERACIONES',
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

      if (item.label === 'Términos de Uso') {
        return (
          hasPermission(userPermissions, 'COMPANY', 'READ') ||
          hasPermission(userPermissions, 'USER', 'READ') ||
          hasPermission(userPermissions, 'ROL', 'READ')
        )
      }

      return false
    }

    return false
  })
}
