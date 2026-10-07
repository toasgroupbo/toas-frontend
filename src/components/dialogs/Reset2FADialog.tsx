'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

interface Reset2FADialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
  userName: string | null
  userEmail?: string | null
}

const Reset2FADialog = ({ open, onClose, onConfirm, isLoading, userName, userEmail }: Reset2FADialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' gap={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: 'warning.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            <i className='tabler-shield-off' style={{ fontSize: '24px' }} />
          </Box>
          <Box>
            <Typography variant='h5'>Restablecer verificación en dos pasos</Typography>
            <Typography variant='body2' color='text.secondary'>
              El usuario podrá entrar solo con su contraseña
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity='warning' sx={{ mb: 2 }}>
          <Typography variant='body2'>
            ¿Está seguro que desea desactivar la verificación en dos pasos de <strong>{userName}</strong>?
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {userEmail && (
            <Typography variant='body2' color='text.secondary'>
              <strong>Email:</strong> {userEmail}
            </Typography>
          )}
          <Typography variant='body2' color='text.secondary'>
            El usuario podrá volver a activar la verificación en dos pasos desde su perfil cuando lo desee.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={isLoading} color='secondary'>
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant='contained'
          color='warning'
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <i className='tabler-shield-off' />}
        >
          {isLoading ? 'Restableciendo...' : 'Restablecer 2FA'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default Reset2FADialog
