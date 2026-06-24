'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
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
      <DialogTitle>¿Deshabilitar cajero?</DialogTitle>

      <DialogContent>
        <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
          Estás a punto de deshabilitar al cajero <strong>&quot;{cashier?.fullName}&quot;</strong>.
        </Typography>

        <Box
          sx={{
            bgcolor: 'warning.lighter',
            border: '1px solid',
            borderColor: 'warning.main',
            borderRadius: 1,
            p: 2
          }}
        >
          <Typography variant='body2' color='warning.main' sx={{ fontWeight: 600 }}>
            El cajero quedará inactivo
          </Typography>
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
            El cajero no podrá operar hasta que sea habilitado nuevamente.
          </Typography>
        </Box>

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
                  {cashier.fullName?.charAt(0).toUpperCase() || '?'}
                </Box>
                <div>
                  <Typography variant='subtitle1' fontWeight='bold'>
                    {cashier.fullName || '-'}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {cashier.email || '-'}
                  </Typography>
                </div>
              </div>
              <div className='flex items-center gap-1 mt-1'>
                <i className='tabler-id' style={{ fontSize: '16px', color: 'var(--mui-palette-text-secondary)' }} />
                <Typography variant='body2' color='text.secondary'>
                  CI: {cashier.ci || '-'}
                </Typography>
              </div>
              <div className='flex items-center gap-1'>
                <i className='tabler-phone' style={{ fontSize: '16px', color: 'var(--mui-palette-text-secondary)' }} />
                <Typography variant='body2' color='text.secondary'>
                  {cashier.phone || '-'}
                </Typography>
              </div>
              {cashier.office && (
                <div className='flex items-center gap-1'>
                  <i
                    className='tabler-building'
                    style={{ fontSize: '16px', color: 'var(--mui-palette-text-secondary)' }}
                  />
                  <Typography variant='body2' color='text.secondary'>
                    {cashier.office.name}
                    {cashier.office.place && ` - ${cashier.office.place.name}`}
                  </Typography>
                </div>
              )}
            </div>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={isLoading} color='secondary'>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          color='warning'
          variant='contained'
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <i className='tabler-ban' />}
        >
          {isLoading ? 'Deshabilitando...' : 'Deshabilitar Cajero'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteCashierDialog
