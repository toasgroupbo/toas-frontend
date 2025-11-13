'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'

import type { User } from '@/types/api/users'

interface DeleteUserDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
  user: User | null
}

const DeleteUserDialog = ({ open, onClose, onConfirm, isLoading, user }: DeleteUserDialogProps) => {
  if (!user) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' gap={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: 'error.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            <i className='tabler-trash' style={{ fontSize: '24px' }} />
          </Box>
          <Box>
            <Typography variant='h5'>Eliminar Usuario</Typography>
            <Typography variant='body2' color='text.secondary'>
              Esta acción no se puede deshacer
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity='warning' sx={{ mb: 2 }}>
          <Typography variant='body2'>
            ¿Está seguro que desea eliminar al usuario <strong>{user.fullName}</strong>?
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant='body2' color='text.secondary'>
            <strong>Email:</strong> {user.email}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            <strong>CI:</strong> {user.ci}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            <strong>Rol:</strong> {user.rol?.name || 'Sin rol'}
          </Typography>
          {user.company && (
            <Typography variant='body2' color='text.secondary'>
              <strong>Empresa:</strong> {user.company.name}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={isLoading} color='secondary'>
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant='contained'
          color='error'
          disabled={isLoading}
          startIcon={isLoading ? <i className='tabler-loader' /> : <i className='tabler-trash' />}
        >
          {isLoading ? 'Eliminando...' : 'Eliminar Usuario'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteUserDialog
