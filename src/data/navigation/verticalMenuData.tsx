// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'

const verticalMenuData = (): VerticalMenuDataType[] => [
  //INICIO

  {
    label: 'Inicio',
    icon: 'tabler-home',
    href: '/home'
  },

  //MENÚS ADMINISTRATIVOS

  {
    isSection: true,
    label: 'MÓDULO ADMINISTRACIÓN'
  },
  {
    label: 'Empresas',
    icon: 'tabler-building',
    href: '/companies/list'
  },
  {
    label: 'Usuarios',
    icon: 'tabler-users',
    href: '/usuarios/list'
  },
  {
    label: 'Roles',
    icon: 'tabler-shield',
    href: '/roles/list'
  },

  //REPORTES GLOBALES

  {
    isSection: true,
    label: 'REPORTES GLOBALES'
  },
  {
    label: 'Reporte de Depósitos',
    icon: 'tabler-report-money',
    href: '/reportes/depositos'
  },
  {
    label: 'Reporte de Ventas',
    icon: 'tabler-chart-line',
    href: '/reportes/ventas'
  },
  {
    label: 'Reporte de Usuarios',
    icon: 'tabler-users-group',
    href: '/reportes/usuarios'
  },

  //  GESTIÓN DE EMPRESA

  {
    isSection: true,
    label: 'GESTIÓN DE EMPRESA'
  },
  {
    label: 'Buses',
    icon: 'tabler-bus',
    href: '/buses/list'
  },
  {
    label: 'Rutas',
    icon: 'tabler-route',
    href: '/rutas/list',

    permission: {
      resource: 'rutas',
      action: 'read'
    }
  },
  {
    label: 'Dueños',
    icon: 'tabler-user-star',
    href: '/duenos/list'
  },
  {
    label: 'Cajeros',
    icon: 'tabler-cash',
    href: '/cajeros/list'
  },

  //OPERACIONES

  {
    isSection: true,
    label: 'OPERACIONES'
  },
  {
    label: 'Arqueo de Caja',
    icon: 'tabler-calculator',
    href: '/arqueo/list'
  },
  {
    label: 'Salidas',
    icon: 'tabler-clock-up',
    href: '/salidas/list'
  },

  //  CONFIGURACIÓN

  {
    isSection: true,
    label: 'CONFIGURACIÓN'
  },
  {
    label: 'Términos de Uso',
    icon: 'tabler-file-text',
    href: '/terminos'
  }
]

export default verticalMenuData
