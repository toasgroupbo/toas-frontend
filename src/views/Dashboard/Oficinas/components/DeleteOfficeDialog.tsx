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

import type { Office } from '@/types/api/offices'

interface DeleteOfficeDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  office: Office | null
  isLoading?: boolean
}

const DeleteOfficeDialog = ({ open, onClose, onConfirm, office, isLoading = false }: DeleteOfficeDialogProps) => {
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
          ¿Estás seguro que deseas eliminar la siguiente oficina?
        </Typography>

        {office && (
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
            <div className='flex items-start gap-3'>
              <i className='tabler-building' style={{ fontSize: '24px', color: 'var(--mui-palette-primary-main)' }} />
              <div>
                <Typography variant='subtitle1' fontWeight='bold'>
                  {office.name}
                </Typography>
                <div className='flex items-center gap-1 mt-1'>
                  <i
                    className='tabler-map-pin'
                    style={{ fontSize: '16px', color: 'var(--mui-palette-text-secondary)' }}
                  />
                  <Typography variant='body2' color='text.secondary'>
                    {office.place}
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
          {isLoading ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteOfficeDialog
