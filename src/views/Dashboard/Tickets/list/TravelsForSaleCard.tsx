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
import CircularProgress from '@mui/material/CircularProgress'

import type { Travel } from '@/types/api/travels'
import SellTicketDialog from '../components/SellTicketDialog'
import { useCreateTicket, useConfirmTicket, useCancelTicket } from '@/hooks/useTickets'
import type { CreateTicketDto, Ticket } from '@/types/api/tickets'

interface TravelsForSaleCardProps {
  travel: Travel
}

const TravelsForSaleCard = ({ travel }: TravelsForSaleCardProps) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false)
  const [pendingTicket, setPendingTicket] = useState<Ticket | null>(null)
  const createTicketMutation = useCreateTicket()
  const confirmTicketMutation = useConfirmTicket()
  const cancelTicketMutation = useCancelTicket()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)

    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)

    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSellTicket = async (data: CreateTicketDto) => {
    try {
      // Crear el ticket (queda en estado pendiente/reservado)
      const createdTicket = await createTicketMutation.mutateAsync(data)

      setPendingTicket(createdTicket)
      setOpenDialog(false)
      setOpenConfirmDialog(true)
    } catch (error) {
      console.error('Error creating ticket:', error)
    }
  }

  const handleConfirmSale = async () => {
    if (!pendingTicket) return

    try {
      // Confirmar el ticket
      await confirmTicketMutation.mutateAsync(pendingTicket.id)

      setOpenConfirmDialog(false)
      setPendingTicket(null)
      setOpenSuccessDialog(true)
    } catch (error) {
      console.error('Error confirming ticket:', error)
    }
  }

  const handleCancelSale = async () => {
    if (!pendingTicket) return

    try {
      // Cancelar el ticket (libera los asientos)
      await cancelTicketMutation.mutateAsync(pendingTicket.id)

      setOpenConfirmDialog(false)
      setPendingTicket(null)
    } catch (error) {
      console.error('Error canceling ticket:', error)
    }
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
              <i className='tabler-calendar' style={{ fontSize: '1.1rem', color: 'var(--mui-palette-text-secondary)' }} />
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
              <i className='tabler-info-circle' style={{ fontSize: '1.1rem', color: 'var(--mui-palette-text-secondary)' }} />
              <Chip
                label={travel.travel_status === 'active' ? 'Activo' : travel.travel_status}
                size='small'
                color={travel.travel_status === 'active' ? 'success' : 'default'}
                variant='outlined'
              />
            </Box>
          </Stack>

          {/* Action Button */}
          <Box mt='auto' pt={2}>
            <Button
              fullWidth
              variant='contained'
              color='primary'
              startIcon={<i className='tabler-ticket' />}
              onClick={() => setOpenDialog(true)}
              disabled={travel.travel_status !== 'active'}
            >
              Vender Tickets
            </Button>
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

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => {}}
        maxWidth='sm'
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle>
          <Box display='flex' alignItems='center' gap={2}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                bgcolor: 'warning.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className='tabler-alert-circle' style={{ fontSize: '28px', color: 'white' }} />
            </Box>
            <Typography variant='h5' fontWeight={600}>
              Confirmar Venta de Ticket
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
            Los asientos han sido reservados temporalmente. ¿Deseas confirmar la venta de este ticket?
          </Typography>
          {pendingTicket && (
            <Box
              sx={{
                bgcolor: 'primary.lighter',
                p: 2,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'primary.main'
              }}
            >
              <Typography variant='body2' fontWeight={600} color='primary.main' sx={{ mb: 1 }}>
                Detalles del Ticket:
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Total de asientos: {pendingTicket.seats.length}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Total a pagar: Bs. {pendingTicket.total_price}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button
            onClick={handleCancelSale}
            variant='outlined'
            color='error'
            disabled={confirmTicketMutation.isPending || cancelTicketMutation.isPending}
            startIcon={cancelTicketMutation.isPending ? <CircularProgress size={20} /> : <i className='tabler-x' />}
            sx={{ flex: 1 }}
          >
            {cancelTicketMutation.isPending ? 'Cancelando...' : 'Cancelar Venta'}
          </Button>
          <Button
            onClick={handleConfirmSale}
            variant='contained'
            color='success'
            disabled={confirmTicketMutation.isPending || cancelTicketMutation.isPending}
            startIcon={
              confirmTicketMutation.isPending ? <CircularProgress size={20} /> : <i className='tabler-check' />
            }
            sx={{ flex: 1 }}
          >
            {confirmTicketMutation.isPending ? 'Confirmando...' : 'Confirmar Venta'}
          </Button>
        </DialogActions>
      </Dialog>

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
    </>
  )
}

export default TravelsForSaleCard
