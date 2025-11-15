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

import type { Bus } from '@/types/api/buses'

interface DeleteBusDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  bus: Bus | null
  isLoading?: boolean
}

const DeleteBusDialog = ({ open, onClose, onConfirm, bus, isLoading = false }: DeleteBusDialogProps) => {
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
          ¿Estás seguro que deseas eliminar el siguiente bus?
        </Typography>

        {bus && (
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
            <div className='flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <i className='tabler-bus' style={{ fontSize: '24px', color: 'var(--mui-palette-primary-main)' }} />
                <Typography variant='subtitle1' fontWeight='bold'>
                  {bus.name}
                </Typography>
              </div>
              <Chip label={bus.plaque} color='primary' variant='tonal' size='small' sx={{ width: 'fit-content' }} />
              <div className='flex items-center gap-1 mt-1'>
                <i className='tabler-user' style={{ fontSize: '16px', color: 'var(--mui-palette-text-secondary)' }} />
                <Typography variant='body2' color='text.secondary'>
                  Propietario: {bus.owner.name}
                </Typography>
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
          {isLoading ? 'Eliminando...' : 'Eliminar Bus'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteBusDialog
