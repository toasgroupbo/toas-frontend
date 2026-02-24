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

import type { Ticket } from '@/types/api/tickets'
import type { Travel } from '@/types/api/travels'

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
  paymentMethod
}: ConfirmPaymentDialogProps) => {
  if (!ticket || !travel) return null

  const isProcessing = isConfirming || isCancelling

  return (
    <Dialog open={open} onClose={isProcessing ? undefined : onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' gap={2}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              bgcolor: paymentMethod === 'cash' ? 'success.main' : 'info.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <i
              className={paymentMethod === 'cash' ? 'tabler-cash' : 'tabler-qrcode'}
              style={{ fontSize: '28px', color: 'white' }}
            />
          </Box>
          <Box>
            <Typography variant='h5' fontWeight={600}>
              Confirmar Pago
            </Typography>
            <Typography variant='body2' color='text.secondary'>
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
            {ticket.travelSeats?.map((seat, index) => (
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
                <Typography variant='body2'>
                  Asiento {seat.seatNumber}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {seat.passenger?.name || 'Sin asignar'}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Total */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'success.lighter',
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography variant='h6' fontWeight='bold'>
              Total a pagar:
            </Typography>
            <Typography variant='h4' color='success.main' fontWeight='bold'>
              Bs. {parseFloat(ticket.total_price || '0').toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
        <Button
          onClick={onCancel}
          variant='outlined'
          color='error'
          fullWidth
          disabled={isProcessing}
          startIcon={isCancelling ? <CircularProgress size={16} /> : <i className='tabler-x' />}
        >
          {isCancelling ? 'Cancelando...' : 'Cancelar Venta'}
        </Button>
        <Button
          onClick={onConfirm}
          variant='contained'
          color='success'
          fullWidth
          disabled={isProcessing}
          startIcon={isConfirming ? <CircularProgress size={16} /> : <i className='tabler-check' />}
        >
          {isConfirming ? 'Confirmando...' : 'Confirmar Pago'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmPaymentDialog
