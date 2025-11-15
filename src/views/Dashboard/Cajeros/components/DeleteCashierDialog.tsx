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

import type { Cashier } from '@/types/api/cashiers'

interface DeleteCashierDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  cashier: Cashier | null
  isLoading?: boolean
}

const DeleteCashierDialog = ({ open, onClose, onConfirm, cashier, isLoading = false }: DeleteCashierDialogProps) => {
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
          ¿Estás seguro que deseas eliminar el siguiente cajero?
        </Typography>

        {cashier && (
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
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  {cashier.fullName.charAt(0).toUpperCase()}
                </Box>
                <div>
                  <Typography variant='subtitle1' fontWeight='bold'>
                    {cashier.fullName}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {cashier.email}
                  </Typography>
                </div>
              </div>
              <div className='flex items-center gap-1 mt-1'>
                <i className='tabler-id' style={{ fontSize: '16px', color: 'var(--mui-palette-text-secondary)' }} />
                <Typography variant='body2' color='text.secondary'>
                  CI: {cashier.ci}
                </Typography>
              </div>
              <div className='flex items-center gap-1'>
                <i className='tabler-phone' style={{ fontSize: '16px', color: 'var(--mui-palette-text-secondary)' }} />
                <Typography variant='body2' color='text.secondary'>
                  {cashier.phone}
                </Typography>
              </div>
              {cashier.office && (
                <div className='flex items-center gap-1'>
                  <i
                    className='tabler-building'
                    style={{ fontSize: '16px', color: 'var(--mui-palette-text-secondary)' }}
                  />
                  <Typography variant='body2' color='text.secondary'>
                    {cashier.office.name} - {cashier.office.place}
                  </Typography>
                </div>
              )}
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
          {isLoading ? 'Eliminando...' : 'Eliminar Cajero'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteCashierDialog
