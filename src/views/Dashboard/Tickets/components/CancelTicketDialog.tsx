'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

import type { Ticket } from '@/types/api/tickets'

interface CancelTicketDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  ticket: Ticket | null
  isLoading?: boolean
}

const CancelTicketDialog = ({ open, onClose, onConfirm, ticket, isLoading = false }: CancelTicketDialogProps) => {
  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <i className='tabler-alert-triangle' style={{ fontSize: '28px', color: 'var(--mui-palette-error-main)' }} />
        <span>Cancelar Ticket</span>
      </DialogTitle>

      <DialogContent>
        <Alert severity='warning' sx={{ mb: 3 }}>
          Esta acción cancelará el ticket y liberará los asientos
        </Alert>

        <Typography variant='body1' gutterBottom>
          ¿Estás seguro que deseas cancelar el siguiente ticket?
        </Typography>

        {ticket && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              backgroundColor: 'action.hover'
            }}
          >
            <div className='flex flex-col gap-3'>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant='subtitle2' color='text.secondary'>
                  Ticket ID:
                </Typography>
                <Chip label={`#${ticket.id}`} color='primary' size='small' />
              </Box>

              {ticket.customer && (
                <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    Cliente
                  </Typography>
                  <div className='flex items-center gap-2 mt-1'>
                    <i className='tabler-user' style={{ fontSize: '18px' }} />
                    <div>
                      <Typography variant='body2' fontWeight='medium'>
                        {ticket.customer.name}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        CI: {ticket.customer.ci}
                      </Typography>
                    </div>
                  </div>
                </Box>
              )}

              {ticket.travel && (
                <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    Viaje
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <div className='flex items-center gap-1'>
                      <i className='tabler-flag' style={{ fontSize: '16px', color: 'var(--mui-palette-success-main)' }} />
                      <Typography variant='body2' fontWeight='medium'>
                        {ticket.travel.route.officeOrigin.city}
                      </Typography>
                    </div>
                    <i className='tabler-arrow-right' style={{ fontSize: '16px' }} />
                    <div className='flex items-center gap-1'>
                      <i
                        className='tabler-flag-filled'
                        style={{ fontSize: '16px', color: 'var(--mui-palette-error-main)' }}
                      />
                      <Typography variant='body2' fontWeight='medium'>
                        {ticket.travel.route.officeDestination.city}
                      </Typography>
                    </div>
                  </Box>
                  <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                    Salida: {ticket.travel.departure_time}
                  </Typography>
                </Box>
              )}

              <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
                <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                  Asientos
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {ticket.seats.map((seat, index) => (
                    <Chip
                      key={index}
                      label={`${seat.seatNumber} - Bs. ${seat.price}`}
                      size='small'
                      color='error'
                      variant='outlined'
                      icon={<i className='tabler-armchair' />}
                    />
                  ))}
                </Box>
              </Box>

              <Box
                sx={{
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  pt: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Typography variant='subtitle1' fontWeight='bold'>
                  Total a reembolsar:
                </Typography>
                <Typography variant='h6' color='error.main' fontWeight='bold'>
                  Bs. {ticket.total_price}
                </Typography>
              </Box>
            </div>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant='outlined' color='secondary' disabled={isLoading}>
          No, mantener
        </Button>
        <Button
          onClick={handleConfirm}
          variant='contained'
          color='error'
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <i className='tabler-x' />}
        >
          {isLoading ? 'Cancelando...' : 'Sí, cancelar ticket'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CancelTicketDialog
