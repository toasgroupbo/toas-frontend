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
import { formatDateHeader, formatTime } from './utils/dateFormatters'
import { equipmentConfig } from './utils/equipmentConfig'
import { useAuth } from '@/contexts/AuthContext'

// Componente de fila responsive para cada viaje
interface TravelRowProps {
  travel: Travel
  onSellClick: (travel: Travel) => void
  onViewTickets: (travelId: number) => void
  onViewImages: (travel: Travel) => void
  onCloseTravel: (travel: Travel) => void
  isSeller?: boolean
}

const TravelRow = ({
  travel,
  onSellClick,
  onViewTickets,
  onViewImages,
  onCloseTravel,
  isSeller = false
}: TravelRowProps) => {
  const [equipmentAnchor, setEquipmentAnchor] = React.useState<HTMLElement | null>(null)
  const [selectedEquipment, setSelectedEquipment] = React.useState<{ icon: string; label: string } | null>(null)
  const [selectedEquipmentKey, setSelectedEquipmentKey] = React.useState<string | null>(null)

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

  const seatsAvailable = travel.seatsAvailable ?? 0

  const seatsColor = seatsAvailable > 10 ? 'success' : seatsAvailable > 0 ? 'warning' : 'error'

  return (
    <Box
      onClick={() => {
        if (equipmentAnchor) {
          setEquipmentAnchor(null)
          setSelectedEquipment(null)
          setSelectedEquipmentKey(null)

          return
        }

        if (travel.travel_status === 'active') {
          onSellClick(travel)
        }
      }}
      sx={{
        p: { xs: 1.5, md: 2 },
        borderBottom: '1px solid',
        borderColor: 'divider',
        cursor: travel.travel_status === 'active' ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: 'action.hover'
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, sm: 1, md: 2 },
          flexWrap: 'nowrap'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: { xs: 60, sm: 70, md: 100 },
            p: { xs: 0.5, sm: 0.75, md: 1 },
            bgcolor: 'primary.lighter',
            borderRadius: 1,
            flexShrink: 0
          }}
        >
          <Typography
            variant='caption'
            color='text.secondary'
            fontWeight={500}
            sx={{ fontSize: { xs: '0.55rem', sm: '0.6rem', md: '0.75rem' } }}
          >
            Salida
          </Typography>
          <Typography
            variant='h6'
            fontWeight={700}
            color='primary.main'
            sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1.25rem' } }}
          >
            {formatTime(travel.departure_time)}
          </Typography>
          <i
            className='tabler-arrow-down'
            style={{ fontSize: '8px', color: 'var(--mui-palette-text-secondary)', margin: '1px 0' }}
          />
          <Typography
            variant='caption'
            color='text.secondary'
            fontWeight={500}
            sx={{ fontSize: { xs: '0.55rem', sm: '0.6rem', md: '0.75rem' } }}
          >
            Llegada
          </Typography>
          <Typography
            variant='body2'
            fontWeight={600}
            color='text.primary'
            sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem', md: '1rem' } }}
          >
            {formatTime(travel.arrival_time)}
          </Typography>
        </Box>

        {/* Combined: Bus info + Type + Equipment in one column */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 0.25,
            minWidth: { xs: 70, sm: 90, md: 120 },
            maxWidth: { xs: 100, sm: 130, md: 180 },
            overflow: 'hidden',
            flex: { xs: 1, md: 1 },
            ml: 'auto',
            mr: { xs: 1, sm: 2, md: 3 }
          }}
        >
          <Typography
            variant='body2'
            fontWeight={600}
            noWrap
            sx={{
              fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.95rem' },
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {travel.bus?.name || 'N/A'}
          </Typography>
          <Typography
            variant='caption'
            color='text.secondary'
            noWrap
            sx={{
              fontSize: { xs: '0.5rem', sm: '0.55rem', md: '0.7rem' },
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {travel.bus?.plaque}
          </Typography>
          <Chip
            label={travel.type === 'normal' ? 'Normal' : 'Habilitada'}
            size='small'
            color={travel.type === 'normal' ? 'default' : 'warning'}
            variant='filled'
            sx={{
              fontWeight: 600,
              fontSize: { xs: '0.55rem', sm: '0.6rem', md: '0.75rem' },
              height: { xs: 18, sm: 20, md: 24 },
              alignSelf: 'flex-start'
            }}
          />
          {travel.bus?.equipment && travel.bus.equipment.length > 0 && (
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 0.25, flexWrap: 'wrap', mt: 0.25 }}>
              {travel.bus.equipment.slice(0, 4).map(eq => {
                const config = equipmentConfig[eq] || { icon: 'tabler-question-mark', label: eq }

                return (
                  <Box
                    key={eq}
                    onClick={e => handleEquipmentClick(e, eq)}
                    sx={{
                      width: { sm: 18, md: 22 },
                      height: { sm: 18, md: 22 },
                      borderRadius: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: selectedEquipmentKey === eq ? 'primary.main' : 'action.hover',
                      color: selectedEquipmentKey === eq ? 'white' : 'inherit',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        color: 'white'
                      }
                    }}
                  >
                    <i className={config.icon} style={{ fontSize: '10px' }} />
                  </Box>
                )
              })}

              <Popover
                open={Boolean(equipmentAnchor)}
                anchorEl={equipmentAnchor}
                onClose={() => {
                  setEquipmentAnchor(null)
                  setSelectedEquipment(null)
                  setSelectedEquipmentKey(null)
                }}
                disableRestoreFocus
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                slotProps={{ paper: { sx: { mt: 0.5 } } }}
              >
                {selectedEquipment && (
                  <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        bgcolor: 'primary.lighter',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <i
                        className={selectedEquipment.icon}
                        style={{ fontSize: '18px', color: 'var(--mui-palette-primary-main)' }}
                      />
                    </Box>
                    <Typography variant='body2' fontWeight={600}>
                      {selectedEquipment.label}
                    </Typography>
                  </Box>
                )}
              </Popover>
            </Box>
          )}
        </Box>

        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 0.25,
            minWidth: { sm: 50, md: 70 },
            flexShrink: 0
          }}
        >
          <Typography
            variant='caption'
            color='text.secondary'
            fontWeight={600}
            sx={{ fontSize: { sm: '0.55rem', md: '0.7rem' } }}
          >
            Precios
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
            <Typography variant='caption' color='text.secondary' sx={{ fontSize: { sm: '0.5rem', md: '0.65rem' } }}>
              P1:
            </Typography>
            <Typography
              variant='body2'
              fontWeight={700}
              color='success.main'
              sx={{ fontSize: { sm: '0.65rem', md: '0.8rem' } }}
            >
              {parseFloat(travel.price_deck_1).toFixed(0)}
            </Typography>
          </Box>
          {travel.bus?.decks && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <Typography variant='caption' color='text.secondary' sx={{ fontSize: { sm: '0.5rem', md: '0.65rem' } }}>
                P2:
              </Typography>
              <Typography
                variant='body2'
                fontWeight={700}
                color='success.main'
                sx={{ fontSize: { sm: '0.65rem', md: '0.8rem' } }}
              >
                {parseFloat(travel.price_deck_2).toFixed(0)}
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minWidth: { sm: 45, md: 65 },
            flexShrink: 0
          }}
        >
          <Typography
            variant='caption'
            color='text.secondary'
            fontWeight={600}
            sx={{ fontSize: { sm: '0.55rem', md: '0.7rem' } }}
          >
            Vendidos
          </Typography>
          <Typography variant='h6' fontWeight={700} color='info.main' sx={{ fontSize: { sm: '0.8rem', md: '1rem' } }}>
            {travel.totalSoldSeats || 0}
          </Typography>
          <Typography variant='caption' color='text.secondary' sx={{ fontSize: { sm: '0.5rem', md: '0.65rem' } }}>
            de {travel.totalBusSeats || 0}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minWidth: { xs: 40, sm: 45, md: 60 },
            flexShrink: 0
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: 30, sm: 34, md: 44 },
              height: { xs: 30, sm: 34, md: 44 },
              borderRadius: '50%',
              bgcolor: `${seatsColor}.lighter`,
              border: '2px solid',
              borderColor: `${seatsColor}.main`
            }}
          >
            <Typography
              variant='h6'
              fontWeight={700}
              color={`${seatsColor}.main`}
              sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem', md: '1.1rem' } }}
            >
              {seatsAvailable}
            </Typography>
          </Box>
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ fontSize: { xs: '0.45rem', sm: '0.5rem', md: '0.65rem' }, textAlign: 'center' }}
          >
            Asientos Libres
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: { xs: 0.25, sm: 0.5, md: 1 },
            ml: 'auto',
            flexShrink: 0
          }}
        >
          <Tooltip title='Ver Tickets'>
            <IconButton
              onClick={e => {
                e.stopPropagation()
                onViewTickets(travel.id)
              }}
              sx={{
                width: { xs: 28, sm: 30, md: 36 },
                height: { xs: 28, sm: 30, md: 36 },
                color: 'success.main',
                bgcolor: 'success.lighter',
                '&:hover': { bgcolor: 'success.main', color: 'white' }
              }}
            >
              <i className='tabler-ticket' style={{ fontSize: '14px' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title='Ver Imágenes'>
            <IconButton
              onClick={e => {
                e.stopPropagation()
                onViewImages(travel)
              }}
              sx={{
                width: { xs: 28, sm: 30, md: 36 },
                height: { xs: 28, sm: 30, md: 36 },
                color: 'info.main',
                bgcolor: 'info.lighter',
                display: { xs: 'none', sm: 'flex' },
                '&:hover': { bgcolor: 'info.main', color: 'white' }
              }}
            >
              <i className='tabler-photo' style={{ fontSize: '14px' }} />
            </IconButton>
          </Tooltip>

          {!isSeller && (
            <Tooltip title='Cerrar Viaje'>
              <span>
                <IconButton
                  onClick={e => {
                    e.stopPropagation()
                    onCloseTravel(travel)
                  }}
                  disabled={travel.travel_status !== 'active'}
                  sx={{
                    width: { xs: 28, sm: 30, md: 36 },
                    height: { xs: 28, sm: 30, md: 36 },
                    color: 'error.main',
                    bgcolor: 'error.lighter',
                    '&:hover': { bgcolor: 'error.main', color: 'white' },
                    '&.Mui-disabled': { color: 'action.disabled', bgcolor: 'action.hover' }
                  }}
                >
                  <i className='tabler-lock' style={{ fontSize: '14px' }} />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  )
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

  const { userRole } = useAuth()
  const isSeller = userRole === 'CASHIER_SELLER'
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

    return travels.filter(travel => {
      if (!travel.travelSeats) {
        travel.travelSeats = []
      }

      return travel.travel_status === 'active'
    })
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

  const paginatedTravels = useMemo(() => {
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

    const selectedSeatsData = (travel.travelSeats || []).filter(seat =>
      data.seatSelections.some(sel => sel.seatId === String(seat.id))
    )

    const pseudoTicket: Ticket = {
      id: 0, // ID temporal
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
        id: 0,
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
      <Card>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: { xs: 2, md: 3 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 }, flexGrow: 1 }}>
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className='tabler-bus' style={{ fontSize: '32px', color: 'var(--mui-palette-primary-main)' }} />
            </Box>
            <div>
              <Typography
                variant='h5'
                fontWeight='bold'
                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }}
              >
                Viajes Disponibles
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                {activeTravels.length} {activeTravels.length === 1 ? 'viaje disponible' : 'viajes disponibles'}
              </Typography>
            </div>
          </Box>
        </Box>

        <Box sx={{ px: { xs: 2, md: 3 }, pb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Filtros de ruta */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1.5, sm: 2 },
              alignItems: { xs: 'stretch', sm: 'center' }
            }}
          >
            {/* Origen */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: { xs: 1.5, sm: 1 },
                bgcolor: 'primary.lighter',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'primary.main',
                minWidth: { xs: 'auto', sm: 'fit-content' }
              }}
            >
              <i className='tabler-map-pin' style={{ fontSize: '18px', color: 'var(--mui-palette-primary-main)' }} />
              <Box>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                >
                  Origen
                </Typography>
                <Typography
                  variant='body2'
                  fontWeight='medium'
                  color='primary.main'
                  sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                >
                  {cashierPlaceName || 'Cargando...'}
                </Typography>
              </Box>
            </Box>

            {/* Flecha - oculta en móvil */}
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>
              <i
                className='tabler-arrow-right'
                style={{ fontSize: '20px', color: 'var(--mui-palette-text-secondary)' }}
              />
            </Box>

            {/* Destino */}
            <CustomTextField
              select
              value={destinationPlaceIdFilter}
              onChange={e => {
                setDestinationPlaceIdFilter(e.target.value)
                setCurrentPage(1)
              }}
              label='Destino'
              size='small'
              sx={{ minWidth: { xs: '100%', sm: 200, md: 250 } }}
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

            {/* Fecha */}
            <CustomTextField
              type='date'
              value={departureTimeFilter}
              onChange={e => {
                setDepartureTimeFilter(e.target.value)
                setCurrentPage(1)
              }}
              label='Fecha (Opcional)'
              size='small'
              sx={{ minWidth: { xs: '100%', sm: 180, md: 220 } }}
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

        {activeTravels.length === 0 ? (
          <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <i className='tabler-info-circle' style={{ fontSize: '48px', color: 'var(--mui-palette-text-disabled)' }} />
            <Typography variant='h6' color='text.secondary'>
              No hay viajes disponibles en este momento
            </Typography>
          </Box>
        ) : (
          <>
            {paginatedTravels.map(({ dateKey, travels: dateTravels }) => (
              <Box key={dateKey} sx={{ mb: { xs: 2, md: 3 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 1.5, md: 2 },
                    px: { xs: 2, md: 3 },
                    py: { xs: 1.5, md: 2 },
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    borderRadius: '8px 8px 0 0'
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 36, md: 44 },
                      height: { xs: 36, md: 44 },
                      borderRadius: 2,
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <i className='tabler-calendar-event' style={{ fontSize: '20px' }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant='h6'
                      fontWeight={700}
                      sx={{
                        textTransform: 'capitalize',
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: 'white'
                      }}
                    >
                      {formatDateHeader(dateKey)}
                    </Typography>
                    <Typography
                      variant='caption'
                      sx={{
                        color: 'rgba(255, 255, 255, 0.85)',
                        fontWeight: 500,
                        fontSize: { xs: '0.65rem', md: '0.75rem' },
                        display: { xs: 'none', sm: 'block' }
                      }}
                    >
                      {dateTravels.length} {dateTravels.length === 1 ? 'viaje' : 'viajes'}
                    </Typography>
                  </Box>
                  <Chip
                    label={dateTravels.length}
                    size='small'
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: { xs: '0.8rem', md: '1rem' },
                      height: { xs: 24, md: 32 }
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderTop: 'none',
                    borderRadius: '0 0 8px 8px',
                    overflow: 'hidden'
                  }}
                >
                  {dateTravels.map(travel => (
                    <TravelRow
                      key={travel.id}
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
                      isSeller={isSeller}
                    />
                  ))}
                </Box>
              </Box>
            ))}

            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: 2,
                p: { xs: 2, md: 3 }
              }}
            >
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' }, textAlign: { xs: 'center', sm: 'left' } }}
              >
                Mostrando {(currentPage - 1) * pageSize + 1} a {Math.min(currentPage * pageSize, activeTravels.length)}{' '}
                de {activeTravels.length}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: { xs: 1, sm: 2 },
                  alignItems: 'center',
                  justifyContent: { xs: 'center', sm: 'flex-end' },
                  flexWrap: 'wrap'
                }}
              >
                <CustomTextField
                  select
                  value={pageSize}
                  onChange={e => {
                    setPageSize(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  size='small'
                  sx={{ width: { xs: '70px', sm: '80px' } }}
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
                  size='small'
                  siblingCount={0}
                  boundaryCount={1}
                />
              </Box>
            </Box>
          </>
        )}
      </Card>

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
        travel={selectedTravel || null}
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
        assignments={pendingAssignments}
      />
    </Box>
  )
}

export default TravelsForSale
