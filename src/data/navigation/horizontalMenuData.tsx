// Type Imports
import type { HorizontalMenuDataType } from '@/types/menuTypes'

const horizontalMenuData = (): HorizontalMenuDataType[] => [
  {
    label: 'INICIO',
    icon: 'tabler-dashboard',
    href: '/home'
  },
  {
    label: 'Usuarios',
    icon: 'tabler-users',
    children: [
      {
        label: 'Crear Usuario',
        icon: 'tabler-user-plus',
        href: '/products/add'
      },
      {
        label: 'Listar Usuarios',
        icon: 'tabler-list',
        href: '/usuarios/listar'
      }
    ]
  },
  {
    label: 'Productos',
    icon: 'tabler-package',
    children: [
      {
        label: 'Crear Productos',
        icon: 'tabler-plus',
        href: '/productos/crear'
      },
      {
        label: 'Listar Productos',
        icon: 'tabler-list',
        href: '/productos/listar'
      }
    ]
  },
  {
    label: 'Categorías',
    icon: 'tabler-category',
    children: [
      {
        label: 'Crear Categorías',
        icon: 'tabler-plus',
        href: '/categorias/crear'
      },
      {
        label: 'Listar Categorías',
        icon: 'tabler-list',
        href: '/categorias/listar'
      }
    ]
  },
  {
    label: 'Ventas',
    icon: 'tabler-shopping-cart',
    children: [
      {
        label: 'Listar Ventas',
        icon: 'tabler-list',
        href: '/ventas/listar'
      }
    ]
  },
  {
    label: 'Descuentos',
    icon: 'tabler-discount',
    children: [
      {
        label: 'Lista de Descuentos',
        icon: 'tabler-list',
        href: '/descuentos/lista'
      }
    ]
  },
  {
    label: 'Sliders',
    icon: 'tabler-photo',
    children: [
      {
        label: 'Crear Sliders',
        icon: 'tabler-plus',
        href: '/sliders/crear'
      },
      {
        label: 'Listar Sliders',
        icon: 'tabler-list',
        href: '/sliders/listar'
      },
      {
        label: 'Anuncios',
        icon: 'tabler-speakerphone',
        href: '/sliders/anuncios'
      }
    ]
  }
]

export default horizontalMenuData
