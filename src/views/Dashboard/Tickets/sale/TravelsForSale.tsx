'use client'

import React, { useState, useMemo, useEffect } from 'react'

import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { Pagination } from '@mui/material'
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'

import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'
import { useCashierTravels, useCloseTravel, useCashierRoutes } from '@/hooks/useCashierTravels'
import type { Travel } from '@/types/api/travels'
import TicketsTable from '../sold/TicketsTable'
import SellTicketDialog from './components/SellTicketDialog'
import AssignPassengersDialog from './components/AssignPassengersDialog'
import type { SeatAssignment } from './components/AssignPassengersDialog'
import SaleSuccessDialog from './components/SaleSuccessDialog'
import BusImagesDialog from './components/BusImagesDialog'
import CloseTravelDialog from './components/CloseTravelDialog'
import QRPaymentDialog from './components/QRPaymentDialog'
import ConfirmPaymentDialog from './components/ConfirmPaymentDialog'
import { useCreateTicket, useConfirmTicket, useCancelTicket } from '@/hooks/useTickets'
import { useAssignPassengers } from '@/hooks/usePassengers'
import type { CreateTicketDto, Ticket, SeatSelection } from '@/types/api/tickets'
import { formatDateHeader, formatDate, formatTime } from './utils/dateFormatters'
import { equipmentConfig } from './utils/equipmentConfig'

type TravelWithActionsType = Travel & {
  actions?: string
}

