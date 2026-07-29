'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

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
  onViewTicketDetail: () => void
}

const SaleSuccessDialog = ({
  open,
  onClose,
  saleDetails,
  onContinueSelling,
  onViewTicketDetail
}: SaleSuccessDialogProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth fullScreen={isMobile}>
      <DialogTitle>
        <Box display='flex' alignItems='center' gap={{ xs: 1.5, sm: 2 }}>
          <Box
            sx={{
              width: { xs: 40, sm: 50 },
              height: { xs: 40, sm: 50 },
              borderRadius: '50%',
              bgcolor: 'success.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <i className='tabler-check' style={{ fontSize: isMobile ? '22px' : '28px', color: 'white' }} />
          </Box>
          <Box>
            <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={600}>
              ¡Venta Exitosa!
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
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
      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          pb: { xs: 2, sm: 3 },
          gap: { xs: 1, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' }
        }}
      >
        <Button
          onClick={onViewTicketDetail}
          variant='contained'
          color='primary'
          fullWidth={isMobile}
          sx={{ flex: { sm: 1 }, order: { xs: 1, sm: 2 } }}
          startIcon={<i className='tabler-ticket' />}
        >
          Detalle de Ticket
        </Button>
        <Button
          onClick={onContinueSelling}
          variant='outlined'
          color='secondary'
          fullWidth={isMobile}
          sx={{ flex: { sm: 1 }, order: { xs: 2, sm: 1 } }}
        >
          Continuar vendiendo
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SaleSuccessDialog
