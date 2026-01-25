'use client'

import { useState } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import type { Travel } from '@/types/api/travels'
import SellTicketDialog from '../components/SellTicketDialog'
import AssignPassengersDialog from '../components/AssignPassengersDialog'
import type { SeatAssignment } from '../components/AssignPassengersDialog'
import { useCreateTicket, useConfirmTicket, useCancelTicket } from '@/hooks/useTickets'
import { useAssignPassenger } from '@/hooks/usePassengers'
import { useCloseTravel } from '@/hooks/useCashierTravels'
import type { CreateTicketDto, Ticket } from '@/types/api/tickets'

interface TravelsForSaleCardProps {
  travel: Travel
}

const TravelsForSaleCard = ({ travel }: TravelsForSaleCardProps) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [openAssignDialog, setOpenAssignDialog] = useState(false)
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false)
  const [openImagesDialog, setOpenImagesDialog] = useState(false)
  const [openConfirmCloseDialog, setOpenConfirmCloseDialog] = useState(false)
  const [pendingTicket, setPendingTicket] = useState<Ticket | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const createTicketMutation = useCreateTicket()
  const confirmTicketMutation = useConfirmTicket()
  const cancelTicketMutation = useCancelTicket()
  const assignPassengerMutation = useAssignPassenger()
  const closeTravelMutation = useCloseTravel()

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

  const formatTime = (dateString: string) => {
    const dateWithoutZ = dateString.replace('Z', '')
    const date = new Date(dateWithoutZ)

    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSellTicket = async (data: CreateTicketDto) => {
    try {
      const createdTicket = await createTicketMutation.mutateAsync(data)

      // Enriquecer los seats del ticket con información de travelSeats (deck)
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
      setOpenDialog(false)
      setOpenAssignDialog(true)
    } catch (error) {
      console.error('Error creating ticket:', error)
    }
  }

  const handlePayCash = async (assignments: SeatAssignment[]) => {
    if (!pendingTicket) return

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

      setOpenAssignDialog(false)
      setPendingTicket(null)
      setOpenSuccessDialog(true)
    } catch (error) {
      console.error('Error processing cash payment:', error)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handlePayQR = async (assignments: SeatAssignment[]) => {
    if (!pendingTicket) return

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

      setOpenAssignDialog(false)
      setPendingTicket(null)
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
    try {
      await closeTravelMutation.mutateAsync(travel.id)
      setOpenConfirmCloseDialog(false)
    } catch (error) {
      console.error('Error closing travel:', error)
    }
  }

  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

    return `${baseUrl}${imagePath}`
  }

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}
      >
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Route Header */}
          <Box>
            <Box display='flex' alignItems='center' gap={1} mb={1}>
              <Typography variant='h6' color='text.primary' fontWeight={600}>
                {travel.route.officeOrigin.city}
              </Typography>
              <i className='tabler-arrow-right' style={{ fontSize: '1.2rem' }} />
              <Typography variant='h6' color='text.primary' fontWeight={600}>
                {travel.route.officeDestination.city}
              </Typography>
            </Box>
            <Typography variant='caption' color='text.secondary'>
              Ruta directa
            </Typography>
          </Box>

          <Divider />

          {/* Travel Details */}
          <Stack spacing={1.5}>
            {/* Date and Time */}
            <Box display='flex' alignItems='center' gap={1}>
              <i
                className='tabler-calendar'
                style={{ fontSize: '1.1rem', color: 'var(--mui-palette-text-secondary)' }}
              />
              <Typography variant='body2' color='text.secondary'>
                {formatDate(travel.departure_time)}
              </Typography>
              <Chip label={formatTime(travel.departure_time)} size='small' color='primary' variant='tonal' />
            </Box>

            {/* Bus Info */}
            <Box display='flex' alignItems='center' gap={1}>
              <i className='tabler-bus' style={{ fontSize: '1.1rem', color: 'var(--mui-palette-text-secondary)' }} />
              <Typography variant='body2' color='text.secondary'>
                {travel.bus.name}
              </Typography>
              <Typography variant='caption' color='text.disabled'>
                ({travel.bus.plaque})
              </Typography>
            </Box>

            {/* Price Range */}
            <Box display='flex' alignItems='center' gap={1}>
              <i
                className='tabler-currency-dollar'
                style={{ fontSize: '1.1rem', color: 'var(--mui-palette-text-secondary)' }}
              />
              <Typography variant='body2' color='text.secondary'>
                Piso 1:
              </Typography>
              <Typography variant='body1' fontWeight={600} color='primary'>
                Bs. {parseFloat(travel.price_deck_1).toFixed(2)}
              </Typography>
              {travel.bus.decks && (
                <>
                  <Typography variant='body2' color='text.secondary'>
                    | Piso 2:
                  </Typography>
                  <Typography variant='body1' fontWeight={600} color='primary'>
                    Bs. {parseFloat(travel.price_deck_2).toFixed(2)}
                  </Typography>
                </>
              )}
            </Box>

            {/* Status */}
            <Box display='flex' alignItems='center' gap={1}>
              <i
                className='tabler-info-circle'
                style={{ fontSize: '1.1rem', color: 'var(--mui-palette-text-secondary)' }}
              />
              <Chip
                label={travel.travel_status === 'active' ? 'Activo' : travel.travel_status}
                size='small'
                color={travel.travel_status === 'active' ? 'success' : 'default'}
                variant='outlined'
              />
            </Box>
          </Stack>

          {/* Action Buttons */}
          <Box mt='auto' pt={2}>
            <Stack spacing={1}>
              <Button
                fullWidth
                variant='outlined'
                color='info'
                startIcon={<i className='tabler-photo' />}
                onClick={() => setOpenImagesDialog(true)}
              >
                Ver Imágenes del Bus
              </Button>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  sx={{ flex: 1 }}
                  variant='contained'
                  color='primary'
                  startIcon={<i className='tabler-ticket' />}
                  onClick={() => setOpenDialog(true)}
                  disabled={travel.travel_status !== 'active'}
                >
                  Vender Tickets
                </Button>
                <Button
                  sx={{ flex: 1 }}
                  variant='outlined'
                  color='error'
                  startIcon={<i className='tabler-lock' />}
                  onClick={() => setOpenConfirmCloseDialog(true)}
                  disabled={travel.travel_status !== 'active'}
                >
                  Cerrar Viaje
                </Button>
              </Box>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <SellTicketDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSellTicket}
        isLoading={createTicketMutation.isPending}
        preSelectedTravel={travel}
      />

      <AssignPassengersDialog
        open={openAssignDialog}
        onClose={handleCancelAssignment}
        ticket={pendingTicket}
        onPayCash={handlePayCash}
        onPayQR={handlePayQR}
        isLoading={isProcessingPayment}
      />

      {/* Success Dialog */}
      <Dialog open={openSuccessDialog} onClose={() => setOpenSuccessDialog(false)} maxWidth='sm' fullWidth>
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
            <Typography variant='h5' fontWeight={600}>
              ¡Venta Exitosa!
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
            El ticket ha sido vendido correctamente.
          </Typography>
          <Box
            sx={{
              bgcolor: 'success.lighter',
              p: 2,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'success.main'
            }}
          >
            <Typography variant='body2' fontWeight={600} color='success.main'>
              El cliente recibirá su ticket confirmado
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setOpenSuccessDialog(false)}
            variant='contained'
            color='success'
            fullWidth
            startIcon={<i className='tabler-check' />}
          >
            Entendido
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bus Images Dialog */}
      <Dialog open={openImagesDialog} onClose={() => setOpenImagesDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>
          <Box display='flex' alignItems='center' justifyContent='space-between'>
            <Box display='flex' alignItems='center' gap={2}>
              <i className='tabler-bus' style={{ fontSize: '24px', color: 'var(--mui-palette-primary-main)' }} />
              <Typography variant='h5' fontWeight={600}>
                Imágenes del Bus - {travel.bus.name}
              </Typography>
            </Box>
            <Button onClick={() => setOpenImagesDialog(false)} color='secondary' size='small'>
              <i className='tabler-x' />
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
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
                {getImageUrl(travel.bus.exterior_image) ? (
                  <img
                    src={getImageUrl(travel.bus.exterior_image) || ''}
                    alt={`${travel.bus.name} - Exterior`}
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

            <Divider />

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
                {getImageUrl(travel.bus.interior_image) ? (
                  <img
                    src={getImageUrl(travel.bus.interior_image) || ''}
                    alt={`${travel.bus.name} - Interior`}
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
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenImagesDialog(false)} variant='contained' color='primary' fullWidth>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Close Travel Dialog */}
      <Dialog open={openConfirmCloseDialog} onClose={() => setOpenConfirmCloseDialog(false)} maxWidth='sm' fullWidth>
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
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
              <strong>Ruta:</strong> {travel.route.officeOrigin.city} → {travel.route.officeDestination.city}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
              <strong>Fecha:</strong> {formatDate(travel.departure_time)} - {formatTime(travel.departure_time)}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              <strong>Bus:</strong> {travel.bus.name} ({travel.bus.plaque})
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setOpenConfirmCloseDialog(false)}
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
    </>
  )
}

export default TravelsForSaleCard
