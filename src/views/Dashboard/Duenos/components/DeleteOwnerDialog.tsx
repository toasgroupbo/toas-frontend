'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'

import type { Owner } from '@/types/api/owners'

interface DeleteOwnerDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  owner: Owner | null
  isLoading?: boolean
}

const DeleteOwnerDialog = ({ open, onClose, onConfirm, owner, isLoading }: DeleteOwnerDialogProps) => {
  if (!owner) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <div className='flex items-center justify-between'>
          <Typography variant='h5'>Eliminar Dueño</Typography>
          <IconButton onClick={onClose} size='small' disabled={isLoading}>
            <i className='tabler-x' />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent>
        <Alert severity='warning' sx={{ mb: 3 }}>
          Esta acción no se puede deshacer. El dueño será eliminado permanentemente del sistema.
        </Alert>

        <Typography variant='body1' sx={{ mb: 2 }}>
          ¿Estás seguro de que deseas eliminar al dueño <strong>{owner.name}</strong>?
        </Typography>

        <Typography variant='body2' color='text.secondary'>
          CI: {owner.ci}
          <br />
          Teléfono: {owner.phone}
          <br />
          Banco: {owner.bankAccount.bank}
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant='outlined' color='secondary' disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} variant='contained' color='error' disabled={isLoading}>
          {isLoading ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteOwnerDialog
