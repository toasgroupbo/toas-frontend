// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'

const verticalMenuData = (): VerticalMenuDataType[] => [
  // PRINCIPAL
  {
    isSection: true,
    label: 'PRINCIPAL'
  },
  {
    label: 'Inicio',
    icon: 'tabler-home',
    href: '/home'
  },

  // MÓDULO ADMINISTRACIÓN
  {
    isSection: true,
    label: 'MÓDULO ADMINISTRACIÓN'
  },
  {
    label: 'Empresas',
    icon: 'tabler-building',
    href: '/companies/list'
  },

  // MÓDULO OPERACIONES
  {
    isSection: true,
    label: 'MÓDULO OPERACIONES'
  },
  {
    label: 'Arqueo de Caja',
    icon: 'tabler-calculator',
    children: [
      {
        label: 'Cajeros',
        icon: 'tabler-users',
        href: '/arqueo/list'
      },
      {
        label: 'Salidas',
        icon: 'tabler-arrow-up',
        href: '/cash-register/expenses'
      },
      {
        label: 'Ventas',
        icon: 'tabler-shopping-cart',
        href: '/cash-register/sales'
      }
    ]
  },

  // MÓDULO REPORTES
  {
    isSection: true,
    label: 'MÓDULO REPORTES'
  },
  {
    label: 'Reportes',
    icon: 'tabler-report',
    children: [
      {
        label: 'Depósitos',
        icon: 'tabler-cash',
        href: '/reports/deposits'
      },
      {
        label: 'Ventas',
        icon: 'tabler-chart-bar',
        href: '/reports/sales'
      },
      {
        label: 'Usuario',
        icon: 'tabler-user-check',
        href: '/reports/users'
      }
    ]
  },

  // MÓDULO CONFIGURACIÓN
  {
    isSection: true,
    label: 'MÓDULO CONFIGURACIÓN'
  },
  {
    label: 'Pagos de la Aplicación',
    icon: 'tabler-credit-card',
    href: '/payments'
  },
  {
    label: 'Términos de Usuario',
    icon: 'tabler-file-text',
    href: '/terms'
  },

  // MÓDULO GESTIÓN DE ACCESOS
  {
    isSection: true,
    label: 'MÓDULO GESTIÓN DE ACCESOS'
  },
  {
    label: 'Usuarios',
    icon: 'tabler-users',
    href: '/users'
  },
  {
    label: 'Roles y Permisos',
    icon: 'tabler-shield-lock',
    href: '/roles'
  }
]

export default verticalMenuData
