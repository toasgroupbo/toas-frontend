'use client'

import { useState, useMemo, useEffect } from 'react'

import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { Grid, Pagination } from '@mui/material'
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
import { useCashierTravels, useCloseTravel } from '@/hooks/useCashierTravels'
import { usePlaces } from '@/hooks/useOffices'
import { useAuth } from '@/contexts/AuthContext'
import type { Travel } from '@/types/api/travels'
import TicketsTable from './TicketsTable'
import SellTicketDialog from '../components/SellTicketDialog'
import AssignPassengersDialog from '../components/AssignPassengersDialog'
import type { SeatAssignment } from '../components/AssignPassengersDialog'
import { useCreateTicket, useConfirmTicket, useCancelTicket } from '@/hooks/useTickets'
import { useAssignPassenger } from '@/hooks/usePassengers'
import type { CreateTicketDto, Ticket } from '@/types/api/tickets'

type TravelWithActionsType = Travel & {
  actions?: string
}

const columnHelper = createColumnHelper<TravelWithActionsType>()

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

// Mapeo de equipamiento a iconos y nombres legibles
const equipmentConfig: Record<string, { icon: string; label: string }> = {
  tablet: { icon: 'tabler-device-tablet', label: 'Tablet' },
  usb_charger: { icon: 'tabler-usb', label: 'Cargador USB' },
  air_conditioning: { icon: 'tabler-air-conditioning', label: 'Aire Acondicionado' },
  wifi: { icon: 'tabler-wifi', label: 'WiFi' },
  tv: { icon: 'tabler-device-tv', label: 'Televisión' },
  bathroom: { icon: 'tabler-bath', label: 'Baño' },
  reclining_seats: { icon: 'tabler-armchair', label: 'Asientos Reclinables' },
  blankets: { icon: 'tabler-bed', label: 'Mantas' },
  snacks: { icon: 'tabler-cookie', label: 'Snacks' },
  drinks: { icon: 'tabler-bottle', label: 'Bebidas' }
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

  const [saleDetails, setSaleDetails] = useState<{
    ticket: Ticket | null
    travel: Travel | null
  }>({ ticket: null, travel: null })

  const { user } = useAuth()
  const { data: places } = usePlaces()

  const cashierPlaceName = useMemo(() => {
    if (!user?.office?.place?.id || !places) return null
    const place = places.find(p => p.id === user.office?.place?.id)

    return place?.name || null
  }, [user, places])

  useEffect(() => {
    if (places && places.length > 0 && !destinationPlaceIdFilter) {
      setDestinationPlaceIdFilter(places[0].id.toString())
    }
  }, [places, destinationPlaceIdFilter])

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
  const assignPassengerMutation = useAssignPassenger()
  const closeTravelMutation = useCloseTravel()

  const activeTravels = useMemo(() => {
    if (!travels) return []

    return travels.filter(travel => travel.travel_status === 'active')
  }, [travels])

  // Formatear fecha (las fechas del backend vienen en hora Bolivia pero con Z)
  const formatDate = (dateString: string) => {
    const dateWithoutZ = dateString.replace('Z', '')
    const date = new Date(dateWithoutZ)

    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Formatear hora (las fechas del backend vienen en hora Bolivia pero con Z)
  const formatTime = (dateString: string) => {
    const dateWithoutZ = dateString.replace('Z', '')
    const date = new Date(dateWithoutZ)

    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

    return `${baseUrl}${imagePath}`
  }

  const handleSellTicket = async (data: CreateTicketDto) => {
    try {
      const createdTicket = await createTicketMutation.mutateAsync(data)

      const travelSeats = (createdTicket as any).travelSeats || []

      const enrichedSeats = createdTicket.seats.map(seat => {
        const travelSeat = travelSeats.find((ts: any) => ts.id === seat.id)

        return {
          ...seat,
          deck: travelSeat?.deck
        }
      })

      const enrichedTicket = {
        ...createdTicket,
        seats: enrichedSeats
      }

      setPendingTicket(enrichedTicket)
      setOpenSellDialog(false)
      setOpenAssignDialog(true)
    } catch (error) {
      console.error('Error creating ticket:', error)
    }
  }

  const handlePayCash = async (assignments: SeatAssignment[]) => {
    if (!pendingTicket || !selectedTravel) return

    try {
      setIsProcessingPayment(true)

      for (const assignment of assignments) {
        await assignPassengerMutation.mutateAsync({
          ticketId: pendingTicket.id,
          seatId: assignment.seatId,
          passengerId: assignment.passengerId,
          customerId: assignment.customerId
        })
      }

      await confirmTicketMutation.mutateAsync(pendingTicket.id)

      setSaleDetails({
        ticket: pendingTicket,
        travel: selectedTravel
      })

      setOpenAssignDialog(false)
      setPendingTicket(null)
      setSelectedTravel(undefined)
      setOpenSuccessDialog(true)
    } catch (error) {
      console.error('Error processing cash payment:', error)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handlePayQR = async (assignments: SeatAssignment[]) => {
    if (!pendingTicket || !selectedTravel) return

    try {
      setIsProcessingPayment(true)

      for (const assignment of assignments) {
        await assignPassengerMutation.mutateAsync({
          ticketId: pendingTicket.id,
          seatId: assignment.seatId,
          passengerId: assignment.passengerId,
          customerId: assignment.customerId
        })
      }

      await confirmTicketMutation.mutateAsync(pendingTicket.id)

      // Guarda los detalles ANTES de limpiar
      setSaleDetails({
        ticket: pendingTicket,
        travel: selectedTravel
      })

      setOpenAssignDialog(false)
      setPendingTicket(null)
      setSelectedTravel(undefined)
      setOpenSuccessDialog(true)
    } catch (error) {
      console.error('Error processing QR payment:', error)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handleCancelAssignment = async () => {
    if (!pendingTicket) return

    try {
      await cancelTicketMutation.mutateAsync(pendingTicket.id)

      setOpenAssignDialog(false)
      setPendingTicket(null)
    } catch (error) {
      console.error('Error canceling ticket:', error)
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
        header: 'Asientos',
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
          <Typography variant='h4'>Lista de Tickets Vendidos</Typography>
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
          <Button variant='outlined' startIcon={<i className='tabler-list' />} onClick={() => setShowTicketsList(true)}>
            Ver Tickets Vendidos
          </Button>
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
              {places && places.length > 0 ? (
                places.map(place => (
                  <MenuItem key={place.id} value={place.id.toString()}>
                    {place.name}
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
                {table.getRowModel().rows.map(row => (
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

      <Dialog open={openSuccessDialog} onClose={() => setOpenSuccessDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>
          <Box display='flex' alignItems='center' gap={2}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                bgcolor: 'success.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className='tabler-check' style={{ fontSize: '28px', color: 'white' }} />
            </Box>
            <Box>
              <Typography variant='h5' fontWeight={600}>
                ¡Venta Exitosa!
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Ticket confirmado y pagado correctamente
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            {saleDetails.ticket && saleDetails.travel && (
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, mb: 2 }}>
                <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 1.5 }}>
                  Resumen de la venta:
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant='caption' color='text.secondary'>
                      N° Ticket:
                    </Typography>
                    <Typography variant='body2' fontWeight={600}>
                      #{saleDetails.ticket.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='caption' color='text.secondary'>
                      Fecha venta:
                    </Typography>
                    <Typography variant='body2'>
                      {new Date().toLocaleDateString('es-ES', { timeZone: 'America/La_Paz' })}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant='caption' color='text.secondary'>
                      Ruta:
                    </Typography>
                    <Typography variant='body2'>
                      {saleDetails.travel.route.officeOrigin.city} → {saleDetails.travel.route.officeDestination.city}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='caption' color='text.secondary'>
                      Asientos:
                    </Typography>
                    <Typography variant='body2'>{saleDetails.ticket.seats.length} asiento(s)</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='caption' color='text.secondary'>
                      Monto total:
                    </Typography>
                    <Typography variant='body2' fontWeight={600} color='success.main'>
                      Bs. {parseFloat(saleDetails.ticket.total_price as string).toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}

            <Box
              sx={{
                bgcolor: 'success.lighter',
                p: 2,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'success.main',
                mb: 2
              }}
            >
              <Typography variant='body2' fontWeight={600} color='success.main'>
                ✅ El ticket ha sido confirmado y el pago procesado
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                El cliente recibirá su ticket en el sistema y puede ser impreso
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button
            onClick={() => {
              setOpenSuccessDialog(false)
              setSaleDetails({ ticket: null, travel: null })
            }}
            variant='outlined'
            color='secondary'
            sx={{ flex: 1 }}
          >
            Continuar vendiendo
          </Button>
          <Button
            onClick={() => {
              setOpenSuccessDialog(false)

              if (saleDetails.travel?.id) {
                setSelectedTravelForTickets(saleDetails.travel.id)
              }

              setSaleDetails({ ticket: null, travel: null })

              setShowTicketsList(true)
            }}
            variant='contained'
            color='primary'
            sx={{ flex: 1 }}
            startIcon={<i className='tabler-list' />}
          >
            Ver lista de tickets
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bus Images Dialog */}
      <Dialog
        open={openImagesDialog}
        onClose={() => {
          setOpenImagesDialog(false)
          setSelectedTravel(undefined)
        }}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>
          <Box display='flex' alignItems='center' justifyContent='space-between'>
            <Box display='flex' alignItems='center' gap={2}>
              <i className='tabler-bus' style={{ fontSize: '24px', color: 'var(--mui-palette-primary-main)' }} />
              <Typography variant='h5' fontWeight={600}>
                Imágenes del Bus - {selectedTravel?.bus?.name || 'N/A'}
              </Typography>
            </Box>
            <Button
              onClick={() => {
                setOpenImagesDialog(false)
                setSelectedTravel(undefined)
              }}
              color='secondary'
              size='small'
            >
              <i className='tabler-x' />
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display='flex' flexDirection='column' gap={3}>
            <Box>
              <Typography variant='subtitle1' fontWeight={600} sx={{ mb: 1.5 }}>
                Imagen Exterior
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: 300,
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'action.hover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {getImageUrl(selectedTravel?.bus?.exterior_image) ? (
                  <img
                    src={getImageUrl(selectedTravel?.bus?.exterior_image) || ''}
                    alt={`${selectedTravel?.bus?.name} - Exterior`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <Box textAlign='center'>
                    <i
                      className='tabler-photo-off'
                      style={{ fontSize: '48px', color: 'var(--mui-palette-text-disabled)' }}
                    />
                    <Typography variant='body2' color='text.disabled' sx={{ mt: 1 }}>
                      No hay imagen exterior disponible
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Box>
              <Typography variant='subtitle1' fontWeight={600} sx={{ mb: 1.5 }}>
                Imagen Interior
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: 300,
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'action.hover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {getImageUrl(selectedTravel?.bus?.interior_image) ? (
                  <img
                    src={getImageUrl(selectedTravel?.bus?.interior_image) || ''}
                    alt={`${selectedTravel?.bus?.name} - Interior`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <Box textAlign='center'>
                    <i
                      className='tabler-photo-off'
                      style={{ fontSize: '48px', color: 'var(--mui-palette-text-disabled)' }}
                    />
                    <Typography variant='body2' color='text.disabled' sx={{ mt: 1 }}>
                      No hay imagen interior disponible
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              setOpenImagesDialog(false)
              setSelectedTravel(undefined)
            }}
            variant='contained'
            color='primary'
            fullWidth
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Close Travel Dialog */}
      <Dialog
        open={openConfirmCloseDialog}
        onClose={() => {
          setOpenConfirmCloseDialog(false)
          setSelectedTravel(undefined)
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
              <i className='tabler-lock' style={{ fontSize: '28px', color: 'white' }} />
            </Box>
            <Typography variant='h5' fontWeight={600}>
              Cerrar Viaje
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
            ¿Estás seguro de que deseas cerrar este viaje?
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
              Esta acción cerrará el viaje y no se podrán vender más tickets.
            </Typography>
          </Box>
          {selectedTravel && (
            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                <strong>Ruta:</strong> {selectedTravel.route.officeOrigin.city} →{' '}
                {selectedTravel.route.officeDestination.city}
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                <strong>Fecha:</strong> {formatDate(selectedTravel.departure_time)} -{' '}
                {formatTime(selectedTravel.departure_time)}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                <strong>Bus:</strong> {selectedTravel.bus?.name || 'N/A'} ({selectedTravel.bus?.plaque || 'N/A'})
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => {
              setOpenConfirmCloseDialog(false)
              setSelectedTravel(undefined)
            }}
            variant='outlined'
            color='secondary'
            fullWidth
            disabled={closeTravelMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCloseTravel}
            variant='contained'
            color='error'
            fullWidth
            startIcon={<i className='tabler-lock' />}
            disabled={closeTravelMutation.isPending}
          >
            {closeTravelMutation.isPending ? 'Cerrando...' : 'Cerrar Viaje'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TravelsForSale
