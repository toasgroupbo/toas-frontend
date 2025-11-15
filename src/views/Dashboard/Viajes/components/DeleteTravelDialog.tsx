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

import type { Travel } from '@/types/api/travels'

interface DeleteTravelDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  travel: Travel | null
  isLoading?: boolean
}

const DeleteTravelDialog = ({ open, onClose, onConfirm, travel, isLoading = false }: DeleteTravelDialogProps) => {
  const handleConfirm = async () => {
    await onConfirm()
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)

    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <i className='tabler-alert-triangle' style={{ fontSize: '28px', color: 'var(--mui-palette-error-main)' }} />
        <span>Confirmar Eliminación</span>
      </DialogTitle>

      <DialogContent>
        <Alert severity='warning' sx={{ mb: 3 }}>
          Esta acción no se puede deshacer
        </Alert>

        <Typography variant='body1' gutterBottom>
          ¿Estás seguro que deseas eliminar el siguiente viaje?
        </Typography>

        {travel && (
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
              <div className='flex items-center gap-2'>
                <i className='tabler-bus' style={{ fontSize: '24px', color: 'var(--mui-palette-primary-main)' }} />
                <div>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Bus
                  </Typography>
                  <Typography variant='body1' fontWeight='medium'>
                    {travel.bus.name}
                  </Typography>
                  <Chip label={travel.bus.plaque} size='small' variant='outlined' sx={{ mt: 0.5 }} />
                </div>
              </div>

              <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
                <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                  Ruta
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <div className='flex items-center gap-1'>
                    <i className='tabler-flag' style={{ fontSize: '16px', color: 'var(--mui-palette-success-main)' }} />
                    <Typography variant='body2' fontWeight='medium'>
                      {travel.route.officeOrigin.place}
                    </Typography>
                  </div>
                  <i className='tabler-arrow-right' style={{ fontSize: '16px' }} />
                  <div className='flex items-center gap-1'>
                    <i
                      className='tabler-flag-filled'
                      style={{ fontSize: '16px', color: 'var(--mui-palette-error-main)' }}
                    />
                    <Typography variant='body2' fontWeight='medium'>
                      {travel.route.officeDestination.place}
                    </Typography>
                  </div>
                </Box>
              </Box>

              <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
                <div className='flex items-center gap-1 mb-2'>
                  <i className='tabler-clock' style={{ fontSize: '16px', color: 'var(--mui-palette-info-main)' }} />
                  <Typography variant='caption' color='text.secondary'>
                    Salida:
                  </Typography>
                  <Typography variant='body2'>{formatDateTime(travel.departure_time)}</Typography>
                </div>
                <div className='flex items-center gap-1'>
                  <i
                    className='tabler-clock-check'
                    style={{ fontSize: '16px', color: 'var(--mui-palette-success-main)' }}
                  />
                  <Typography variant='caption' color='text.secondary'>
                    Llegada:
                  </Typography>
                  <Typography variant='body2'>{formatDateTime(travel.arrival_time)}</Typography>
                </div>
              </Box>

              <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
                <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                  Precios
                </Typography>
                <div className='flex gap-2 mt-1'>
                  <Chip label={`Piso 1: Bs. ${travel.price_deck_1}`} color='success' variant='tonal' size='small' />
                  <Chip label={`Piso 2: Bs. ${travel.price_deck_2}`} color='info' variant='tonal' size='small' />
                </div>
              </Box>
            </div>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant='outlined' color='secondary' disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant='contained'
          color='error'
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <i className='tabler-trash' />}
        >
          {isLoading ? 'Eliminando...' : 'Eliminar Viaje'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteTravelDialog
