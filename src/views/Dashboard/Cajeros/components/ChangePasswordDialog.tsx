'use client'

import { useEffect } from 'react'

import { useForm, Controller } from 'react-hook-form'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'

import CustomTextField from '@core/components/mui/TextField'

interface ChangePasswordDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (password: string) => Promise<void>
  userName?: string
  isLoading?: boolean
}

interface FormData {
  password: string
  confirmPassword: string
}

const ChangePasswordDialog = ({ open, onClose, onSubmit, userName, isLoading = false }: ChangePasswordDialogProps) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  })

  const password = watch('password')

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit(data.password)
  }

  const handleClose = () => {
    if (!isLoading) {
      reset()
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className='flex items-center gap-2'>
          <i className='tabler-key' style={{ fontSize: '24px' }} />
          <span>Cambiar Contraseña</span>
        </div>
        <IconButton onClick={handleClose} disabled={isLoading}>
          <i className='tabler-x' />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Alert severity='info' sx={{ mb: 3 }}>
            Cambiando contraseña para: <strong>{userName}</strong>
          </Alert>

          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Controller
                name='password'
                control={control}
                rules={{
                  required: 'La contraseña es requerida',
                  minLength: {
                    value: 6,
                    message: 'La contraseña debe tener al menos 6 caracteres'
                  }
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='password'
                    label='Nueva Contraseña'
                    placeholder='Mínimo 6 caracteres'
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-lock' />
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='confirmPassword'
                control={control}
                rules={{
                  required: 'Confirme la contraseña',
                  validate: value => value === password || 'Las contraseñas no coinciden'
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='password'
                    label='Confirmar Contraseña'
                    placeholder='Repita la contraseña'
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-lock-check' />
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} variant='outlined' color='secondary' disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            type='submit'
            variant='contained'
            color='warning'
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <i className='tabler-key' />}
          >
            {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ChangePasswordDialog
