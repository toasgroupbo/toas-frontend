'use client'

import { useEffect, useMemo, useState } from 'react'

import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
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
import { Pagination } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'
import { useTicketsByTravelAndCompany } from '@/hooks/useTickets'
import type { Ticket } from '@/types/api/tickets'
import TicketDetailDialog from '@/views/Dashboard/Tickets/sold/components/TicketDetailDialog'
import { getStatusColor, getStatusLabel } from '@/views/Dashboard/Tickets/sold/utils/ticketStatus'
import { formatDate, formatTime } from '@/views/Dashboard/Tickets/sale/utils/dateFormatters'
import { printTicketReceipt } from '@/views/Dashboard/Tickets/sold/utils/printReceipt'

type TicketWithActionsType = Ticket & {
  actions?: string
}

interface TicketsTableProps {
  initialTravelId?: number | null
  showCancelButton?: boolean
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const columnHelper = createColumnHelper<TicketWithActionsType>()

const TicketsTable = ({ initialTravelId, showCancelButton = false }: TicketsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTravelId, setSelectedTravelId] = useState<number | null>(initialTravelId || null)
  const [openDetailDialog, setOpenDetailDialog] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data: apiResponse, isLoading, error } = useTicketsByTravelAndCompany(selectedTravelId)

  const [data, setData] = useState<Ticket[]>([])

  useEffect(() => {
    if (initialTravelId !== undefined && initialTravelId !== selectedTravelId) {
      setSelectedTravelId(initialTravelId)
    }
  }, [initialTravelId])

  useEffect(() => {
    if (apiResponse && apiResponse.tickets && Array.isArray(apiResponse.tickets)) {
      setData(apiResponse.tickets)
    } else if (apiResponse && Array.isArray(apiResponse)) {
      setData(apiResponse)
    } else if (apiResponse && !Array.isArray(apiResponse)) {
      setData([])
    }
  }, [apiResponse])

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return []
    if (statusFilter === 'all') return data

    return data.filter(ticket => ticket.status === statusFilter)
  }, [data, statusFilter])

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setOpenDetailDialog(true)
  }

  const columns = useMemo<ColumnDef<TicketWithActionsType, any>[]>(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: ({ row }) => (
          <Chip
            label={`#${row.original.id}`}
            color='primary'
            variant='tonal'
            size='small'
            icon={<i className='tabler-ticket' style={{ fontSize: '14px' }} />}
          />
        )
      }),
      columnHelper.accessor('actions', {
        header: 'Acciones',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <Tooltip title='Ver Detalle'>
              <IconButton
                size='small'
                onClick={e => {
                  e.stopPropagation()
                  handleViewTicket(row.original)
                }}
                color='info'
              >
                <i className='tabler-eye' style={{ fontSize: '18px' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title='Imprimir'>
              <IconButton
                size='small'
                onClick={e => {
                  e.stopPropagation()
                  printTicketReceipt(row.original)
                }}
                color='primary'
              >
                <i className='tabler-printer' style={{ fontSize: '18px' }} />
              </IconButton>
            </Tooltip>
          </div>
        ),
        enableSorting: false
      }),
      columnHelper.accessor('buyer', {
        header: 'Comprador',
        cell: ({ row }) => (
          <Box>
            <Typography variant='body2' fontWeight={600}>
              {row.original.billing?.nombre || row.original.buyer?.name || 'N/A'}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              CI: {row.original.billing?.ci || row.original.buyer?.ci || 'N/A'}
            </Typography>
          </Box>
        )
      }),
      columnHelper.accessor('type', {
        header: 'Tipo',
        cell: ({ row }) => (
          <Chip
            label={
              row.original.type === 'IN_OFFICE'
                ? 'En Oficina'
                : row.original.type === 'IN_APP'
                  ? 'En Aplicación'
                  : row.original.type
            }
            size='small'
            variant='outlined'
            color={row.original.type === 'IN_APP' ? 'info' : 'default'}
          />
        )
      }),
      columnHelper.accessor('seats', {
        header: 'Asientos',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {row.original.seats.slice(0, 3).map((seat, index) => (
              <Chip
                key={index}
                label={`#${seat.seatNumber}`}
                size='small'
                variant='outlined'
                icon={<i className='tabler-armchair' style={{ fontSize: '12px' }} />}
              />
            ))}
            {row.original.seats.length > 3 && (
              <Chip label={`+${row.original.seats.length - 3}`} size='small' variant='outlined' color='primary' />
            )}
          </Box>
        )
      }),
      columnHelper.accessor('total_price', {
        header: 'Total',
        cell: ({ row }) => (
          <Chip
            label={`Bs. ${parseFloat(row.original.total_price).toFixed(2)}`}
            color='success'
            variant='tonal'
            size='small'
            icon={<i className='tabler-currency-dollar' style={{ fontSize: '14px' }} />}
          />
        )
      }),
      columnHelper.accessor('payment_type', {
        header: 'Método de Pago',
        cell: ({ row }) => (
          <Chip
            label={
              row.original.payment_type === 'qr' ? 'QR' : row.original.payment_type === 'cash' ? 'Efectivo' : 'N/A'
            }
            color={row.original.payment_type === 'qr' ? 'info' : 'warning'}
            variant='tonal'
            size='small'
            icon={
              <i
                className={row.original.payment_type === 'qr' ? 'tabler-qrcode' : 'tabler-cash'}
                style={{ fontSize: '14px' }}
              />
            }
          />
        )
      }),
      columnHelper.accessor('status', {
        header: 'Estado',
        cell: ({ row }) => (
          <Chip
            label={getStatusLabel(row.original.status)}
            color={getStatusColor(row.original.status)}
            variant='tonal'
            size='small'
          />
        )
      }),
      columnHelper.accessor('createdAt', {
        header: 'Fecha de Venta',
        cell: ({ row }) => (
          <Box>
            <Typography variant='body2' fontWeight='medium'>
              {formatDate(row.original.createdAt)}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {formatTime(row.original.createdAt)}
            </Typography>
          </Box>
        )
      })
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      globalFilter: searchQuery
    },
    initialState: {
      pagination: {
        pageSize: pageSize
      }
    },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setSearchQuery,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const totalPages = table.getPageCount()

  useEffect(() => {
    table.setPageSize(pageSize)
  }, [pageSize, table])

  useEffect(() => {
    if (currentPage > 0 && currentPage <= totalPages) {
      table.setPageIndex(currentPage - 1)
    }
  }, [currentPage, totalPages, table])

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity='error' sx={{ m: 2 }}>
        Error al cargar los tickets. Por favor, intenta de nuevo.
      </Alert>
    )
  }

  return (
    <Box>
      <Card>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
            <i className='tabler-ticket' style={{ fontSize: '32px', color: 'var(--mui-palette-primary-main)' }} />
            <div>
              <Typography variant='h5' fontWeight='bold'>
                Tickets del Viaje
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {initialTravelId
                  ? 'Mostrando tickets del viaje seleccionado'
                  : 'Selecciona un viaje para ver sus tickets'}
              </Typography>
            </div>
          </Box>
          {(selectedTravelId || initialTravelId) && (
            <CustomTextField
              select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              label='Filtrar por Estado'
              size='small'
              sx={{ minWidth: 150 }}
            >
              <MenuItem value='all'>Todos</MenuItem>
              <MenuItem value='sold'>Vendido</MenuItem>
              <MenuItem value='cancelled'>Cancelado</MenuItem>
            </CustomTextField>
          )}
        </Box>

        <Box sx={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {(selectedTravelId || initialTravelId) && Array.isArray(data) && data.length > 0 && (
            <Box
              sx={{
                p: 2,
                bgcolor: 'success.lighter',
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap'
              }}
            >
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Total de Tickets
                  </Typography>
                  <Typography variant='h6' fontWeight='bold'>
                    {filteredData.length}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Total de Asientos
                  </Typography>
                  <Typography variant='h6' fontWeight='bold'>
                    {filteredData.reduce((sum, ticket) => sum + ticket.seats.length, 0)}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant='caption' color='text.secondary'>
                  Ingresos Totales
                </Typography>
                <Typography variant='h5' color='success.main' fontWeight='bold'>
                  Bs. {filteredData.reduce((sum, ticket) => sum + parseFloat(ticket.total_price || '0'), 0).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={{ height: '20px' }} />

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
            {!selectedTravelId && !initialTravelId ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <i
                        className='tabler-bus'
                        style={{ fontSize: '48px', color: 'var(--mui-palette-text-disabled)' }}
                      />
                      <Typography variant='h6' color='text.secondary'>
                        Selecciona un viaje para ver sus tickets
                      </Typography>
                    </Box>
                  </td>
                </tr>
              </tbody>
            ) : table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    <Typography variant='body2' color='text.secondary' sx={{ py: 4 }}>
                      No se encontraron tickets para este viaje
                    </Typography>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className={classnames({ selected: row.getIsSelected() })}
                    onClick={() => handleViewTicket(row.original)}
                    style={{ cursor: 'pointer' }}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
          <Typography variant='body2' color='text.secondary'>
            Mostrando {table.getFilteredRowModel().rows.length > 0 ? currentPage * pageSize - pageSize + 1 : 0} a{' '}
            {Math.min(currentPage * pageSize, table.getFilteredRowModel().rows.length)} de{' '}
            {table.getFilteredRowModel().rows.length} tickets
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <CustomTextField
              select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              sx={{ width: '80px' }}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </CustomTextField>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_, page) => setCurrentPage(page)}
              color='primary'
              variant='tonal'
            />
          </Box>
        </Box>
      </Card>

      <TicketDetailDialog
        open={openDetailDialog}
        onClose={() => {
          setOpenDetailDialog(false)
          setSelectedTicket(null)
        }}
        ticket={selectedTicket}
      />
    </Box>
  )
}

export default TicketsTable
