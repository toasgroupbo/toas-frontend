'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'

import type { Role } from '@/types/api/roles'

interface DeleteRoleDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  role: Role | null
  isLoading?: boolean
}

const DeleteRoleDialog = ({ open, onClose, onConfirm, role, isLoading }: DeleteRoleDialogProps) => {
  if (!role) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' gap={2}>
          <i className='tabler-alert-triangle' style={{ fontSize: '1.5rem', color: 'var(--mui-palette-error-main)' }} />
          <Typography variant='h5'>Eliminar Rol</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box display='flex' flexDirection='column' gap={2}>
          <Typography variant='body1'>
            ¿Estás seguro de que deseas eliminar el rol <strong>{role.name}</strong>?
          </Typography>

          <Alert severity='warning'>
            Esta acción no se puede deshacer. Todos los usuarios con este rol perderán sus permisos.
          </Alert>

          <Box>
            <Typography variant='body2' color='text.secondary'>
              Recursos afectados: <strong>{role.permissions.length}</strong>
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Permisos totales: <strong>{role.permissions.reduce((acc, p) => acc + p.permissions.length, 0)}</strong>
            </Typography>
          </Box>
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
          startIcon={<i className='tabler-trash' />}
        >
          {isLoading ? 'Eliminando...' : 'Eliminar Rol'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteRoleDialog
