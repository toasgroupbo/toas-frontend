'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

import type { Ticket } from '@/types/api/tickets'

interface CancelTicketDialogProps {
  open: boolean
  onClose: () => void
  ticket: Ticket | null
  onConfirmCancel: () => void
  isLoading: boolean
}

const CancelTicketDialog = ({ open, onClose, ticket, onConfirmCancel, isLoading }: CancelTicketDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
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
            <i className='tabler-x' style={{ fontSize: '28px', color: 'white' }} />
          </Box>
          <Typography variant='h5' fontWeight={600}>
            Cancelar Ticket
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
          ¿Estás seguro de que deseas cancelar este ticket?
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
            Esta acción no se puede deshacer. El ticket será marcado como cancelado.
          </Typography>
        </Box>
        {ticket && (
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
              <strong>Ticket:</strong> #{ticket.id}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
              <strong>Asientos:</strong> {ticket.seats.map(s => `#${s.seatNumber}`).join(', ')}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              <strong>Total:</strong> Bs. {parseFloat(ticket.total_price).toFixed(2)}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} variant='outlined' color='secondary' fullWidth disabled={isLoading}>
          No, Mantener
        </Button>
        <Button
          onClick={onConfirmCancel}
          variant='contained'
          color='error'
          fullWidth
          startIcon={isLoading ? <CircularProgress size={16} /> : <i className='tabler-x' />}
          disabled={isLoading}
        >
          {isLoading ? 'Cancelando...' : 'Sí, Cancelar Ticket'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CancelTicketDialog
