'use client'

import React, { useEffect, useMemo, useState } from 'react'

import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Collapse from '@mui/material/Collapse'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Divider from '@mui/material/Divider'
import type { TextFieldProps } from '@mui/material/TextField'
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
  getSortedRowModel,
  getExpandedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import { Pagination } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'
import { useTicketsByTravel, useCancelTicket } from '@/hooks/useTickets'
import { useCashierTravels } from '@/hooks/useCashierTravels'
import type { Ticket } from '@/types/api/tickets'

type TicketWithActionsType = Ticket & {
  actions?: string
}
interface TicketsTableProps {
  initialTravelId?: number | null
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

const ExpandedTicketDetails = ({ ticket }: { ticket: Ticket }) => {
  return (
    <Box sx={{ p: 3, bgcolor: 'action.hover' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Box>
          <Typography
            variant='subtitle2'
            color='primary'
            fontWeight={700}
            sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <i className='tabler-user' />
            Información del Comprador
          </Typography>
          <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i
                  className='tabler-user-circle'
                  style={{ fontSize: '18px', color: 'var(--mui-palette-primary-main)' }}
                />
                <Typography variant='body2' color='text.secondary'>
                  Nombre:
                </Typography>
                <Typography variant='body2' fontWeight={600}>
                  {ticket.buyer?.name || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className='tabler-id' style={{ fontSize: '18px', color: 'var(--mui-palette-primary-main)' }} />
                <Typography variant='body2' color='text.secondary'>
                  CI:
                </Typography>
                <Typography variant='body2' fontWeight={600}>
                  {ticket.buyer?.ci || 'N/A'}
                </Typography>
              </Box>
              {ticket.buyer?.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className='tabler-mail' style={{ fontSize: '18px', color: 'var(--mui-palette-primary-main)' }} />
                  <Typography variant='body2' color='text.secondary'>
                    Email:
                  </Typography>
                  <Typography variant='body2' fontWeight={600}>
                    {ticket.buyer.email}
                  </Typography>
                </Box>
              )}
              {ticket.buyer?.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className='tabler-phone' style={{ fontSize: '18px', color: 'var(--mui-palette-primary-main)' }} />
                  <Typography variant='body2' color='text.secondary'>
                    Teléfono:
                  </Typography>
                  <Typography variant='body2' fontWeight={600}>
                    {ticket.buyer.phone}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        <Box>
          <Typography
            variant='subtitle2'
            color='primary'
            fontWeight={700}
            sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <i className='tabler-armchair' />
            Detalles de Asientos y Pasajeros
          </Typography>
          <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
            <Table size='small'>
              <TableBody>
                {ticket.travelSeats && ticket.travelSeats.length > 0
                  ? ticket.travelSeats.map(seat => (
                      <TableRow key={seat.id} sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ p: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={`#${seat.seatNumber}`}
                              size='small'
                              color='primary'
                              variant='outlined'
                              icon={<i className='tabler-armchair' style={{ fontSize: '12px' }} />}
                            />
                            <Typography variant='caption' color='text.secondary'>
                              Piso {seat.deck} | Fila {seat.row} | Col {seat.column}
                            </Typography>
                          </Box>
                          {seat.passenger && (
                            <Box sx={{ ml: 4, mt: 0.5 }}>
                              <Typography variant='caption' color='text.secondary'>
                                <i className='tabler-user' style={{ fontSize: '12px' }} /> {seat.passenger.name}
                              </Typography>
                              {seat.passenger.ci && (
                                <Typography variant='caption' color='text.secondary' sx={{ ml: 1 }}>
                                  CI: {seat.passenger.ci}
                                </Typography>
                              )}
                            </Box>
                          )}
                        </TableCell>
                        <TableCell align='right' sx={{ p: 1 }}>
                          <Typography variant='body2' fontWeight={600} color='success.main'>
                            Bs. {parseFloat(seat.price).toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  : ticket.seats.map((seat, index) => (
                      <TableRow key={index} sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ p: 1 }}>
                          <Chip
                            label={`#${seat.seatNumber}`}
                            size='small'
                            color='primary'
                            variant='outlined'
                            icon={<i className='tabler-armchair' style={{ fontSize: '12px' }} />}
                          />
                        </TableCell>
                        <TableCell align='right' sx={{ p: 1 }}>
                          <Typography variant='body2' fontWeight={600} color='success.main'>
                            Bs. {parseFloat(seat.price).toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box>
            <Typography variant='caption' color='text.secondary'>
              Tipo de Venta
            </Typography>
            <Typography variant='body2' fontWeight={600}>
              {ticket.type === 'IN_OFFICE' ? 'En Oficina' : ticket.type}
            </Typography>
          </Box>
          {ticket.reserve_expiresAt && (
            <Box>
              <Typography variant='caption' color='text.secondary'>
                Expira
              </Typography>
              <Typography variant='body2' fontWeight={600}>
                {new Date(ticket.reserve_expiresAt.replace('Z', '')).toLocaleString('es-ES')}
              </Typography>
            </Box>
          )}
          <Box>
            <Typography variant='caption' color='text.secondary'>
              Fecha de Creación
            </Typography>
            <Typography variant='body2' fontWeight={600}>
              {new Date(ticket.createdAt.replace('Z', '')).toLocaleString('es-ES')}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ bgcolor: 'success.lighter', p: 2, borderRadius: 1, minWidth: 150 }}>
          <Typography variant='caption' color='text.secondary'>
            Total del Ticket
          </Typography>
          <Typography variant='h5' color='success.main' fontWeight={700}>
            Bs. {parseFloat(ticket.total_price).toFixed(2)}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

const columnHelper = createColumnHelper<TicketWithActionsType>()

const TicketsTable = ({ initialTravelId }: TicketsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTravelId, setSelectedTravelId] = useState<number | null>(initialTravelId || null)
  const [openCancelDialog, setOpenCancelDialog] = useState(false)
  const [ticketToCancel, setTicketToCancel] = useState<Ticket | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const { data: travels, isLoading: travelsLoading } = useCashierTravels()
  const { data: tickets, isLoading, error } = useTicketsByTravel(selectedTravelId)
  const cancelTicketMutation = useCancelTicket()

  const [data, setData] = useState<Ticket[]>([])

  useEffect(() => {
    if (initialTravelId !== undefined && initialTravelId !== selectedTravelId) {
      setSelectedTravelId(initialTravelId)
    }
  }, [initialTravelId])

  useEffect(() => {
    if (tickets) {
      setData(tickets)
    }
  }, [tickets])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sold':
      case 'vendido':
        return 'success'
      case 'reserved':
      case 'reservado':
        return 'warning'
      case 'pending':
      case 'pendiente':
        return 'info'
      case 'cancelled':
      case 'cancelado':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sold':
      case 'vendido':
        return 'Vendido'
      case 'reserved':
      case 'reservado':
        return 'Reservado'
      case 'pending':
      case 'pendiente':
        return 'Pendiente'
      case 'cancelled':
      case 'cancelado':
        return 'Cancelado'
      default:
        return status
    }
  }

  const handleCancelTicket = async () => {
    if (!ticketToCancel) return

    try {
      await cancelTicketMutation.mutateAsync(ticketToCancel.id)
      setOpenCancelDialog(false)
      setTicketToCancel(null)
    } catch (error) {
      console.error('Error cancelling ticket:', error)
    }
  }

  const toggleExpanded = (rowId: string) => {
    setExpanded(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }))
  }

  const columns = useMemo<ColumnDef<TicketWithActionsType, any>[]>(
    () => [
      columnHelper.display({
        id: 'expander',
        header: () => null,
        cell: ({ row }) => (
          <IconButton size='small' onClick={() => toggleExpanded(row.id)} sx={{ color: 'primary.main' }}>
            <i
              className={expanded[row.id] ? 'tabler-chevron-down' : 'tabler-chevron-right'}
              style={{ fontSize: '20px' }}
            />
          </IconButton>
        )
      }),
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
      columnHelper.accessor('buyer', {
        header: 'Comprador',
        cell: ({ row }) => (
          <Box>
            <Typography variant='body2' fontWeight={600}>
              {row.original.buyer?.name || 'N/A'}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              CI: {row.original.buyer?.ci || 'N/A'}
            </Typography>
          </Box>
        )
      }),
      columnHelper.accessor('type', {
        header: 'Tipo',
        cell: ({ row }) => (
          <Chip
            label={row.original.type === 'IN_OFFICE' ? 'En Oficina' : row.original.type}
            size='small'
            variant='outlined'
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
              {new Date(row.original.createdAt.replace('Z', '')).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {new Date(row.original.createdAt.replace('Z', '')).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          </Box>
        )
      }),
      columnHelper.accessor('actions', {
        header: 'Acciones',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Tooltip title='Cancelar Ticket'>
              <span>
                <IconButton
                  size='small'
                  onClick={() => {
                    setTicketToCancel(row.original)
                    setOpenCancelDialog(true)
                  }}
                  disabled={row.original.status === 'cancelled' || row.original.status === 'cancelado'}
                  sx={{
                    color: 'error.main',
                    '&:hover': { backgroundColor: 'error.light', color: 'white' },
                    '&.Mui-disabled': { color: 'action.disabled' }
                  }}
                >
                  <i className='tabler-x' style={{ fontSize: '18px' }} />
                </IconButton>
              </span>
            </Tooltip>
          </div>
        ),
        enableSorting: false
      })
    ],
    [expanded]
  )

  const table = useReactTable({
    data: data || [],
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
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getExpandedRowModel: getExpandedRowModel()
  })

  const totalPages = table.getPageCount()

  useEffect(() => {
    table.setPageSize(pageSize)
  }, [pageSize])

  useEffect(() => {
    if (currentPage > 0 && currentPage <= totalPages) {
      table.setPageIndex(currentPage - 1)
    }
  }, [currentPage, totalPages])

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
                Tickets Vendidos
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Selecciona un viaje para ver sus tickets vendidos
              </Typography>
            </div>
          </Box>
        </Box>

        <Box sx={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <CustomTextField
              select
              value={selectedTravelId || ''}
              onChange={e => {
                setSelectedTravelId(e.target.value ? Number(e.target.value) : null)
                setCurrentPage(1)
              }}
              label='Seleccionar Viaje'
              sx={{ minWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    <i className='tabler-bus' />
                  </Box>
                )
              }}
            >
              <MenuItem value=''>
                <em>Selecciona un viaje...</em>
              </MenuItem>
              {travelsLoading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} />
                  <span style={{ marginLeft: 8 }}>Cargando viajes...</span>
                </MenuItem>
              ) : travels && travels.length > 0 ? (
                travels.map(travel => (
                  <MenuItem key={travel.id} value={travel.id}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i
                          className='tabler-flag'
                          style={{ fontSize: '14px', color: 'var(--mui-palette-success-main)' }}
                        />
                        <Typography variant='body2'>{travel.route.officeOrigin.city}</Typography>
                        <i className='tabler-arrow-right' style={{ fontSize: '14px' }} />
                        <i
                          className='tabler-flag-filled'
                          style={{ fontSize: '14px', color: 'var(--mui-palette-error-main)' }}
                        />
                        <Typography variant='body2'>{travel.route.officeDestination.city}</Typography>
                      </Box>
                      <Typography variant='caption' color='text.secondary'>
                        {new Date(travel.departure_time.replace('Z', '')).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}{' '}
                        - {travel.bus.name} ({travel.bus.plaque})
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No hay viajes disponibles</MenuItem>
              )}
            </CustomTextField>

            {selectedTravelId && (
              <DebouncedInput
                value={searchQuery ?? ''}
                onChange={value => setSearchQuery(String(value))}
                placeholder='Buscar tickets...'
                sx={{ flexGrow: 1 }}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                      <i className='tabler-search' />
                    </Box>
                  )
                }}
              />
            )}
          </Box>

          {selectedTravelId && tickets && tickets.length > 0 && (
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
                    {tickets.length}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Total de Asientos
                  </Typography>
                  <Typography variant='h6' fontWeight='bold'>
                    {tickets.reduce((sum, ticket) => sum + ticket.seats.length, 0)}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant='caption' color='text.secondary'>
                  Ingresos Totales
                </Typography>
                <Typography variant='h5' color='success.main' fontWeight='bold'>
                  Bs. {tickets.reduce((sum, ticket) => sum + parseFloat(ticket.total_price || '0'), 0).toFixed(2)}
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
            {!selectedTravelId ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <i
                        className='tabler-bus'
                        style={{ fontSize: '48px', color: 'var(--mui-palette-text-disabled)' }}
                      />
                      <Typography variant='h6' color='text.secondary'>
                        Selecciona un viaje para ver sus tickets vendidos
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
                  <React.Fragment key={row.id}>
                    <tr className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                    {expanded[row.id] && (
                      <tr>
                        <td colSpan={table.getVisibleFlatColumns().length} style={{ padding: 0 }}>
                          <Collapse in={expanded[row.id]} timeout='auto' unmountOnExit>
                            <ExpandedTicketDetails ticket={row.original} />
                          </Collapse>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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

      <Dialog
        open={openCancelDialog}
        onClose={() => {
          setOpenCancelDialog(false)
          setTicketToCancel(null)
        }}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          <Box display='flex' alignItems='center' gap={2}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                bgcolor: 'error.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className='tabler-x' style={{ fontSize: '28px', color: 'white' }} />
            </Box>
            <Typography variant='h5' fontWeight={600}>
              Cancelar Ticket
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
            ¿Estás seguro de que deseas cancelar este ticket?
          </Typography>
          <Box
            sx={{
              bgcolor: 'warning.lighter',
              p: 2,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'warning.main',
              mb: 2
            }}
          >
            <Typography variant='body2' fontWeight={600} color='warning.main'>
              Esta acción no se puede deshacer. El ticket será marcado como cancelado.
            </Typography>
          </Box>
          {ticketToCancel && (
            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                <strong>Ticket:</strong> #{ticketToCancel.id}
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                <strong>Asientos:</strong> {ticketToCancel.seats.map(s => `#${s.seatNumber}`).join(', ')}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                <strong>Total:</strong> Bs. {parseFloat(ticketToCancel.total_price).toFixed(2)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => {
              setOpenCancelDialog(false)
              setTicketToCancel(null)
            }}
            variant='outlined'
            color='secondary'
            fullWidth
            disabled={cancelTicketMutation.isPending}
          >
            No, Mantener
          </Button>
          <Button
            onClick={handleCancelTicket}
            variant='contained'
            color='error'
            fullWidth
            startIcon={cancelTicketMutation.isPending ? <CircularProgress size={16} /> : <i className='tabler-x' />}
            disabled={cancelTicketMutation.isPending}
          >
            {cancelTicketMutation.isPending ? 'Cancelando...' : 'Sí, Cancelar Ticket'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TicketsTable
