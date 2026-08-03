'use client'

import { useEffect, useMemo, useState, useRef } from 'react'

import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import type { TextFieldProps } from '@mui/material/TextField'
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import { Pagination } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'
import { useTravelsForAdmin, type TravelFilters } from '@/hooks/useTravels'
import type { Travel } from '@/types/api/travels'
import AdminTicketsTable from '../components/AdminTicketsTable'
import TravelDetailDialog from '../components/TravelDetailDialog'

const getTodayDate = () => new Date().toISOString().split('T')[0]

// Helper to validate complete date format (YYYY-MM-DD = 10 chars)
const isValidDateInput = (date: string) => date === '' || date.length === 10

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

const columnHelper = createColumnHelper<Travel>()

const ViajesListTable = () => {
  const [rowSelection, setRowSelection] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('active')
  const [startDate, setStartDate] = useState<string>(getTodayDate())
  const [endDate, setEndDate] = useState<string>('')
  const [startDateInput, setStartDateInput] = useState<string>(getTodayDate())
  const [endDateInput, setEndDateInput] = useState<string>('')
  const [originPlaceId, setOriginPlaceId] = useState<string>('')
  const [destinationPlaceId, setDestinationPlaceId] = useState<string>('')
  const [ticketsDialogOpen, setTicketsDialogOpen] = useState(false)
  const [selectedTravel, setSelectedTravel] = useState<Travel | null>(null)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [reportTravel, setReportTravel] = useState<Travel | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Refs to track if this is the initial mount (to avoid resetting page on first render)
  const isInitialStartDate = useRef(true)
  const isInitialEndDate = useRef(true)

  // Debounce effect for start date
  useEffect(() => {
    if (!isValidDateInput(startDateInput)) return

    // Capture the initial state BEFORE the timeout
    const shouldResetPage = !isInitialStartDate.current

    if (isInitialStartDate.current) {
      isInitialStartDate.current = false
    }

    const timeout = setTimeout(() => {
      setStartDate(startDateInput)

      if (shouldResetPage) {
        setCurrentPage(1)
      }
    }, 800)

    return () => clearTimeout(timeout)
  }, [startDateInput])

  // Debounce effect for end date
  useEffect(() => {
    if (!isValidDateInput(endDateInput)) return

    // Capture the initial state BEFORE the timeout
    const shouldResetPage = !isInitialEndDate.current

    if (isInitialEndDate.current) {
      isInitialEndDate.current = false
    }

    const timeout = setTimeout(() => {
      setEndDate(endDateInput)

      if (shouldResetPage) {
        setCurrentPage(1)
      }
    }, 800)

    return () => clearTimeout(timeout)
  }, [endDateInput])

  const apiFilters = useMemo((): TravelFilters => {
    return {
      page: currentPage,
      limit: pageSize,
      status: statusFilter !== 'all' ? (statusFilter as 'active' | 'closed' | 'cancelled') : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      origin_placeId: originPlaceId ? Number(originPlaceId) : undefined,
      destination_placeId: destinationPlaceId ? Number(destinationPlaceId) : undefined
    }
  }, [currentPage, pageSize, statusFilter, startDate, endDate, originPlaceId, destinationPlaceId])

  const { data: travelsResponse, isLoading, error } = useTravelsForAdmin(apiFilters)

  const travels = useMemo(() => travelsResponse?.data || [], [travelsResponse?.data])
  const meta = travelsResponse?.meta

  // Get totals from API response amounts
  const amounts = travelsResponse?.amounts || { cash: 0, qr: 0, app: 0 }
  const totalCash = amounts.cash
  const totalQr = amounts.qr
  const totalApp = amounts.app
  const totalGeneral = totalCash + totalQr + totalApp

  const uniqueOrigins = useMemo(() => {
    if (!travels) return []
    const originsMap = new Map<number, { id: number; name: string }>()

    travels.forEach(travel => {
      const place = travel.route?.officeOrigin?.place

      if (place && !originsMap.has(place.id)) {
        originsMap.set(place.id, { id: place.id, name: place.name })
      }
    })

    return Array.from(originsMap.values())
  }, [travels])

  const uniqueDestinations = useMemo(() => {
    if (!travels) return []
    const destinationsMap = new Map<number, { id: number; name: string }>()

    travels.forEach(travel => {
      const place = travel.route?.officeDestination?.place

      if (place && !destinationsMap.has(place.id)) {
        destinationsMap.set(place.id, { id: place.id, name: place.name })
      }
    })

    return Array.from(destinationsMap.values())
  }, [travels])

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)

    return date.toLocaleString('es-BO', {
      timeZone: 'America/La_Paz',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateOnly = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)

    return date.toLocaleDateString('es-BO', {
      timeZone: 'America/La_Paz',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTimeOnly = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)

    return date.toLocaleTimeString('es-BO', {
      timeZone: 'America/La_Paz',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

    return `Bs. ${numAmount.toFixed(2)}`
  }

  const handleViewTickets = (travel: Travel) => {
    setSelectedTravel(travel)
    setTicketsDialogOpen(true)
  }

  const handleCloseTicketsDialog = () => {
    setTicketsDialogOpen(false)
    setSelectedTravel(null)
  }

  const handleViewReport = (travel: Travel) => {
    setReportTravel(travel)
    setReportDialogOpen(true)
  }

  const handleCloseReportDialog = () => {
    setReportDialogOpen(false)
    setReportTravel(null)
  }

  const columns = useMemo<ColumnDef<Travel, any>[]>(
    () => [
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <Tooltip title='Ver Tickets'>
              <IconButton
                size='small'
                onClick={e => {
                  e.stopPropagation()
                  handleViewTickets(row.original)
                }}
                color='info'
              >
                <i className='tabler-ticket' style={{ fontSize: '18px' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title='Ver Reporte / Imprimir'>
              <IconButton
                size='small'
                onClick={e => {
                  e.stopPropagation()
                  handleViewReport(row.original)
                }}
                color='primary'
              >
                <i className='tabler-printer' style={{ fontSize: '18px' }} />
              </IconButton>
            </Tooltip>
          </div>
        ),
        enableSorting: false
      },
      columnHelper.accessor('bus', {
        header: 'Bus',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <i className='tabler-bus' style={{ fontSize: '20px', color: 'var(--mui-palette-primary-main)' }} />
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary' variant='body2'>
                {row.original.bus.name}
              </Typography>
              <Chip label={row.original.bus.plaque} size='small' variant='outlined' />
            </div>
          </div>
        )
      }),
      columnHelper.accessor('route', {
        header: 'Ruta / Salida',
        cell: ({ row }) => {
          const originCity = row.original.route?.officeOrigin?.place?.name || 'N/A'
          const destinationCity = row.original.route?.officeDestination?.place?.name || 'N/A'

          return (
            <div className='flex flex-col gap-1'>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'action.hover'
                }}
              >
                <div className='flex items-center gap-1'>
                  <i className='tabler-flag' style={{ fontSize: '16px', color: 'var(--mui-palette-success-main)' }} />
                  <Typography variant='caption' fontWeight='medium'>
                    {originCity}
                  </Typography>
                </div>
                <i className='tabler-arrow-right' style={{ fontSize: '16px' }} />
                <div className='flex items-center gap-1'>
                  <i
                    className='tabler-flag-filled'
                    style={{ fontSize: '16px', color: 'var(--mui-palette-error-main)' }}
                  />
                  <Typography variant='caption' fontWeight='medium'>
                    {destinationCity}
                  </Typography>
                </div>
              </Box>
              <div className='flex items-center gap-1'>
                <i className='tabler-clock' style={{ fontSize: '14px', color: 'var(--mui-palette-info-main)' }} />
                <Typography variant='caption'>{formatDateTime(row.original.departure_time)}</Typography>
              </div>
            </div>
          )
        }
      }),
      columnHelper.accessor('app_amount', {
        header: 'Monto App',
        cell: ({ row }) => {
          const appAmount = parseFloat((row.original as any).app_amount || '0')
          const appSoldSeats = (row.original as any).seatsApp || 0

          return (
            <div className='flex flex-col'>
              <Typography variant='body2' fontWeight='bold'>
                {appSoldSeats} de asientos
              </Typography>
              <Typography variant='body2' fontWeight='medium' color='success.main'>
                {formatCurrency(appAmount)}
              </Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('qr_amount', {
        header: 'Monto QR',
        cell: ({ row }) => {
          const qrAmount = parseFloat((row.original as any).qr_amount || '0')
          const qrSoldSeats = (row.original as any).seatsQr || 0

          return (
            <div className='flex flex-col'>
              <Typography variant='body2' fontWeight='bold'>
                {qrSoldSeats} asientos
              </Typography>
              <Typography variant='body2' fontWeight='medium' color='info.main'>
                {formatCurrency(qrAmount)}
              </Typography>
            </div>
          )
        }
      }),

      columnHelper.accessor('cash_amount', {
        header: 'Monto Efectivo',
        cell: ({ row }) => {
          const cashAmount = parseFloat((row.original as any).cash_amount || '0')
          const cashSoldSeats = (row.original as any).seatsCash || 0

          return (
            <div className='flex flex-col'>
              <Typography variant='body2' fontWeight='bold'>
                {cashSoldSeats} asientos
              </Typography>
              <Typography variant='body2' fontWeight='medium' color='warning.main'>
                {formatCurrency(cashAmount)}
              </Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('totalSoldSeats', {
        header: 'Vendido Total',
        cell: ({ row }) => {
          const totalSoldSeats = (row.original as any).totalSoldSeats || 0
          const totalBusSeats = (row.original as any).totalBusSeats || 0

          const totalSoldAmount =
            parseFloat((row.original as any).app_amount || '0') +
            parseFloat((row.original as any).cash_amount || '0') +
            parseFloat((row.original as any).qr_amount || '0')

          return (
            <div className='flex flex-col'>
              <Typography variant='body2' fontWeight='bold'>
                {totalSoldSeats} de {totalBusSeats} asientos
              </Typography>
              <Typography variant='caption' color='primary.main' fontWeight='medium'>
                {formatCurrency(totalSoldAmount)}
              </Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('type', {
        header: 'Tipo',
        cell: ({ row }) => (
          <Chip
            label={row.original.type === 'normal' ? 'Normal' : 'Habilitada'}
            color={row.original.type === 'habilitada' ? 'warning' : 'primary'}
            variant='tonal'
            size='small'
            icon={
              <i
                className={row.original.type === 'habilitada' ? 'tabler-star-filled' : 'tabler-circle-filled'}
                style={{ fontSize: '14px' }}
              />
            }
          />
        )
      }),
      columnHelper.accessor('travel_status', {
        header: 'Estado',
        cell: ({ row }) => {
          const statusMap: Record<string, { label: string; color: 'success' | 'default' | 'error' | 'warning' }> = {
            active: { label: 'Activo', color: 'success' },
            closed: { label: 'Cerrado', color: 'default' },
            cancelled: { label: 'Cancelado', color: 'error' }
          }

          const status = statusMap[row.original.travel_status] || {
            label: row.original.travel_status,
            color: 'default'
          }

          return (
            <Chip
              label={status.label}
              color={status.color}
              variant='tonal'
              size='small'
              icon={
                <i
                  className={row.original.travel_status === 'active' ? 'tabler-check' : 'tabler-x'}
                  style={{ fontSize: '14px' }}
                />
              }
            />
          )
        }
      }),
      columnHelper.accessor('closedAt', {
        header: 'Fecha Cierre',
        cell: ({ row }) => {
          if (!row.original.closedAt) return <Typography variant='caption'>-</Typography>

          return (
            <div className='flex flex-col items-center'>
              <Typography variant='caption'>{formatDateOnly(row.original.closedAt)}</Typography>
              <Typography variant='caption'>{formatTimeOnly(row.original.closedAt)}</Typography>
            </div>
          )
        }
      })
    ],
    []
  )

  const table = useReactTable({
    data: travels,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter: searchQuery
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setSearchQuery,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true
  })

  if (isLoading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity='error'>Error al cargar los viajes. Por favor, intenta nuevamente.</Alert>
  }

  const totalRows = meta?.total || 0
  const totalPages = meta?.lastPage || 1

  return (
    <Box>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <div className='flex flex-col gap-2'>
            <Typography variant='h4'>Lista de Viajes</Typography>
          </div>
        </div>

        <div className='flex flex-wrap justify-between gap-4 px-6 pb-4 items-center'>
          <div className='flex flex-wrap gap-4 items-center'>
            <CustomTextField
              select
              label='Origen'
              value={originPlaceId}
              onChange={e => {
                setOriginPlaceId(e.target.value)
                setCurrentPage(1)
              }}
              size='small'
              sx={{ minWidth: 150 }}
            >
              <MenuItem value=''>Todos</MenuItem>
              {uniqueOrigins.map(place => (
                <MenuItem key={place.id} value={place.id.toString()}>
                  {place.name}
                </MenuItem>
              ))}
            </CustomTextField>

            <i
              className='tabler-arrow-right'
              style={{ fontSize: '20px', color: 'var(--mui-palette-text-secondary)' }}
            />

            <CustomTextField
              select
              label='Destino'
              value={destinationPlaceId}
              onChange={e => {
                setDestinationPlaceId(e.target.value)
                setCurrentPage(1)
              }}
              size='small'
              sx={{ minWidth: 150 }}
            >
              <MenuItem value=''>Todos</MenuItem>
              {uniqueDestinations.map(place => (
                <MenuItem key={place.id} value={place.id.toString()}>
                  {place.name}
                </MenuItem>
              ))}
            </CustomTextField>

            <CustomTextField
              type='date'
              label='Fecha Inicio'
              value={startDateInput}
              onChange={e => setStartDateInput(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size='small'
              sx={{ width: '150px' }}
            />
            <Typography variant='body2' color='text.secondary'>
              a
            </Typography>
            <CustomTextField
              type='date'
              label='Fecha Fin'
              value={endDateInput}
              onChange={e => setEndDateInput(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size='small'
              sx={{ width: '150px' }}
            />

            <CustomTextField
              select
              label='Estado'
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              size='small'
              sx={{ minWidth: 120 }}
            >
              <MenuItem value='all'>Todos</MenuItem>
              <MenuItem value='active'>Activo</MenuItem>
              <MenuItem value='closed'>Cerrado</MenuItem>
            </CustomTextField>
          </div>

          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              px: 2,
              py: 1
            }}
          >
            <Box display='flex' flexDirection='column' gap={0.5}>
              <Box display='flex' justifyContent='space-between' gap={3}>
                <Typography variant='body2' fontWeight={600}>
                  TOTAL APP
                </Typography>
                <Typography variant='body2' fontWeight={600} color='success.main'>
                  {formatCurrency(totalApp)}
                </Typography>
              </Box>
              <Box display='flex' justifyContent='space-between' gap={3}>
                <Typography variant='body2' fontWeight={600}>
                  TOTAL QR
                </Typography>
                <Typography variant='body2' fontWeight={600} color='info.main'>
                  {formatCurrency(totalQr)}
                </Typography>
              </Box>
              <Box display='flex' justifyContent='space-between' gap={3}>
                <Typography variant='body2' fontWeight={600}>
                  TOTAL EFECTIVO
                </Typography>
                <Typography variant='body2' fontWeight={600} color='warning.main'>
                  {formatCurrency(totalCash)}
                </Typography>
              </Box>
              <Box
                display='flex'
                justifyContent='space-between'
                gap={3}
                sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 0.5, mt: 0.5 }}
              >
                <Typography variant='body2' fontWeight={700}>
                  TOTAL GENERAL
                </Typography>
                <Typography variant='body2' fontWeight={700} color='primary.main'>
                  {formatCurrency(totalGeneral)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </div>

        <div className='flex flex-wrap justify-between gap-4 px-6 pb-6'>
          {/* <div className='flex flex-wrap gap-4 items-center'>
            <DebouncedInput
              value={searchQuery}
              onChange={value => {
                const newValue = String(value)

                // Only reset page if search value actually changed
                if (newValue !== searchQuery) {
                  setSearchQuery(newValue)
                  setCurrentPage(1)
                }
              }}
              placeholder='Buscar viajes...'
              className='max-sm:is-full min-w-[300px] flex-1 max-w-md'
            />
          </div> */}

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

            {table.getRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-8'>
                    <Typography>No hay viajes disponibles</Typography>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map(row => {
                  const isDisabled = !row.original.enabled

                  return (
                    <tr
                      key={row.id}
                      className={classnames({ selected: row.getIsSelected() })}
                      style={{
                        opacity: isDisabled ? 0.5 : 1,
                        backgroundColor: isDisabled ? 'var(--mui-palette-action-disabledBackground)' : undefined
                      }}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            )}
          </table>
        </div>

        <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
          <Typography color='text.disabled'>
            {totalRows > 0
              ? `Mostrando ${(currentPage - 1) * pageSize + 1} a ${Math.min(currentPage * pageSize, totalRows)} de ${totalRows} viajes`
              : 'No hay viajes'}
          </Typography>
          <Pagination
            shape='rounded'
            color='primary'
            variant='tonal'
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            showFirstButton
            showLastButton
          />
        </div>
      </Card>

      <Dialog open={ticketsDialogOpen} onClose={handleCloseTicketsDialog} maxWidth='xl' fullWidth>
        <DialogTitle>
          <Box display='flex' alignItems='center' justifyContent='space-between'>
            <Box display='flex' alignItems='center' gap={2}>
              <i className='tabler-ticket' style={{ fontSize: '28px', color: 'var(--mui-palette-primary-main)' }} />
              <Box>
                <Typography variant='h6' fontWeight={600}>
                  Tickets del Viaje
                </Typography>
                {selectedTravel && (
                  <Typography variant='caption' color='text.secondary'>
                    {selectedTravel.route?.officeOrigin?.place?.name} →{' '}
                    {selectedTravel.route?.officeDestination?.place?.name} |{' '}
                    {formatDateTime(selectedTravel.departure_time)}
                  </Typography>
                )}
              </Box>
            </Box>
            <IconButton onClick={handleCloseTicketsDialog} size='small'>
              <i className='tabler-x' style={{ fontSize: '20px' }} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>{selectedTravel && <AdminTicketsTable initialTravelId={selectedTravel.id} />}</DialogContent>
      </Dialog>

      <TravelDetailDialog open={reportDialogOpen} onClose={handleCloseReportDialog} travel={reportTravel} />
    </Box>
  )
}

export default ViajesListTable
