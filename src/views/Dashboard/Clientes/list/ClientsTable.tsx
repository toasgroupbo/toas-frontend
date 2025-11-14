'use client'

import { useState, useMemo, useEffect } from 'react'

import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import { Pagination } from '@mui/material'
import Checkbox from '@mui/material/Checkbox'
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'
import type { TextFieldProps } from '@mui/material/TextField'

import { useCustomers } from '@/hooks/useCustomers'
import type { Customer } from '@/types/api/customers'
import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'

type CustomerWithActionsType = Customer & {
  actions?: string
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const columnHelper = createColumnHelper<CustomerWithActionsType>()

const ClientsTable = () => {
  const [rowSelection, setRowSelection] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [verificationFilter, setVerificationFilter] = useState<boolean | 'all'>('all')

  const { data: customersResponse, isLoading, error } = useCustomers({
    page: currentPage,
    limit: pageSize,
    search: searchQuery,
    is_verified: verificationFilter
  })

  const customers = customersResponse?.data || []
  const meta = customersResponse?.meta

  const columns = useMemo<ColumnDef<CustomerWithActionsType, any>[]>(
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
      columnHelper.accessor('name', {
        header: 'Nombre',
        cell: ({ row }) => (
          <Box display='flex' alignItems='center' gap={2}>
            <Typography className='font-medium' color='text.primary'>
              {row.original.name}
            </Typography>
          </Box>
        )
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.secondary'>
            {row.original.email}
          </Typography>
        )
      }),
      columnHelper.accessor('ci', {
        header: 'CI',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.secondary'>
            {row.original.ci || '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('phone', {
        header: 'Teléfono',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.secondary'>
            {row.original.phone || '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('provider', {
        header: 'Proveedor',
        cell: ({ row }) => (
          <Chip
            label={row.original.provider}
            size='small'
            color={row.original.provider === 'google' ? 'primary' : 'default'}
            variant='tonal'
          />
        )
      }),
      columnHelper.accessor('is_verified', {
        header: 'Verificado',
        cell: ({ row }) => (
          <Chip
            label={row.original.is_verified ? 'Verificado' : 'No verificado'}
            size='small'
            color={row.original.is_verified ? 'success' : 'warning'}
            variant='tonal'
          />
        )
      })
    ],
    []
  )

  const table = useReactTable<CustomerWithActionsType>({
    data: customers,
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
    getSortedRowModel: getSortedRowModel()
  })

  if (isLoading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity='error'>Error al cargar los clientes. Por favor, intenta nuevamente.</Alert>
  }

  return (
    <Box>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <div className='flex flex-wrap gap-4 items-center'>
            <DebouncedInput
              value={searchQuery}
              onChange={value => {
                setSearchQuery(String(value))
                setCurrentPage(1)
              }}
              placeholder='Buscar clientes...'
              className='max-sm:is-full min-w-[300px] flex-1 max-w-md'
            />

            <CustomTextField
              select
              value={verificationFilter}
              onChange={e => {
                const value = e.target.value

                setVerificationFilter(value === 'all' ? 'all' : value === 'true')
                setCurrentPage(1)
              }}
              className='min-w-[180px]'
              label='Estado de verificación'
            >
              <MenuItem value='all'>Todos</MenuItem>
              <MenuItem value='true'>Verificados</MenuItem>
              <MenuItem value='false'>No verificados</MenuItem>
            </CustomTextField>
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

            {customers.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-8'>
                    <Typography>No hay clientes disponibles</Typography>
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
                {meta
                  ? `Mostrando ${meta.offset + 1} a ${Math.min(meta.offset + meta.limit, meta.total)} de ${meta.total} clientes`
                  : 'Cargando...'}
              </Typography>
              {meta && (
                <Pagination
                  shape='rounded'
                  color='primary'
                  variant='tonal'
                  count={meta.lastPage}
                  page={currentPage}
                  onChange={(_, page) => setCurrentPage(page)}
                  showFirstButton
                  showLastButton
                />
              )}
            </div>
          )}
          count={meta?.total || 0}
          rowsPerPage={pageSize}
          page={currentPage - 1}
          onPageChange={() => {}}
        />
      </Card>
    </Box>
  )
}

export default ClientsTable
