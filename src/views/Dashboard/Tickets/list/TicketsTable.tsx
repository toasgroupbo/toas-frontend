'use client'

import { useEffect, useMemo, useState } from 'react'

import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
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
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import { Pagination } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'
import { useTickets, useCreateTicket, useConfirmTicket, useCancelTicket } from '@/hooks/useTickets'
import type { Ticket, CreateTicketDto } from '@/types/api/tickets'
import SellTicketDialog from '@/views/Dashboard/Tickets/components/SellTicketDialog'
import ConfirmTicketDialog from '@/views/Dashboard/Tickets/components/ConfirmTicketDialog'
import CancelTicketDialog from '@/views/Dashboard/Tickets/components/CancelTicketDialog'
import { useSnackbar } from '@/contexts/SnackbarContext'
import { usePermissions } from '@/hooks/usePermissions'

type TicketWithActionsType = Ticket & {
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

const columnHelper = createColumnHelper<TicketWithActionsType>()

const TicketsTable = () => {
  const [rowSelection, setRowSelection] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [sellDialogOpen, setSellDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  const { showSuccess, showError } = useSnackbar()
  const { getCRUDPermissions } = usePermissions()
  const { canCreate, canUpdate, canDelete } = getCRUDPermissions('TICKET')

  const { data: tickets, isLoading, error } = useTickets()
  const createMutation = useCreateTicket()
  const confirmMutation = useConfirmTicket()
  const cancelMutation = useCancelTicket()

  const [data, setData] = useState<Ticket[]>([])

  useEffect(() => {
    if (tickets) {
      setData(tickets)
    }
  }, [tickets])

  const handleSellTicket = async (data: CreateTicketDto) => {
    try {
      await createMutation.mutateAsync(data)
      setSellDialogOpen(false)
      showSuccess('Ticket vendido correctamente')
    } catch (error: any) {
      console.error('Error al vender ticket:', error)
      showError(error?.response?.data?.message || 'Error al vender ticket')
    }
  }

  const handleConfirmTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setConfirmDialogOpen(true)
  }

  const handleConfirmAction = async () => {
    if (!selectedTicket) return

    try {
      await confirmMutation.mutateAsync(selectedTicket.id)
      setConfirmDialogOpen(false)
      setSelectedTicket(null)
      showSuccess('Ticket confirmado correctamente')
    } catch (error: any) {
      console.error('Error al confirmar ticket:', error)
      showError(error?.response?.data?.message || 'Error al confirmar ticket')
    }
  }

  const handleCancelTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setCancelDialogOpen(true)
  }

  const handleCancelAction = async () => {
    if (!selectedTicket) return

    try {
      await cancelMutation.mutateAsync(selectedTicket.id)
      setCancelDialogOpen(false)
      setSelectedTicket(null)
      showSuccess('Ticket cancelado correctamente')
    } catch (error: any) {
      console.error('Error al cancelar ticket:', error)
      showError(error?.response?.data?.message || 'Error al cancelar ticket')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'reserved':
      case 'reservado':
        return 'info'
      case 'pending':
      case 'pendiente':
        return 'warning'
      case 'confirmed':
      case 'confirmado':
        return 'success'
      case 'cancelled':
      case 'cancelado':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'reserved':
      case 'reservado':
        return 'Reservado'
      case 'pending':
      case 'pendiente':
        return 'Pendiente'
      case 'confirmed':
      case 'confirmado':
        return 'Confirmado'
      case 'cancelled':
      case 'cancelado':
        return 'Cancelado'
      default:
        return status
    }
  }

  const columns = useMemo<ColumnDef<TicketWithActionsType, any>[]>(
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
      columnHelper.accessor('customer', {
        header: 'Cliente',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              {row.original.customer?.name?.charAt(0).toUpperCase() || '?'}
            </Box>
            <div className='flex flex-col'>
              <Typography variant='body2' fontWeight='medium'>
                {row.original.customer?.name || 'Sin información'}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                CI: {row.original.customer?.ci || 'N/A'}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('travel', {
        header: 'Viaje',
        cell: ({ row }) => {
          if (!row.original.travel) {
            return (
              <Typography variant='caption' color='text.secondary'>
                Sin información de viaje
              </Typography>
            )
          }

          return (
            <div className='flex flex-col gap-1'>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <div className='flex items-center gap-1'>
                  <i className='tabler-flag' style={{ fontSize: '14px', color: 'var(--mui-palette-success-main)' }} />
                  <Typography variant='caption' fontWeight='medium'>
                    {row.original.travel.route?.officeOrigin?.city || 'N/A'}
                  </Typography>
                </div>
                <i className='tabler-arrow-right' style={{ fontSize: '14px' }} />
                <div className='flex items-center gap-1'>
                  <i
                    className='tabler-flag-filled'
                    style={{ fontSize: '14px', color: 'var(--mui-palette-error-main)' }}
                  />
                  <Typography variant='caption' fontWeight='medium'>
                    {row.original.travel.route?.officeDestination?.city || 'N/A'}
                  </Typography>
                </div>
              </Box>
              <Typography variant='caption' color='text.secondary'>
                {row.original.travel.departure_time}
              </Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('seats', {
        header: 'Asientos',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {row.original.seats.slice(0, 3).map((seat, index) => (
              <Chip key={index} label={seat.seatNumber} size='small' variant='outlined' />
            ))}
            {row.original.seats.length > 3 && (
              <Chip label={`+${row.original.seats.length - 3}`} size='small' variant='outlined' />
            )}
          </Box>
        )
      }),
      columnHelper.accessor('total_price', {
        header: 'Total',
        cell: ({ row }) => (
          <Chip
            label={`Bs. ${row.original.total_price}`}
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
        header: 'Fecha',
        cell: ({ row }) => (
          <Typography variant='body2'>
            {new Date(row.original.createdAt).toLocaleDateString('es-BO', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>
        )
      }),
      columnHelper.accessor('actions', {
        header: 'Acciones',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            {row.original.status.toLowerCase() === 'pending' ||
              (row.original.status.toLowerCase() === 'pendiente' && (
                <>
                  {canUpdate && (
                    <Tooltip title='Confirmar Ticket'>
                      <IconButton size='small' color='success' onClick={() => handleConfirmTicket(row.original)}>
                        <i className='tabler-check' />
                      </IconButton>
                    </Tooltip>
                  )}
                  {canDelete && (
                    <Tooltip title='Cancelar Ticket'>
                      <IconButton size='small' color='error' onClick={() => handleCancelTicket(row.original)}>
                        <i className='tabler-x' />
                      </IconButton>
                    </Tooltip>
                  )}
                </>
              ))}
            {(row.original.status.toLowerCase() === 'confirmed' ||
              row.original.status.toLowerCase() === 'confirmado') && (
              <Chip label='Ticket Confirmado' color='success' size='small' variant='outlined' />
            )}
            {(row.original.status.toLowerCase() === 'cancelled' ||
              row.original.status.toLowerCase() === 'cancelado') && (
              <Chip label='Ticket Cancelado' color='error' size='small' variant='outlined' />
            )}
          </div>
        ),
        enableSorting: false
      })
    ],
    [canUpdate, canDelete]
  )

  const table = useReactTable({
    data: data || [],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter: searchQuery
    },
    initialState: {
      pagination: {
        pageSize: pageSize
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
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
                Listado de Tickets
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Gestiona el estado de los tickets vendidos
              </Typography>
            </div>
          </Box>
        </Box>

        <Box sx={{ padding: '0 20px 20px' }}>
          <DebouncedInput
            value={searchQuery ?? ''}
            onChange={value => setSearchQuery(String(value))}
            placeholder='Buscar tickets...'
            className='w-full sm:w-auto'
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                  <i className='tabler-search' />
                </Box>
              )
            }}
          />
        </Box>

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
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    <Typography variant='body2' color='text.secondary' sx={{ py: 4 }}>
                      No se encontraron tickets
                    </Typography>
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

      <SellTicketDialog
        open={sellDialogOpen}
        onClose={() => setSellDialogOpen(false)}
        onSubmit={handleSellTicket}
        isLoading={createMutation.isPending}
      />

      <ConfirmTicketDialog
        open={confirmDialogOpen}
        onClose={() => {
          setConfirmDialogOpen(false)
          setSelectedTicket(null)
        }}
        onConfirm={handleConfirmAction}
        ticket={selectedTicket}
        isLoading={confirmMutation.isPending}
      />

      <CancelTicketDialog
        open={cancelDialogOpen}
        onClose={() => {
          setCancelDialogOpen(false)
          setSelectedTicket(null)
        }}
        onConfirm={handleCancelAction}
        ticket={selectedTicket}
        isLoading={cancelMutation.isPending}
      />
    </Box>
  )
}

export default TicketsTable