const columnHelper = createColumnHelper<TravelWithActionsType>()

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const TravelsForSale = () => {
  const [departureTimeFilter, setDepartureTimeFilter] = useState<string>('')
  const [destinationPlaceIdFilter, setDestinationPlaceIdFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [showTicketsList, setShowTicketsList] = useState(false)
  const [selectedTravel, setSelectedTravel] = useState<Travel | undefined>(undefined)
  const [openSellDialog, setOpenSellDialog] = useState(false)
  const [openAssignDialog, setOpenAssignDialog] = useState(false)
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false)
  const [openConfirmCloseDialog, setOpenConfirmCloseDialog] = useState(false)
  const [openImagesDialog, setOpenImagesDialog] = useState(false)
  const [pendingTicket, setPendingTicket] = useState<Ticket | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [selectedTravelForTickets, setSelectedTravelForTickets] = useState<number | null>(null)
  const [openQRDialog, setOpenQRDialog] = useState(false)
  const [openConfirmPaymentDialog, setOpenConfirmPaymentDialog] = useState(false)
  const [pendingAssignments, setPendingAssignments] = useState<SeatAssignment[]>([])
  const [pendingTicketData, setPendingTicketData] = useState<Omit<CreateTicketDto, 'payment_type'> | null>(null)
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false)
  const [isCancellingPayment, setIsCancellingPayment] = useState(false)

  const [saleDetails, setSaleDetails] = useState<{
    ticket: Ticket | null
    travel: Travel | null
  }>({ ticket: null, travel: null })

  const { data: cashierRoutes } = useCashierRoutes()

  const cashierPlaceName = useMemo(() => {
    if (!cashierRoutes || cashierRoutes.length === 0) return null

    return cashierRoutes[0].officeOrigin.place.name
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

  useEffect(() => {
    if (uniqueDestinations.length > 0 && !destinationPlaceIdFilter) {
      setDestinationPlaceIdFilter(uniqueDestinations[0].id.toString())
    }
  }, [uniqueDestinations, destinationPlaceIdFilter])

  const filters = useMemo(() => {
    if (!destinationPlaceIdFilter) {
      return undefined
    }

    return {
      departure_time: departureTimeFilter || undefined,
      destination_placeId: Number(destinationPlaceIdFilter)
    }
  }, [departureTimeFilter, destinationPlaceIdFilter])

  const { data: travels, isLoading, error } = useCashierTravels(filters)

  const createTicketMutation = useCreateTicket()
  const confirmTicketMutation = useConfirmTicket()
  const cancelTicketMutation = useCancelTicket()
  const assignPassengersMutation = useAssignPassengers()
  const closeTravelMutation = useCloseTravel()

  const activeTravels = useMemo(() => {
    if (!travels) return []

    return travels.filter(travel => travel.travel_status === 'active')
  }, [travels])

  // Agrupar viajes por fecha de salida
  const travelsByDate = useMemo(() => {
    if (!activeTravels || activeTravels.length === 0) return {}

    const grouped: Record<string, typeof activeTravels> = {}

    activeTravels.forEach(travel => {
      const dateWithoutZ = travel.departure_time.replace('Z', '')
      const date = new Date(dateWithoutZ)
      const dateKey = date.toISOString().split('T')[0]

      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }

      grouped[dateKey].push(travel)
    })

    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => {
        const dateA = new Date(a.departure_time.replace('Z', ''))
        const dateB = new Date(b.departure_time.replace('Z', ''))

        return dateA.getTime() - dateB.getTime()
      })
    })

    return grouped
  }, [activeTravels])

  const sortedDates = useMemo(() => {
    return Object.keys(travelsByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
  }, [travelsByDate])

  const handleSellTicket = async (data: Omit<CreateTicketDto, 'payment_type'>, travel: Travel) => {
    // Guardar datos para crear el ticket cuando se elija método de pago
    setPendingTicketData(data)

    // Guardar el travel con los datos completos (incluyendo travelSeats)
    setSelectedTravel(travel)

    // Construir un pseudo-ticket basado en los datos del travel para mostrar en AssignPassengersDialog
    const selectedSeatsData = travel.travelSeats.filter(seat =>
      data.seatSelections.some(sel => sel.seatId === String(seat.id))
    )

    const pseudoTicket: Ticket = {
      id: 0, // ID temporal
      type: 'IN_OFFICE',
      status: 'pending',
      total_price: data.seatSelections
        .reduce((sum, sel) => sum + parseFloat(sel.price || '0'), 0)
        .toFixed(2),
      seats: selectedSeatsData.map(seat => {
        const selection = data.seatSelections.find(sel => sel.seatId === String(seat.id))

        return {
          id: seat.id,
          seatNumber: seat.seatNumber,
          price: selection?.price || seat.price,
          deck: seat.deck
        }
      }),
      reserve_expiresAt: null,
      createdAt: new Date().toISOString(),
      travelSeats: selectedSeatsData.map(seat => {
        const selection = data.seatSelections.find(sel => sel.seatId === String(seat.id))

        return {
          id: seat.id,
          row: seat.row,
          column: seat.column,
          deck: seat.deck,
          price: selection?.price || seat.price,
          seatNumber: seat.seatNumber,
          type: seat.type,
          sale_type: seat.sale_type,
          status: seat.status,
          createdAt: seat.createdAt,
          passenger: null
        }
      }),
      buyer: {
        id: data.customerId,
        email: null,
        name: 'Cliente',
        ci: '',
        phone: null,
        is_verified: false,
        provider: null,
        idProvider: null,
        birthDate: null,
        photo: null,
        createdAt: new Date().toISOString()
      }
    }

    setPendingTicket(pseudoTicket)
    setOpenSellDialog(false)
    setOpenAssignDialog(true)
  }

  const handlePayCash = async (assignments: SeatAssignment[]) => {
    if (!pendingTicketData || !selectedTravel) return

    try {
      setIsProcessingPayment(true)

      // Crear el ticket con payment_type: 'cash'
      const ticketData: CreateTicketDto = {
        ...pendingTicketData,
        payment_type: 'cash'
      }

      const createdTicket = await createTicketMutation.mutateAsync(ticketData)

      // Asignar pasajeros (una sola llamada con todos)
      await assignPassengersMutation.mutateAsync({
        ticketId: createdTicket.id,
        customerId: assignments[0]?.customerId || pendingTicketData.customerId,
        passengers: assignments.map(a => ({
          seatId: a.seatId,
          passenger: {
            name: a.passengerName,
            ci: a.passengerCI
          }
        }))
      })

      // Guardar el ticket creado y asignaciones
      setPendingTicket(createdTicket)
      setPendingAssignments(assignments)

      // Cerrar diálogo de asignación y abrir diálogo de confirmación
      setOpenAssignDialog(false)
      setOpenConfirmPaymentDialog(true)
    } catch (error) {
      console.error('Error processing cash payment:', error)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handleConfirmCashPayment = async () => {
    if (!pendingTicket || !selectedTravel) return

    try {
      setIsConfirmingPayment(true)

      // Confirmar ticket
      await confirmTicketMutation.mutateAsync(pendingTicket.id)

      setSaleDetails({
        ticket: pendingTicket,
        travel: selectedTravel
      })

      setOpenConfirmPaymentDialog(false)
      setPendingTicket(null)
      setPendingTicketData(null)
      setPendingAssignments([])
      setSelectedTravel(undefined)
      setOpenSuccessDialog(true)
    } catch (error) {
      console.error('Error confirming cash payment:', error)
    } finally {
      setIsConfirmingPayment(false)
    }
  }

  const handleCancelCashPayment = async () => {
    if (!pendingTicket) return

    try {
      setIsCancellingPayment(true)

      // Cancelar el ticket
      await cancelTicketMutation.mutateAsync(pendingTicket.id)

      setOpenConfirmPaymentDialog(false)
      setPendingTicket(null)
      setPendingTicketData(null)
      setPendingAssignments([])
      setSelectedTravel(undefined)
    } catch (error) {
      console.error('Error cancelling cash payment:', error)
    } finally {
      setIsCancellingPayment(false)
    }
  }

  const handlePayQR = async (assignments: SeatAssignment[]) => {
    if (!pendingTicketData || !selectedTravel) return

    try {
      setIsProcessingPayment(true)

      // Crear el ticket con payment_type: 'qr'
      const ticketData: CreateTicketDto = {
        ...pendingTicketData,
        payment_type: 'qr'
      }

      const createdTicket = await createTicketMutation.mutateAsync(ticketData)

      // Asignar pasajeros (una sola llamada con todos)
      await assignPassengersMutation.mutateAsync({
        ticketId: createdTicket.id,
        customerId: assignments[0]?.customerId || pendingTicketData.customerId,
        passengers: assignments.map(a => ({
          seatId: a.seatId,
          passenger: {
            name: a.passengerName,
            ci: a.passengerCI
          }
        }))
      })

      // Guardar el ticket real y las asignaciones para el flujo QR
      setPendingTicket(createdTicket)
      setPendingAssignments(assignments)

      // Cerrar el diálogo de asignación y abrir el de QR
      setOpenAssignDialog(false)
      setOpenQRDialog(true)
    } catch (error) {
      console.error('Error processing QR payment:', error)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handleCancelAssignment = async () => {
    // Solo limpiar estado, el ticket aún no se ha creado
    setOpenAssignDialog(false)
    setPendingTicket(null)
    setPendingTicketData(null)
    setSelectedTravel(undefined)
  }

  const handleQRPaymentSuccess = () => {
    if (!pendingTicket || !selectedTravel) return

    // El ticket ya fue confirmado por el backend cuando se pagó el QR
    setSaleDetails({
      ticket: pendingTicket,
      travel: selectedTravel
    })

    setOpenQRDialog(false)
    setPendingTicket(null)
    setPendingTicketData(null)
    setPendingAssignments([])
    setSelectedTravel(undefined)
    setOpenSuccessDialog(true)
  }

  const handleQRPaymentCancel = async () => {
    if (!pendingTicket) return

    try {
      // Cancelar el ticket si el usuario cancela el pago QR
      await cancelTicketMutation.mutateAsync(pendingTicket.id)
    } catch (error) {
      console.error('Error canceling ticket:', error)
    } finally {
      setOpenQRDialog(false)
      setPendingTicket(null)
      setPendingTicketData(null)
      setPendingAssignments([])
      setSelectedTravel(undefined)
    }
  }

  const handleCloseTravel = async () => {
    if (!selectedTravel) return

    try {
      await closeTravelMutation.mutateAsync(selectedTravel.id)
      setOpenConfirmCloseDialog(false)
      setSelectedTravel(undefined)
    } catch (error) {
      console.error('Error closing travel:', error)
    }
  }

  // Definir columnas de la tabla
  const columns = useMemo<ColumnDef<TravelWithActionsType, any>[]>(
    () => [
      columnHelper.accessor('actions', {
        header: 'Acciones',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Tooltip title='Ver Tickets'>
              <IconButton
                size='small'
                onClick={e => {
                  e.stopPropagation()
                  setSelectedTravelForTickets(row.original.id)
                  setShowTicketsList(true)
                }}
                sx={{
                  color: 'success.main',
                  '&:hover': { backgroundColor: 'success.light', color: 'white' }
                }}
              >
                <i className='tabler-ticket' style={{ fontSize: '18px' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title='Ver Imágenes'>
              <IconButton
                size='small'
                onClick={e => {
                  e.stopPropagation()
                  setSelectedTravel(row.original)
                  setOpenImagesDialog(true)
                }}
                sx={{
                  color: 'info.main',
                  '&:hover': { backgroundColor: 'info.light', color: 'white' }
                }}
              >
                <i className='tabler-photo' style={{ fontSize: '18px' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title='Cerrar Viaje'>
              <span>
                <IconButton
                  size='small'
                  onClick={e => {
                    e.stopPropagation()
                    setSelectedTravel(row.original)
                    setOpenConfirmCloseDialog(true)
                  }}
                  disabled={row.original.travel_status !== 'active'}
                  sx={{
                    color: 'error.main',
                    '&:hover': { backgroundColor: 'error.light', color: 'white' },
                    '&.Mui-disabled': { color: 'action.disabled' }
                  }}
                >
                  <i className='tabler-lock' style={{ fontSize: '18px' }} />
                </IconButton>
              </span>
            </Tooltip>
          </div>
        ),
        enableSorting: false
      }),
      columnHelper.accessor('departure_time', {
        header: 'Salida',
        cell: ({ row }) => (
          <Box>
            <Typography variant='body2' fontWeight='medium'>
              {formatDate(row.original.departure_time)}
            </Typography>
            <Chip label={formatTime(row.original.departure_time)} size='small' color='primary' variant='tonal' />
          </Box>
        )
      }),
      columnHelper.accessor('arrival_time', {
        header: 'Llegada',
        cell: ({ row }) => (
          <Box>
            <Typography variant='body2' fontWeight='medium'>
              {formatDate(row.original.arrival_time)}
            </Typography>
            <Chip label={formatTime(row.original.arrival_time)} size='small' color='secondary' variant='tonal' />
          </Box>
        )
      }),
      columnHelper.accessor('bus', {
        header: 'Bus',
        cell: ({ row }) => (
          <Box>
            <Typography variant='body2' fontWeight='medium'>
              {row.original.bus?.name || 'N/A'}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {row.original.bus?.plaque || 'N/A'} • {row.original.bus?.brand} {row.original.bus?.model}
            </Typography>
          </Box>
        )
      }),
      {
        id: 'equipment',
        header: 'Equipamiento',
        cell: ({ row }) => {
          const equipment = row.original.bus?.equipment || []

          if (equipment.length === 0) {
            return (
              <Typography variant='body2' color='text.secondary'>
                N/A
              </Typography>
            )
          }

          return (
            <Box display='flex' gap={0.5} flexWrap='wrap'>
              {equipment.map(eq => {
                const config = equipmentConfig[eq] || { icon: 'tabler-question-mark', label: eq }

                return (
                  <Tooltip key={eq} title={config.label} arrow placement='top'>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'action.hover',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'white'
                        }
                      }}
                    >
                      <i className={config.icon} style={{ fontSize: '16px' }} />
                    </Box>
                  </Tooltip>
                )
              })}
            </Box>
          )
        }
      },
      columnHelper.accessor('type', {
        header: 'Tipo',
        cell: ({ row }) => (
          <Chip
            label={row.original.type === 'normal' ? 'Normal' : 'Habilitada'}
            size='small'
            color={row.original.type === 'normal' ? 'default' : 'warning'}
            variant='outlined'
          />
        )
      }),
      columnHelper.accessor('price_deck_1', {
        header: 'Precios',
        cell: ({ row }) => (
          <Box>
            <Chip
              label={`P1: Bs. ${parseFloat(row.original.price_deck_1).toFixed(2)}`}
              size='small'
              color='success'
              variant='tonal'
              icon={<i className='tabler-currency-dollar' style={{ fontSize: '12px' }} />}
            />
            {row.original.bus?.decks && (
              <Box mt={0.5}>
                <Chip
                  label={`P2: Bs. ${parseFloat(row.original.price_deck_2).toFixed(2)}`}
                  size='small'
                  color='success'
                  variant='tonal'
                  icon={<i className='tabler-currency-dollar' style={{ fontSize: '12px' }} />}
                />
              </Box>
            )}
          </Box>
        )
      }),
      columnHelper.accessor('seatsAvailable', {
        header: ' Disponibles',
        cell: ({ row }) => (
          <Chip
            label={row.original.seatsAvailable ?? 'N/A'}
            size='small'
            color={
              row.original.seatsAvailable && row.original.seatsAvailable > 10
                ? 'success'
                : row.original.seatsAvailable && row.original.seatsAvailable > 0
                  ? 'warning'
                  : 'error'
            }
            variant='tonal'
            icon={<i className='tabler-armchair' style={{ fontSize: '12px' }} />}
          />
        )
      }),
      columnHelper.accessor('travel_status', {
        header: 'Estado',
        cell: ({ row }) => (
          <Chip
            label={row.original.travel_status === 'active' ? 'Activo' : row.original.travel_status}
            size='small'
            color={row.original.travel_status === 'active' ? 'success' : 'default'}
            variant='outlined'
          />
        )
      })
    ],
    []
  )

  // Configurar tabla con paginación
  const table = useReactTable({
    data: activeTravels,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: pageSize
      }
    },
    onPaginationChange: updater => {
      if (typeof updater === 'function') {
        const newState = updater({ pageIndex: currentPage - 1, pageSize })

        setCurrentPage(newState.pageIndex + 1)
        setPageSize(newState.pageSize)
      }
    },
    manualPagination: false,
    pageCount: Math.ceil(activeTravels.length / pageSize)
  })

  if (showTicketsList) {
    return (
      <Box>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
          <Button
            variant='outlined'
            startIcon={<i className='tabler-arrow-left' />}
            onClick={() => {
              setShowTicketsList(false)
              setSelectedTravelForTickets(null)
            }}
          >
            Volver a Venta
          </Button>
        </Box>

        <TicketsTable initialTravelId={selectedTravelForTickets} />
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' minHeight='400px' gap={2}>
        <CircularProgress size={40} />
        <Typography variant='body2' color='text.secondary'>
          Cargando viajes disponibles...
        </Typography>
      </Box>
    )
  }

  if (error) {
    const errorMessage =
      (error as any)?.response?.status === 401
        ? 'No tiene permisos para acceder a esta página. Por favor, inicie sesión como cajero.'
        : 'Error al cargar los viajes. Por favor, intente nuevamente.'

    return (
      <Box p={4}>
        <Alert severity='error'>{errorMessage}</Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Card>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
            <i className='tabler-bus' style={{ fontSize: '32px', color: 'var(--mui-palette-primary-main)' }} />
            <div>
              <Typography variant='h5' fontWeight='bold'>
                Viajes Disponibles para Venta
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {activeTravels.length} {activeTravels.length === 1 ? 'viaje disponible' : 'viajes disponibles'}
              </Typography>
            </div>
          </Box>
        </Box>

        <Box sx={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Origen estático del cajero */}
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

            <i
              className='tabler-arrow-right'
              style={{ fontSize: '20px', color: 'var(--mui-palette-text-secondary)' }}
            />

            <CustomTextField
              select
              value={destinationPlaceIdFilter}
              onChange={e => {
                setDestinationPlaceIdFilter(e.target.value)
                setCurrentPage(1)
              }}
              label='Destino'
              sx={{ minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    <i className='tabler-flag-filled' style={{ color: 'var(--mui-palette-error-main)' }} />
                  </Box>
                )
              }}
            >
              {uniqueDestinations.length > 0 ? (
                uniqueDestinations.map(destination => (
                  <MenuItem key={destination.id} value={destination.id.toString()}>
                    {destination.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value='' disabled>
                  Cargando destinos...
                </MenuItem>
              )}
            </CustomTextField>

            <CustomTextField
              type='date'
              value={departureTimeFilter}
              onChange={e => {
                setDepartureTimeFilter(e.target.value)
                setCurrentPage(1)
              }}
              label='Fecha de Salida (Opcional)'
              sx={{ minWidth: 250 }}
              InputLabelProps={{
                shrink: true
              }}
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    <i className='tabler-calendar' />
                  </Box>
                )
              }}
            />
          </Box>
        </Box>

        <Box sx={{ height: '20px' }} />

        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            {activeTravels.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <i
                        className='tabler-info-circle'
                        style={{ fontSize: '48px', color: 'var(--mui-palette-text-disabled)' }}
                      />
                      <Typography variant='h6' color='text.secondary'>
                        No hay viajes disponibles en este momento
                      </Typography>
                    </Box>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {sortedDates.map(dateKey => (
                  <React.Fragment key={dateKey}>
                    {/* Encabezado de fecha */}
                    <tr>
                      <td
                        colSpan={table.getVisibleFlatColumns().length}
                        style={{
                          backgroundColor: 'var(--mui-palette-primary-lightOpacity)',
                          padding: '10px 16px',
                          borderLeft: '3px solid var(--mui-palette-primary-main)'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <i
                            className='tabler-calendar-event'
                            style={{ fontSize: '16px', color: 'var(--mui-palette-primary-main)' }}
                          />
                          <Typography
                            variant='body2'
                            fontWeight={600}
                            color='primary.main'
                            sx={{ textTransform: 'capitalize' }}
                          >
                            {formatDateHeader(dateKey)}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            ({travelsByDate[dateKey].length})
                          </Typography>
                        </Box>
                      </td>
                    </tr>
                    {/* Filas de viajes para esta fecha */}
                    {table
                      .getRowModel()
                      .rows.filter(row => {
                        const rowDateWithoutZ = row.original.departure_time.replace('Z', '')
                        const rowDateKey = new Date(rowDateWithoutZ).toISOString().split('T')[0]

                        return rowDateKey === dateKey
                      })
                      .map(row => (
                        <tr
                          key={row.id}
                          onClick={() => {
                            if (row.original.travel_status === 'active') {
                              setSelectedTravel(row.original)
                              setOpenSellDialog(true)
                            }
                          }}
                          style={{
                            cursor: row.original.travel_status === 'active' ? 'pointer' : 'default',
                            transition: 'background-color 0.2s ease'
                          }}
                          className={classnames({ selected: row.getIsSelected() })}
                        >
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                          ))}
                        </tr>
                      ))}
                  </React.Fragment>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {activeTravels.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
            <Typography variant='body2' color='text.secondary'>
              Mostrando {currentPage * pageSize - pageSize + 1} a{' '}
              {Math.min(currentPage * pageSize, activeTravels.length)} de {activeTravels.length} viajes
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
                count={table.getPageCount()}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                color='primary'
                variant='tonal'
              />
            </Box>
          </Box>
        )}
      </Card>

      {/* Sell Ticket Dialog */}
      <SellTicketDialog
        open={openSellDialog}
        onClose={() => {
          setOpenSellDialog(false)
          setSelectedTravel(undefined)
        }}
        onSubmit={handleSellTicket}
        isLoading={createTicketMutation.isPending}
        preSelectedTravel={selectedTravel}
      />

      {/* Assign Passengers Dialog */}
      <AssignPassengersDialog
        open={openAssignDialog}
        onClose={handleCancelAssignment}
        ticket={pendingTicket}
        onPayCash={handlePayCash}
        onPayQR={handlePayQR}
        isLoading={isProcessingPayment}
      />

      {/* Sale Success Dialog */}
      <SaleSuccessDialog
        open={openSuccessDialog}
        onClose={() => setOpenSuccessDialog(false)}
        saleDetails={saleDetails}
        onContinueSelling={() => {
          setOpenSuccessDialog(false)
          setSaleDetails({ ticket: null, travel: null })
        }}
        onViewTickets={() => {
          setOpenSuccessDialog(false)

          if (saleDetails.travel?.id) {
            setSelectedTravelForTickets(saleDetails.travel.id)
          }

          setSaleDetails({ ticket: null, travel: null })
          setShowTicketsList(true)
        }}
      />

      {/* Bus Images Dialog */}
      <BusImagesDialog
        open={openImagesDialog}
        onClose={() => {
          setOpenImagesDialog(false)
          setSelectedTravel(undefined)
        }}
        selectedTravel={selectedTravel}
      />

      {/* Confirm Close Travel Dialog */}
      <CloseTravelDialog
        open={openConfirmCloseDialog}
        onClose={() => {
          setOpenConfirmCloseDialog(false)
          setSelectedTravel(undefined)
        }}
        selectedTravel={selectedTravel}
        onConfirmClose={handleCloseTravel}
        isLoading={closeTravelMutation.isPending}
      />

      {/* QR Payment Dialog */}
      <QRPaymentDialog
        open={openQRDialog}
        onClose={() => setOpenQRDialog(false)}
        ticket={pendingTicket}
        travel={selectedTravel || null}
        onPaymentSuccess={handleQRPaymentSuccess}
        onPaymentCancel={handleQRPaymentCancel}
      />

      {/* Confirm Cash Payment Dialog */}
      <ConfirmPaymentDialog
        open={openConfirmPaymentDialog}
        onClose={() => setOpenConfirmPaymentDialog(false)}
        onConfirm={handleConfirmCashPayment}
        onCancel={handleCancelCashPayment}
        isConfirming={isConfirmingPayment}
        isCancelling={isCancellingPayment}
        ticket={pendingTicket}
        travel={selectedTravel || null}
        paymentMethod='cash'
      />
    </Box>
  )
}

export default TravelsForSale
