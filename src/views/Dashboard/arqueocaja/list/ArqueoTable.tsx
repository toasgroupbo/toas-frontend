'use client'

import { useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import { Pagination } from '@mui/material'

import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

interface ArqueoCaja {
  id: number
  nombreCajero: string
  dia: string
  fecha: string
  hora: string
  totalCierreCaja: number
}

type ArqueoCajaWithActions = ArqueoCaja & {
  actions?: string
}

const datosEstaticos: ArqueoCaja[] = [
  {
    id: 1,
    nombreCajero: 'JUAN RAMOS',
    dia: 'LUNES',
    fecha: '25/06/2025',
    hora: '21:05',
    totalCierreCaja: 850
  },
  {
    id: 2,
    nombreCajero: 'JUAN RAMOS',
    dia: 'LUNES',
    fecha: '25/06/2025',
    hora: '14:00',
    totalCierreCaja: 300
  },
  {
    id: 3,
    nombreCajero: 'JUAN RAMOS',
    dia: 'LUNES',
    fecha: '25/06/2025',
    hora: '10:35',
    totalCierreCaja: 950
  },
  {
    id: 4,
    nombreCajero: 'JUAN RAMOS',
    dia: 'MARTES',
    fecha: '24/04/2025',
    hora: '22:05',
    totalCierreCaja: 0
  },
  {
    id: 5,
    nombreCajero: 'JUAN RAMOS',
    dia: 'LUNES',
    fecha: '23/06/2025',
    hora: '23:05',
    totalCierreCaja: 30
  },
  {
    id: 6,
    nombreCajero: 'JUAN RAMOS',
    dia: 'DOMINGO',
    fecha: '22/06/2025',
    hora: '00:05',
    totalCierreCaja: 100
  },
  {
    id: 7,
    nombreCajero: 'JUAN RAMOS',
    dia: 'SABADO',
    fecha: '21/06/2025',
    hora: '01:05',
    totalCierreCaja: 200
  }
]

const columnHelper = createColumnHelper<ArqueoCajaWithActions>()

const ArqueoCajaTable = () => {
  const [rowSelection, setRowSelection] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mes-actual')

  const router = useRouter()

  const handleVerDetalle = (id: number) => {
    router.push(`/arqueo/list/detalles/${id}`)
  }

  const handleBuscar = () => {
    console.log('Buscando arqueos para el periodo:', periodoSeleccionado)
  }

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(valor)
  }

  const columns = useMemo<ColumnDef<ArqueoCajaWithActions, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      columnHelper.accessor('actions', {
        header: 'Acciones',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <IconButton
              onClick={() => handleVerDetalle(row.original.id)}
              size='small'
              sx={{
                color: 'primary.main',
                '&:hover': { backgroundColor: 'primary.light', color: 'white' }
              }}
            >
              <i className='tabler-eye' style={{ fontSize: '18px' }} />
            </IconButton>
          </div>
        ),
        enableSorting: false
      }),
      columnHelper.accessor('id', {
        header: 'Nro',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.id}
          </Typography>
        )
      }),
      columnHelper.accessor('nombreCajero', {
        header: 'Nombre Cajero',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.nombreCajero}
          </Typography>
        )
      }),
      columnHelper.accessor('dia', {
        header: 'Día',
        cell: ({ row }) => {
          const colorMap: Record<
            string,
            'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
          > = {
            LUNES: 'primary',
            MARTES: 'secondary',
            MIERCOLES: 'info',
            JUEVES: 'warning',
            VIERNES: 'success',
            SABADO: 'error',
            DOMINGO: 'default'
          }

          return (
            <Chip
              label={row.original.dia}
              color={colorMap[row.original.dia] || 'default'}
              variant='tonal'
              size='small'
            />
          )
        }
      }),
      columnHelper.accessor('fecha', {
        header: 'Fecha',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.fecha}</Typography>
      }),
      columnHelper.accessor('hora', {
        header: 'Hora',
        cell: ({ row }) => <Typography color='text.secondary'>{row.original.hora}</Typography>
      }),
      columnHelper.accessor('totalCierreCaja', {
        header: 'Total Cierre de Caja',
        cell: ({ row }) => (
          <Typography
            className='font-bold'
            sx={{
              color: row.original.totalCierreCaja > 0 ? 'success.main' : 'text.disabled',
              fontSize: '1rem'
            }}
          >
            {formatearMoneda(row.original.totalCierreCaja)}
          </Typography>
        )
      })
    ],
    []
  )

  const table = useReactTable({
    data: datosEstaticos,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const total = datosEstaticos.length

  return (
    <Card>
      <div className='flex flex-wrap justify-between gap-4 p-6'>
        <div className='flex flex-wrap gap-4 items-center'>
          <CustomTextField
            select
            value={periodoSeleccionado}
            onChange={e => setPeriodoSeleccionado(e.target.value)}
            label='Periodo de Búsqueda'
            className='min-w-[200px]'
          >
            <MenuItem value='dia'>Día</MenuItem>
            <MenuItem value='semana'>Semana</MenuItem>
            <MenuItem value='mes-anterior'>Mes Anterior</MenuItem>
            <MenuItem value='mes-actual'>Mes Actual</MenuItem>
          </CustomTextField>

          <Button variant='contained' onClick={handleBuscar} startIcon={<i className='tabler-search' />}>
            Buscar
          </Button>
        </div>

        <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
          <CustomTextField
            select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
            className='flex-auto max-sm:is-full sm:is-[70px]'
          >
            <MenuItem value='10'>10</MenuItem>
            <MenuItem value='15'>15</MenuItem>
            <MenuItem value='25'>25</MenuItem>
          </CustomTextField>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={classnames({
                          'flex items-center': header.column.getIsSorted(),
                          'cursor-pointer select-none': header.column.getCanSort()
                        })}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <i className='tabler-chevron-up text-xl' />,
                          desc: <i className='tabler-chevron-down text-xl' />
                        }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {table.getFilteredRowModel().rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-8'>
                  <Typography>No hay arqueos de caja disponibles</Typography>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      <TablePagination
        component={() => (
          <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
            <Typography color='text.disabled'>
              {`Mostrando ${(currentPage - 1) * pageSize + 1} a ${Math.min(currentPage * pageSize, total)} de ${total} Arqueos de Caja`}
            </Typography>
            <Pagination
              shape='rounded'
              color='primary'
              variant='tonal'
              count={Math.ceil(total / pageSize)}
              page={currentPage}
              onChange={(_, page) => setCurrentPage(page)}
              showFirstButton
              showLastButton
            />
          </div>
        )}
        count={total}
        rowsPerPage={pageSize}
        page={currentPage - 1}
        onPageChange={() => {}}
      />
    </Card>
  )
}

export default ArqueoCajaTable
