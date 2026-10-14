'use client'

import { useState } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'

import CustomTextField from '@core/components/mui/TextField'

interface PasswordConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (password: string) => void | Promise<void>
  title?: string
  description?: string
  isLoading?: boolean
  error?: string | null
}

const PasswordConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar acción',
  description = 'Ingresa tu contraseña para confirmar los cambios.',
  isLoading,
  error
}: PasswordConfirmDialogProps) => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleClose = () => {
    setPassword('')
    setShowPassword(false)
    onClose()
  }

  const handleConfirm = async () => {
    if (!password.trim()) return
    await onConfirm(password)
    setPassword('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && password.trim()) {
      handleConfirm()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='xs' fullWidth>
      <DialogTitle>
        <Typography variant='h6'>{title}</Typography>
      </DialogTitle>

      <DialogContent>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          {description}
        </Typography>

        <CustomTextField
          fullWidth
          type={showPassword ? 'text' : 'password'}
          label='Tu contraseña'
          placeholder='••••••••'
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          error={!!error}
          helperText={error}
          disabled={isLoading}
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <i className='tabler-lock' />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton onClick={() => setShowPassword(!showPassword)} edge='end'>
                  <i className={showPassword ? 'tabler-eye-off' : 'tabler-eye'} />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} disabled={isLoading} color='secondary'>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant='contained'
          disabled={isLoading || !password.trim()}
          startIcon={isLoading ? <i className='tabler-loader' /> : <i className='tabler-check' />}
        >
          {isLoading ? 'Confirmando...' : 'Confirmar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PasswordConfirmDialog
