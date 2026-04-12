'use client'

import { useState, useMemo, useEffect } from 'react'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import { Pagination } from '@mui/material'
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

import type { ClosedTravel } from '@/hooks/useClosedTravels'
import { useClosedTravels } from '@/hooks/useClosedTravels'
import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper<ClosedTravel>()

const ClosedTravelsTable = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: pageSize,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    }),
    [currentPage, pageSize, startDate, endDate]
  )

  const { data: travelsResponse, isLoading, error } = useClosedTravels(queryParams)

  const travels = travelsResponse?.data || []
  const meta = travelsResponse?.meta

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(null), 3000)

      return () => clearTimeout(timer)
    }
  }, [alertMessage])

  const formatCurrency = (value: string) => `Bs ${parseFloat(value).toFixed(2)}`

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

  const columns = useMemo<ColumnDef<ClosedTravel, any>[]>(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.secondary'>
            #{row.original.id}
          </Typography>
        )
      }),
      columnHelper.accessor('departure_time', {
        header: 'Salida',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.secondary'>
            {formatDate(row.original.departure_time)}
          </Typography>
        )
      }),
      columnHelper.accessor('arrival_time', {
        header: 'Llegada',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.secondary'>
            {formatDate(row.original.arrival_time)}
          </Typography>
        )
      }),
      columnHelper.accessor('type', {
        header: 'Tipo',
        cell: ({ row }) => <Chip label={row.original.type} size='small' color='default' variant='tonal' />
      }),
      columnHelper.accessor('tickets_count', {
        header: 'Tickets',
        cell: ({ row }) => (
          <Box display='flex' flexDirection='column' gap={0.5}>
            <Typography variant='body2' color='text.primary'>
              Total: {row.original.tickets_count}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Oficina: {row.original.tickets_office_count} / App: {row.original.tickets_app_count}
            </Typography>
          </Box>
        )
      }),
      columnHelper.accessor('total', {
        header: 'Total',
        cell: ({ row }) => (
          <Typography variant='body2' fontWeight={600} color='text.primary'>
            {formatCurrency(row.original.total)}
          </Typography>
        )
      }),
      columnHelper.accessor('cash_amount', {
        header: 'Efectivo',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.secondary'>
            {formatCurrency(row.original.cash_amount)}
          </Typography>
        )
      }),
      columnHelper.accessor('qr_amount', {
        header: 'QR',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.secondary'>
            {formatCurrency(row.original.qr_amount)}
          </Typography>
        )
      }),
      columnHelper.accessor('app_amount', {
        header: 'App',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.secondary'>
            {formatCurrency(row.original.app_amount)}
          </Typography>
        )
      }),
      columnHelper.accessor('net_to_company', {
        header: 'Neto Empresa',
        cell: ({ row }) => (
          <Typography variant='body2' fontWeight={600} color='success.main'>
            {formatCurrency(row.original.net_to_company)}
          </Typography>
        )
      }),
      columnHelper.accessor('isPaid', {
        header: 'Pagado',
        cell: ({ row }) => (
          <Chip
            label={row.original.isPaid ? 'Pagado' : 'Pendiente'}
            size='small'
            color={row.original.isPaid ? 'success' : 'warning'}
            variant='tonal'
          />
        )
      }),
      columnHelper.accessor('closedBy', {
        header: 'Cerrado por',
        cell: ({ row }) => (
          <Box display='flex' flexDirection='column'>
            <Typography variant='body2' color='text.primary'>
              {row.original.closedBy?.fullName || '-'}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {row.original.closedBy?.email || ''}
            </Typography>
          </Box>
        )
      }),
      columnHelper.accessor('closedAt', {
        header: 'Cerrado el',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.secondary'>
            {row.original.closedAt ? formatDate(row.original.closedAt) : '-'}
          </Typography>
        )
      })
    ],
    []
  )

  const table = useReactTable<ClosedTravel>({
    data: travels,
    columns,
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
    return <Alert severity='error'>Error al cargar los viajes cerrados. Por favor, intenta nuevamente.</Alert>
  }

  return (
    <Box>
      {alertMessage && (
        <Alert severity={alertMessage.type} sx={{ mb: 2 }}>
          {alertMessage.text}
        </Alert>
      )}

      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <div className='flex flex-wrap gap-4 items-center'>
            <CustomTextField
              type='date'
              label='Fecha inicio'
              value={startDate}
              onChange={e => {
                setStartDate(e.target.value)
                setCurrentPage(1)
              }}
              InputLabelProps={{ shrink: true }}
              className='min-w-[180px]'
            />

            <CustomTextField
              type='date'
              label='Fecha fin'
              value={endDate}
              onChange={e => {
                setEndDate(e.target.value)
                setCurrentPage(1)
              }}
              InputLabelProps={{ shrink: true }}
              className='min-w-[180px]'
            />

            {(startDate || endDate) && (
              <Button
                variant='outlined'
                color='secondary'
                size='small'
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                  setCurrentPage(1)
                }}
              >
                Limpiar filtros
              </Button>
            )}
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

            {travels.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-8'>
                    <Typography>No hay viajes cerrados disponibles</Typography>
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
                  ? `Mostrando ${meta.offset + 1} a ${Math.min(meta.offset + meta.limit, meta.total)} de ${meta.total} viajes`
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

export default ClosedTravelsTable
