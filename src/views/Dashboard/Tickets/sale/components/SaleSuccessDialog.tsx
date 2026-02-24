'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Grid } from '@mui/material'

import type { Travel } from '@/types/api/travels'
import type { Ticket } from '@/types/api/tickets'

interface SaleSuccessDialogProps {
  open: boolean
  onClose: () => void
  saleDetails: {
    ticket: Ticket | null
    travel: Travel | null
  }
  onContinueSelling: () => void
  onViewTickets: () => void
}

const SaleSuccessDialog = ({
  open,
  onClose,
  saleDetails,
  onContinueSelling,
  onViewTickets
}: SaleSuccessDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
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
                    {saleDetails.travel.route.officeOrigin.place?.name || 'N/A'} →{' '}
                    {saleDetails.travel.route.officeDestination.place?.name || 'N/A'}
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
              El ticket ha sido confirmado y el pago procesado
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              El cliente recibirá su ticket en el sistema y puede ser impreso
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
        <Button onClick={onContinueSelling} variant='outlined' color='secondary' sx={{ flex: 1 }}>
          Continuar vendiendo
        </Button>
        <Button
          onClick={onViewTickets}
          variant='contained'
          color='primary'
          sx={{ flex: 1 }}
          startIcon={<i className='tabler-list' />}
        >
          Ver lista de tickets
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SaleSuccessDialog
