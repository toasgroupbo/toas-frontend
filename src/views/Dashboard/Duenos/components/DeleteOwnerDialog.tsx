'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

import type { Owner } from '@/types/api/owners'
import { BANCOS_OPTIONS } from '@/types/api/company'

interface DeleteOwnerDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  owner: Owner | null
  isLoading?: boolean
}

const DeleteOwnerDialog = ({ open, onClose, onConfirm, owner, isLoading }: DeleteOwnerDialogProps) => {
  if (!owner) return null

  const banco = owner.bankAccount ? BANCOS_OPTIONS.find(b => b.value === owner.bankAccount.bankCode) : null

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth='sm' fullWidth>
      <DialogTitle>¿Deshabilitar dueño?</DialogTitle>

      <DialogContent>
        <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
          Estás a punto de deshabilitar al dueño <strong>&quot;{owner.name}&quot;</strong>.
        </Typography>

        <Box
          sx={{
            bgcolor: 'warning.lighter',
            border: '1px solid',
            borderColor: 'warning.main',
            borderRadius: 1,
            p: 2,
            mb: 3
          }}
        >
          <Typography variant='body2' color='warning.main' sx={{ fontWeight: 600 }}>
            El dueño quedará inactivo
          </Typography>
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
            El dueño no podrá operar hasta que sea habilitado nuevamente.
          </Typography>
        </Box>

        <Typography variant='body2' color='text.secondary'>
          CI: {owner.ci || '-'}
          <br />
          Teléfono: {owner.phone || '-'}
          {owner.bankAccount && (
            <>
              <br />
              Banco: {banco?.label || owner.bankAccount.bankCode}
            </>
          )}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={isLoading} color='secondary'>
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          color='warning'
          variant='contained'
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <i className='tabler-ban' />}
        >
          {isLoading ? 'Deshabilitando...' : 'Deshabilitar Dueño'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteOwnerDialog
