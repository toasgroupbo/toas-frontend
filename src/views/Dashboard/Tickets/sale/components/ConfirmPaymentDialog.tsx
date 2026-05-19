'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import type { Ticket } from '@/types/api/tickets'
import type { Travel } from '@/types/api/travels'
import type { SeatAssignment } from './AssignPassengersDialog'

interface ConfirmPaymentDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  onCancel: () => Promise<void>
  isConfirming: boolean
  isCancelling: boolean
  ticket: Ticket | null
  travel: Travel | null
  paymentMethod: 'cash' | 'qr'
  assignments?: SeatAssignment[]
}

const ConfirmPaymentDialog = ({
  open,
  onClose,
  onConfirm,
  onCancel,
  isConfirming,
  isCancelling,
  ticket,
  travel,
  paymentMethod,
  assignments = []
}: ConfirmPaymentDialogProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  if (!ticket || !travel) return null

  const isProcessing = isConfirming || isCancelling

  return (
    <Dialog open={open} onClose={isProcessing ? undefined : onClose} maxWidth='sm' fullWidth fullScreen={isMobile}>
      <DialogTitle>
        <Box display='flex' alignItems='center' gap={{ xs: 1.5, sm: 2 }}>
          <Box
            sx={{
              width: { xs: 40, sm: 50 },
              height: { xs: 40, sm: 50 },
              borderRadius: '50%',
              bgcolor: paymentMethod === 'cash' ? 'success.main' : 'info.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <i
              className={paymentMethod === 'cash' ? 'tabler-cash' : 'tabler-qrcode'}
              style={{ fontSize: isMobile ? '22px' : '28px', color: 'white' }}
            />
          </Box>
          <Box>
            <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={600}>
              Confirmar Pago
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {paymentMethod === 'cash' ? 'Pago en Efectivo' : 'Pago por QR'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ py: 2 }}>
          {/* Info del viaje */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              <strong>Ruta:</strong> {travel.route?.officeOrigin?.place?.name || 'N/A'} →{' '}
              {travel.route?.officeDestination?.place?.name || 'N/A'}
            </Typography>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              <strong>Bus:</strong> {travel.bus?.name || 'N/A'} - {travel.bus?.plaque || 'N/A'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              <strong>Asientos:</strong> {ticket.seats?.map(s => s.seatNumber).join(', ') || 'N/A'}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Pasajeros */}
          <Typography variant='subtitle2' color='text.secondary' gutterBottom>
            Pasajeros asignados:
          </Typography>
          <Box sx={{ mb: 3 }}>
            {ticket.travelSeats?.map((seat, index) => {
              const assignment = assignments.find(a => a.seatId === seat.id)

              return (
                <Box
                  key={seat.id || index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Typography variant='body2'>Asiento {seat.seatNumber}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {assignment ? `${assignment.passengerName} - CI: ${assignment.passengerCI}` : 'Sin asignar'}
                  </Typography>
                </Box>
              )
            })}
          </Box>

          {/* Total */}
          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
              bgcolor: 'success.lighter',
              borderRadius: 1,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: { xs: 0.5, sm: 0 }
            }}
          >
            <Typography variant={isMobile ? 'body1' : 'h6'} fontWeight='bold'>
              Total a pagar:
            </Typography>
            <Typography variant={isMobile ? 'h5' : 'h4'} color='success.main' fontWeight='bold'>
              Bs. {parseFloat(ticket.total_price || '0').toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          pb: { xs: 2, sm: 3 },
          gap: { xs: 1, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' }
        }}
      >
        <Button
          onClick={onConfirm}
          variant='contained'
          color='success'
          fullWidth
          disabled={isProcessing}
          startIcon={isConfirming ? <CircularProgress size={16} /> : <i className='tabler-check' />}
          sx={{ order: { xs: 1, sm: 2 } }}
        >
          {isConfirming ? 'Confirmando...' : isMobile ? 'Confirmar' : 'Confirmar Pago'}
        </Button>
        <Button
          onClick={onCancel}
          variant='outlined'
          color='error'
          fullWidth
          disabled={isProcessing}
          startIcon={isCancelling ? <CircularProgress size={16} /> : <i className='tabler-x' />}
          sx={{ order: { xs: 2, sm: 1 } }}
        >
          {isCancelling ? 'Cancelando...' : isMobile ? 'Cancelar' : 'Cancelar Venta'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmPaymentDialog
