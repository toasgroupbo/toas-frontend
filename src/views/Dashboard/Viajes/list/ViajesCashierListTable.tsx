'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
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
import {
  useTravelsForCashier,
  useCreateTravelForCashier,
  useCancelTravelForCashier,
  type TravelFilters
} from '@/hooks/useTravels'
import type { Travel } from '@/types/api/travels'

const getTodayDate = () => new Date().toISOString().split('T')[0]

import CreateTravelDialog from '@/views/Dashboard/Viajes/components/CreateTravelDialog'
import CancelTravelDialog from '@/views/Dashboard/Viajes/components/CancelTravelDialog'
import TravelDetailDialog from '@/views/Dashboard/Viajes/components/TravelDetailDialog'
import { useSnackbar } from '@/contexts/SnackbarContext'
import { useCashierRoutes } from '@/hooks/useCashierTravels'
import { useAuth } from '@/contexts/AuthContext'

type TravelWithActionsType = Travel & {
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

const columnHelper = createColumnHelper<TravelWithActionsType>()

// Helper to validate complete date format (YYYY-MM-DD = 10 chars)
const isValidDateInput = (date: string) => date === '' || date.length === 10

const ViajesCashierListTable = () => {
  const [rowSelection, setRowSelection] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('active')
  const [startDate, setStartDate] = useState<string>(getTodayDate())
  const [endDate, setEndDate] = useState<string>('')
  const [startDateInput, setStartDateInput] = useState<string>(getTodayDate())
  const [endDateInput, setEndDateInput] = useState<string>('')
  const [destinationPlaceId, setDestinationPlaceId] = useState<string>('')

  // Debounce effect for start date
  useEffect(() => {
    if (!isValidDateInput(startDateInput)) return

    const timeout = setTimeout(() => {
      setStartDate(startDateInput)
    }, 800)

    return () => clearTimeout(timeout)
  }, [startDateInput])

  // Debounce effect for end date
  useEffect(() => {
    if (!isValidDateInput(endDateInput)) return

    const timeout = setTimeout(() => {
      setEndDate(endDateInput)
    }, 800)

    return () => clearTimeout(timeout)
  }, [endDateInput])
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedTravel, setSelectedTravel] = useState<Travel | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [detailTravel, setDetailTravel] = useState<Travel | null>(null)

  const router = useRouter()
  const { showSuccess, showError } = useSnackbar()
  const { userRole } = useAuth()

  // Show tickets button only for CASHIER and CASHIER_SELLER
  const canViewTickets = userRole === 'CASHIER' || userRole === 'CASHIER_SELLER'
  const isCashierSeller = userRole === 'CASHIER_SELLER'

  const { data: cashierRoutes } = useCashierRoutes()

  const cashierPlaceName = useMemo(() => {
    if (!cashierRoutes || cashierRoutes.length === 0) return null

    return cashierRoutes[0].officeOrigin.place.name
  }, [cashierRoutes])

  const originPlaceId = useMemo(() => {
    if (!cashierRoutes || cashierRoutes.length === 0) return undefined

    return cashierRoutes[0].officeOrigin.place.id
  }, [cashierRoutes])

  const uniqueDestinations = useMemo(() => {
    if (!cashierRoutes || cashierRoutes.length === 0) return []
    const destinationsMap = new Map<number, { id: number; name: string }>()

    cashierRoutes.forEach(route => {
      const place = route.officeDestination.place

      if (!destinationsMap.has(place.id)) {
        destinationsMap.set(place.id, { id: place.id, name: place.name })
      }
    })

    return Array.from(destinationsMap.values())
  }, [cashierRoutes])

  const apiFilters = useMemo((): TravelFilters => {
    return {
      status: statusFilter !== 'all' ? (statusFilter as 'active' | 'closed') : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      origin_placeId: originPlaceId,
      destination_placeId: destinationPlaceId ? Number(destinationPlaceId) : undefined
    }
  }, [statusFilter, startDate, endDate, originPlaceId, destinationPlaceId])

  const { data: travelsResponse, isLoading, error } = useTravelsForCashier(apiFilters)

  const travels = travelsResponse?.data || []

  const createMutation = useCreateTravelForCashier()
  const cancelMutation = useCancelTravelForCashier()

  const filteredTravels = useMemo(() => {
    if (!travels) return []

    return travels
  }, [travels])

  const amounts = travelsResponse?.amounts || { cash: 0, qr: 0, app: 0 }
  const totalCash = amounts.cash
  const totalQr = amounts.qr
  const totalApp = amounts.app
  const totalGeneral = totalCash + totalQr + totalApp

  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true)
  }

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false)
  }

  const handleSubmitCreate = async (data: any) => {
    try {
      await createMutation.mutateAsync(data)
      showSuccess('Viaje creado correctamente')
      handleCloseCreateDialog()
    } catch (error: any) {
      console.error('Error al crear viaje:', error)

      const errorMessage = error?.response?.data?.message || 'Error desconocido'

      const errorMessages: Record<string, string> = {
        'The bus is already assigned to an active travel':
          'El bus ya está asignado a un viaje activo. Por favor, seleccione otro bus o espere a que el viaje actual finalice.',
        'Bus not found': 'El bus seleccionado no existe.',
        'Route not found': 'La ruta seleccionada no existe.',
        'Invalid departure time': 'La fecha y hora de salida no es válida.',
        'Invalid arrival time': 'La fecha y hora de llegada no es válida.',
        'Arrival time must be after departure time': 'La hora de llegada debe ser posterior a la hora de salida.',
        Unauthorized: 'No tienes permiso para crear viajes.',
        Forbidden: 'Acceso denegado.',
        'The bus already has a travel scheduled that overlaps with the selected departure or arrival time':
          'El bus ya tiene un viaje para este horario. Por favor, seleccione otro horario o bus.'
      }

      const translatedMessage = errorMessages[errorMessage] || `Error al crear el viaje: ${errorMessage}`

      showError(translatedMessage)
    }
  }

  const handleOpenCancelDialog = (travel: Travel) => {
    setSelectedTravel(travel)
    setCancelDialogOpen(true)
  }

  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false)
    setSelectedTravel(null)
  }

  const handleOpenDetailDialog = (travel: Travel) => {
    setDetailTravel(travel)
    setDetailDialogOpen(true)
  }

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false)
    setDetailTravel(null)
  }

  const handleViewTickets = useCallback(
    (travelId: number) => {
      router.push(`/tickets/list?travelId=${travelId}`)
    },
    [router]
  )

  const handleConfirmCancel = async (password: string) => {
    if (!selectedTravel) return

    try {
      await cancelMutation.mutateAsync({ id: selectedTravel.id, password })
      showSuccess('Viaje cancelado correctamente')
      handleCloseCancelDialog()
    } catch (error: any) {
      console.error('Error al cancelar viaje:', error)
      showError(error?.response?.data?.message || 'Error al cancelar el viaje')
    }
  }

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

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

    return `Bs. ${numAmount.toFixed(2)}`
  }

  const columns = useMemo<ColumnDef<TravelWithActionsType, any>[]>(
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
        cell: ({ row }) => {
          const isActive = row.original.travel_status === 'active'

          return (
            <div className='flex items-center gap-1'>
              <Tooltip title='Ver Detalles / Imprimir'>
                <IconButton size='small' onClick={() => handleOpenDetailDialog(row.original)} color='primary'>
                  <i className='tabler-file-description' style={{ fontSize: '18px' }} />
                </IconButton>
              </Tooltip>
              {canViewTickets && (
                <Tooltip title='Ver Tickets'>
                  <IconButton
                    size='small'
                    onClick={() => handleViewTickets(row.original.id)}
                    sx={{
                      color: 'success.main',
                      '&:hover': { backgroundColor: 'success.light', color: 'white' }
                    }}
                  >
                    <i className='tabler-ticket' style={{ fontSize: '18px' }} />
                  </IconButton>
                </Tooltip>
              )}
              {isActive && !isCashierSeller && (
                <Tooltip title='Cancelar Viaje'>
                  <IconButton
                    size='small'
                    onClick={() => handleOpenCancelDialog(row.original)}
                    sx={{
                      color: 'warning.main',
                      '&:hover': { backgroundColor: 'warning.light', color: 'white' }
                    }}
                  >
                    <i className='tabler-ban' style={{ fontSize: '18px' }} />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          )
        },
        enableSorting: false
      }),
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
          const originCity = row.original.route.officeOrigin.place?.name || 'N/A'
          const destinationCity = row.original.route.officeDestination.place?.name || 'N/A'

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

      columnHelper.accessor('qr_amount', {
        header: 'Monto QR',
        cell: ({ row }) => {
          const qrAmount = parseFloat(row.original.qr_amount || '0')
          const qrSoldSeats = (row.original as any).seatsQr || 0
          const qrTotalSeats = (row.original as any).qr_total_seats || 0

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
          const cashAmount = parseFloat(row.original.cash_amount || '0')
          const cashSoldSeats = (row.original as any).seatsCash || 0
          const cashTotalSeats = (row.original as any).cash_total_seats || 0

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
          const totalSoldSeats = row.original.totalSoldSeats || 0
          const totalBusSeats = row.original.totalBusSeats || 0

          const totalSoldAmount =
            parseFloat(row.original.app_amount || '0') +
            parseFloat(row.original.cash_amount || '0') +
            parseFloat(row.original.qr_amount || '0')

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

          const date = new Date(row.original.closedAt)

          const fecha = date.toLocaleDateString('es-BO', {
            timeZone: 'America/La_Paz',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })

          const hora = date.toLocaleTimeString('es-BO', {
            timeZone: 'America/La_Paz',
            hour: '2-digit',
            minute: '2-digit'
          })

          return (
            <div className='flex flex-col items-center'>
              <Typography variant='caption'>{fecha}</Typography>
              <Typography variant='caption'>{hora}</Typography>
            </div>
          )
        }
      })
    ],
    [canViewTickets, isCashierSeller, handleViewTickets]
  )

  const table = useReactTable({
    data: filteredTravels,
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
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
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

  const totalRows = table.getFilteredRowModel().rows.length
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize

  return (
    <Box>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <div className='flex flex-col gap-2'>
            <Typography variant='h4'>Mis Viajes - Mis Ventas</Typography>
          </div>

          {!isCashierSeller && (
            <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
              <Button
                variant='contained'
                color='primary'
                onClick={handleOpenCreateDialog}
                startIcon={<i className='tabler-plus' />}
              >
                Nuevo Viaje
              </Button>
            </div>
          )}
        </div>

        <div className='flex flex-wrap justify-between gap-4 px-6 pb-4 items-center'>
          <div className='flex flex-wrap gap-4 items-center'>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                bgcolor: 'primary.lighter',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'primary.main'
              }}
            >
              <i className='tabler-map-pin' style={{ fontSize: '18px', color: 'var(--mui-palette-primary-main)' }} />
              <Box>
                <Typography variant='caption' color='text.secondary'>
                  Origen
                </Typography>
                <Typography variant='body2' fontWeight='medium' color='primary.main'>
                  {cashierPlaceName || 'Cargando...'}
                </Typography>
              </Box>
            </Box>

            <i className='tabler-arrow-right' style={{ fontSize: '20px', color: 'var(--mui-palette-text-secondary)' }} />

            <CustomTextField
              select
              label='Destino'
              value={destinationPlaceId}
              onChange={e => setDestinationPlaceId(e.target.value)}
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

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
            </Box>

            <CustomTextField
              select
              label='Estado'
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
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
          <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
            <CustomTextField
              select
              value={pageSize}
              onChange={e => {
                table.setPageSize(Number(e.target.value))
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
              ? `Mostrando ${pageIndex * pageSize + 1} a ${Math.min((pageIndex + 1) * pageSize, totalRows)} de ${totalRows} viajes`
              : 'No hay viajes'}
          </Typography>
          <Pagination
            shape='rounded'
            color='primary'
            variant='tonal'
            count={table.getPageCount()}
            page={pageIndex + 1}
            onChange={(_, page) => table.setPageIndex(page - 1)}
            showFirstButton
            showLastButton
          />
        </div>
      </Card>

      {createDialogOpen && (
        <CreateTravelDialog
          open={createDialogOpen}
          onClose={handleCloseCreateDialog}
          onSubmit={handleSubmitCreate}
          isLoading={createMutation.isPending}
          isCashier={true}
        />
      )}

      <CancelTravelDialog
        open={cancelDialogOpen}
        onClose={handleCloseCancelDialog}
        onConfirm={handleConfirmCancel}
        travel={selectedTravel}
        isLoading={cancelMutation.isPending}
      />

      {detailTravel && (
        <TravelDetailDialog
          open={detailDialogOpen}
          onClose={handleCloseDetailDialog}
          travel={detailTravel}
          isCashier={true}
        />
      )}
    </Box>
  )
}

export default ViajesCashierListTable
