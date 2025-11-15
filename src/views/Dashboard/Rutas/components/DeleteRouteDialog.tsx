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

import type { Route } from '@/types/api/rutas'

interface DeleteRouteDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  route: Route | null
  isLoading?: boolean
}

const DeleteRouteDialog = ({ open, onClose, onConfirm, route, isLoading = false }: DeleteRouteDialogProps) => {
  const handleConfirm = async () => {
    await onConfirm()
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
          ¿Estás seguro que deseas eliminar la siguiente ruta?
        </Typography>

        {route && (
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
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  <i className='tabler-flag' style={{ fontSize: '18px' }} />
                </Box>
                <div>
                  <Typography variant='caption' color='text.secondary'>
                    Origen
                  </Typography>
                  <Typography variant='body2' fontWeight='medium'>
                    {route.officeOrigin.name}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {route.officeOrigin.place}
                  </Typography>
                </div>
              </div>

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <i
                  className='tabler-arrow-down'
                  style={{ fontSize: '24px', color: 'var(--mui-palette-text-secondary)' }}
                />
              </Box>

              {route.pass_by && route.pass_by.length > 0 && (
                <Box sx={{ pl: 2 }}>
                  <Typography variant='caption' color='text.secondary' gutterBottom>
                    Trayecto (pasa por):
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {route.pass_by.map((location, index) => (
                      <Chip
                        key={index}
                        label={location}
                        size='small'
                        variant='outlined'
                        color='info'
                        icon={<i className='tabler-map-pin' style={{ fontSize: '12px' }} />}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <div className='flex items-center gap-2'>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: 'error.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  <i className='tabler-flag-filled' style={{ fontSize: '18px' }} />
                </Box>
                <div>
                  <Typography variant='caption' color='text.secondary'>
                    Destino
                  </Typography>
                  <Typography variant='body2' fontWeight='medium'>
                    {route.officeDestination.name}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {route.officeDestination.place}
                  </Typography>
                </div>
              </div>
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
          {isLoading ? 'Eliminando...' : 'Eliminar Ruta'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteRouteDialog
