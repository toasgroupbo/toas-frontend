'use client'

import React, { useState, useMemo, useEffect } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Popover from '@mui/material/Popover'
import { Pagination } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
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
import type { CreateTicketDto, Ticket } from '@/types/api/tickets'
import { formatDateHeader, formatDate, formatTime } from './utils/dateFormatters'
import { equipmentConfig } from './utils/equipmentConfig'

// Componente de Card para cada viaje
interface TravelCardProps {
  travel: Travel
  onSellClick: (travel: Travel) => void
  onViewTickets: (travelId: number) => void
  onViewImages: (travel: Travel) => void
  onCloseTravel: (travel: Travel) => void
}

const TravelCard = ({ travel, onSellClick, onViewTickets, onViewImages, onCloseTravel }: TravelCardProps) => {
  const [equipmentAnchor, setEquipmentAnchor] = useState<HTMLElement | null>(null)
  const [selectedEquipment, setSelectedEquipment] = useState<{ icon: string; label: string } | null>(null)
  const [selectedEquipmentKey, setSelectedEquipmentKey] = useState<string | null>(null)

  const handleEquipmentClick = (event: React.MouseEvent<HTMLElement>, eq: string) => {
    event.stopPropagation()
    event.preventDefault()

    if (selectedEquipmentKey === eq && equipmentAnchor) {
      setEquipmentAnchor(null)
      setSelectedEquipment(null)
      setSelectedEquipmentKey(null)

      return
    }

    const config = equipmentConfig[eq] || { icon: 'tabler-question-mark', label: eq }

    setSelectedEquipment(config)
    setSelectedEquipmentKey(eq)
    setEquipmentAnchor(event.currentTarget)
  }

  const handleCardClick = () => {
    if (equipmentAnchor) {
      setEquipmentAnchor(null)
      setSelectedEquipment(null)
      setSelectedEquipmentKey(null)
    }
  }

  const seatsColor =
    travel.seatsAvailable && travel.seatsAvailable > 10
      ? 'success'
      : travel.seatsAvailable && travel.seatsAvailable > 0
        ? 'warning'
        : 'error'

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.2s ease',
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          boxShadow: 3
        }
      }}
    >
      {/* Header / Cabecera con color primario sólido */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 45,
                height: 45,
                borderRadius: 2,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className='tabler-bus' style={{ fontSize: '22px', color: 'white' }} />
            </Box>
            <Box>
              <Typography variant='subtitle1' fontWeight={700} color='inherit'>
                {travel.bus?.name || 'N/A'}
              </Typography>
              <Typography variant='caption' sx={{ color: 'rgba(255, 255, 255, 0.8)' }} fontWeight={500}>
                {travel.bus?.plaque} • {travel.bus?.brand} {travel.bus?.model}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={travel.travel_status === 'active' ? 'Activo' : travel.travel_status}
            size='small'
            color={travel.travel_status === 'active' ? 'success' : 'default'}
            variant='filled'
            sx={{
              fontWeight: 600,
              bgcolor: travel.travel_status === 'active' ? 'success.main' : 'rgba(255, 255, 255, 0.2)',
              color: 'white'
            }}
          />
        </Box>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {/* Horarios de salida y llegada */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            bgcolor: 'action.hover',
            borderRadius: 2,
            mb: 2
          }}
        >
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant='caption' color='text.secondary' display='block'>
              Salida
            </Typography>
            <Typography variant='h5' fontWeight={700} color='primary.main'>
              {formatTime(travel.departure_time)}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {formatDate(travel.departure_time)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 2 }}>
            <i
              className='tabler-arrow-right'
              style={{ fontSize: '24px', color: 'var(--mui-palette-text-secondary)' }}
            />
          </Box>

          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant='caption' color='text.secondary' display='block'>
              Llegada
            </Typography>
            <Typography variant='h5' fontWeight={700} color='secondary.main'>
              {formatTime(travel.arrival_time)}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {formatDate(travel.arrival_time)}
            </Typography>
          </Box>
        </Box>

        {/* Info de precios y asientos */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Box sx={{ p: 1.5, bgcolor: 'success.lighter', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant='caption' color='text.secondary' display='block'>
                Piso 1
              </Typography>
              <Typography variant='h6' fontWeight={700} color='success.main'>
                Bs. {parseFloat(travel.price_deck_1).toFixed(2)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            {travel.bus?.decks ? (
              <Box sx={{ p: 1.5, bgcolor: 'success.lighter', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant='caption' color='text.secondary' display='block'>
                  Piso 2
                </Typography>
                <Typography variant='h6' fontWeight={700} color='success.main'>
                  Bs. {parseFloat(travel.price_deck_2).toFixed(2)}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant='caption' color='text.secondary' display='block'>
                  Piso 2
                </Typography>
                <Typography variant='body2' color='text.disabled'>
                  N/A
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Asientos disponibles */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            bgcolor: `${seatsColor}.lighter`,
            borderRadius: 2,
            mb: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <i
              className='tabler-armchair'
              style={{ fontSize: '20px', color: `var(--mui-palette-${seatsColor}-main)` }}
            />
            <Typography variant='body2' fontWeight={500}>
              Asientos Disponibles
            </Typography>
          </Box>
          <Chip
            label={travel.seatsAvailable ?? 'N/A'}
            color={seatsColor}
            variant='tonal'
            size='medium'
            sx={{ fontWeight: 700, fontSize: '1rem', px: 1 }}
          />
        </Box>

        {/* Equipamiento */}
        {travel.bus?.equipment && travel.bus.equipment.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant='caption' color='text.secondary' sx={{ mb: 1, display: 'block' }}>
              Equipamiento
            </Typography>
            <Box display='flex' gap={0.5} flexWrap='wrap'>
              {travel.bus.equipment.map(eq => {
                const config = equipmentConfig[eq] || { icon: 'tabler-question-mark', label: eq }

                return (
                  <Box
                    key={eq}
                    onClick={e => handleEquipmentClick(e, eq)}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'action.hover',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        color: 'white'
                      }
                    }}
                  >
                    <i className={config.icon} style={{ fontSize: '14px' }} />
                  </Box>
                )
              })}
            </Box>

            {/* Popover para mostrar info del equipamiento */}
            <Popover
              open={Boolean(equipmentAnchor)}
              anchorEl={equipmentAnchor}
              onClose={() => {
                setEquipmentAnchor(null)
                setSelectedEquipment(null)
                setSelectedEquipmentKey(null)
              }}
              disableRestoreFocus
              disableScrollLock
              disableAutoFocus
              disableEnforceFocus
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center'
              }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 0.5,
                    boxShadow: 3
                  }
                }
              }}
            >
              {selectedEquipment && (
                <Box sx={{ px: 1.5, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i
                    className={selectedEquipment.icon}
                    style={{ fontSize: '16px', color: 'var(--mui-palette-primary-main)' }}
                  />
                  <Typography variant='body2' fontWeight={500}>
                    {selectedEquipment.label}
                  </Typography>
                </Box>
              )}
            </Popover>
          </Box>
        )}

        {/* Tipo de viaje */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant='caption' color='text.secondary'>
            Tipo:
          </Typography>
          <Chip
            label={travel.type === 'normal' ? 'Normal' : 'Habilitada'}
            size='small'
            color={travel.type === 'normal' ? 'default' : 'warning'}
            variant='outlined'
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Botones de acción */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant='contained'
            color='primary'
            size='small'
            startIcon={<i className='tabler-shopping-cart' />}
            onClick={e => {
              e.stopPropagation()
              onSellClick(travel)
            }}
            disabled={travel.travel_status !== 'active'}
            sx={{ flex: 1 }}
          >
            Vender
          </Button>
          <Button
            variant='outlined'
            color='success'
            size='small'
            onClick={e => {
              e.stopPropagation()
              onViewTickets(travel.id)
            }}
            sx={{ minWidth: 'auto', px: 2 }}
          >
            <i className='tabler-ticket' style={{ fontSize: '18px' }} />
          </Button>
          <Button
            variant='outlined'
            color='info'
            size='small'
            onClick={e => {
              e.stopPropagation()
              onViewImages(travel)
            }}
            sx={{ minWidth: 'auto', px: 2 }}
          >
            <i className='tabler-photo' style={{ fontSize: '18px' }} />
          </Button>
          <Button
            variant='outlined'
            color='error'
            size='small'
            onClick={e => {
              e.stopPropagation()
              onCloseTravel(travel)
            }}
            disabled={travel.travel_status !== 'active'}
            sx={{ minWidth: 'auto', px: 2 }}
          >
            <i className='tabler-lock' style={{ fontSize: '18px' }} />
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

const TravelsForSale = () => {
  const [departureTimeFilter, setDepartureTimeFilter] = useState<string>('')
  const [destinationPlaceIdFilter, setDestinationPlaceIdFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
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
      const date = new Date(travel.departure_time)
      const dateKey = date.toISOString().split('T')[0]

      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }

      grouped[dateKey].push(travel)
    })

    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => {
        const dateA = new Date(a.departure_time)
        const dateB = new Date(b.departure_time)

        return dateA.getTime() - dateB.getTime()
      })
    })

    return grouped
  }, [activeTravels])

  const sortedDates = useMemo(() => {
    return Object.keys(travelsByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
  }, [travelsByDate])

  // Paginación
  const paginatedDates = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    let count = 0
    const result: { dateKey: string; travels: Travel[] }[] = []

    for (const dateKey of sortedDates) {
      const travelsForDate = travelsByDate[dateKey]

      for (const travel of travelsForDate) {
        if (count >= startIndex && count < startIndex + pageSize) {
          const existing = result.find(r => r.dateKey === dateKey)

          if (existing) {
            existing.travels.push(travel)
          } else {
            result.push({ dateKey, travels: [travel] })
          }
        }

        count++
      }
    }

    return result
  }, [sortedDates, travelsByDate, currentPage, pageSize])

  const totalPages = Math.ceil(activeTravels.length / pageSize)

  const handleSellTicket = async (data: Omit<CreateTicketDto, 'payment_type'>, travel: Travel) => {
    setPendingTicketData(data)
    setSelectedTravel(travel)

    const selectedSeatsData = travel.travelSeats.filter(seat =>
      data.seatSelections.some(sel => sel.seatId === String(seat.id))
    )

    const pseudoTicket: Ticket = {
      id: 0,
      type: 'IN_OFFICE',
      status: 'pending',
      total_price: data.seatSelections.reduce((sum, sel) => sum + parseFloat(sel.price || '0'), 0).toFixed(2),
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

      const ticketData: CreateTicketDto = {
        ...pendingTicketData,
        payment_type: 'cash'
      }

      const createdTicket = await createTicketMutation.mutateAsync(ticketData)

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

      setPendingTicket(createdTicket)
      setPendingAssignments(assignments)
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

      const ticketData: CreateTicketDto = {
        ...pendingTicketData,
        payment_type: 'qr'
      }

      const createdTicket = await createTicketMutation.mutateAsync(ticketData)

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

      setPendingTicket(createdTicket)
      setPendingAssignments(assignments)
      setOpenAssignDialog(false)
      setOpenQRDialog(true)
    } catch (error) {
      console.error('Error processing QR payment:', error)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handleCancelAssignment = async () => {
    setOpenAssignDialog(false)
    setPendingTicket(null)
    setPendingTicketData(null)
    setSelectedTravel(undefined)
  }

  const handleQRPaymentSuccess = () => {
    if (!pendingTicket || !selectedTravel) return

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
      {/* Header y filtros */}
      <Card sx={{ mb: 4 }}>
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

        <Box sx={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
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
      </Card>

      {/* Cards de viajes agrupados por fecha */}
      {activeTravels.length === 0 ? (
        <Card>
          <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <i className='tabler-info-circle' style={{ fontSize: '48px', color: 'var(--mui-palette-text-disabled)' }} />
            <Typography variant='h6' color='text.secondary'>
              No hay viajes disponibles en este momento
            </Typography>
          </Box>
        </Card>
      ) : (
        <>
          {paginatedDates.map(({ dateKey, travels: dateTravels }) => (
            <Box key={dateKey} sx={{ mb: 4 }}>
              {/* Encabezado de fecha */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 2,
                  p: 2,
                  bgcolor: 'primary.lighter',
                  borderRadius: 2,
                  borderLeft: '4px solid',
                  borderColor: 'primary.main'
                }}
              >
                <i
                  className='tabler-calendar-event'
                  style={{ fontSize: '20px', color: 'var(--mui-palette-primary-main)' }}
                />
                <Typography variant='h6' fontWeight={600} color='primary.main' sx={{ textTransform: 'capitalize' }}>
                  {formatDateHeader(dateKey)}
                </Typography>
                <Chip
                  label={`${dateTravels.length} ${dateTravels.length === 1 ? 'viaje' : 'viajes'}`}
                  size='small'
                  color='primary'
                  variant='tonal'
                />
              </Box>

              {/* Grid de cards */}
              <Grid container spacing={3}>
                {dateTravels.map(travel => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={travel.id}>
                    <TravelCard
                      travel={travel}
                      onSellClick={t => {
                        setSelectedTravel(t)
                        setOpenSellDialog(true)
                      }}
                      onViewTickets={travelId => {
                        setSelectedTravelForTickets(travelId)
                        setShowTicketsList(true)
                      }}
                      onViewImages={t => {
                        setSelectedTravel(t)
                        setOpenImagesDialog(true)
                      }}
                      onCloseTravel={t => {
                        setSelectedTravel(t)
                        setOpenConfirmCloseDialog(true)
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}

          {/* Paginación */}
          {totalPages > 1 && (
            <Card sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                <Typography variant='body2' color='text.secondary'>
                  Mostrando {(currentPage - 1) * pageSize + 1} a{' '}
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
                    <MenuItem value={6}>6</MenuItem>
                    <MenuItem value={12}>12</MenuItem>
                    <MenuItem value={24}>24</MenuItem>
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
          )}
        </>
      )}

      {/* Dialogs */}
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

      <AssignPassengersDialog
        open={openAssignDialog}
        onClose={handleCancelAssignment}
        ticket={pendingTicket}
        onPayCash={handlePayCash}
        onPayQR={handlePayQR}
        isLoading={isProcessingPayment}
      />

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

      <BusImagesDialog
        open={openImagesDialog}
        onClose={() => {
          setOpenImagesDialog(false)
          setSelectedTravel(undefined)
        }}
        selectedTravel={selectedTravel}
      />

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

      <QRPaymentDialog
        open={openQRDialog}
        onClose={() => setOpenQRDialog(false)}
        ticket={pendingTicket}
        travel={selectedTravel || null}
        onPaymentSuccess={handleQRPaymentSuccess}
        onPaymentCancel={handleQRPaymentCancel}
      />

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
