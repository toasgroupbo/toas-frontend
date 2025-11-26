'use client'

import { useEffect } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import InputAdornment from '@mui/material/InputAdornment'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import CustomTextField from '@core/components/mui/TextField'
import type { User } from '@/types/api/users'

// Schema sin el campo rol
const editCompanyAdminSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email es requerido'),
  fullName: z.string().min(1, 'Nombre completo es requerido'),
  ci: z.string().min(1, 'CI es requerido'),
  phone: z.string().min(1, 'Teléfono es requerido')
})

type EditCompanyAdminFormData = z.infer<typeof editCompanyAdminSchema>

interface EditCompanyAdminDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: EditCompanyAdminFormData) => void | Promise<void>
  isLoading?: boolean
  user?: User | null
}

const EditCompanyAdminDialog = ({ open, onClose, onSubmit, isLoading, user }: EditCompanyAdminDialogProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<EditCompanyAdminFormData>({
    resolver: zodResolver(editCompanyAdminSchema),
    defaultValues: {
      email: '',
      fullName: '',
      ci: '',
      phone: ''
    }
  })

  useEffect(() => {
    if (open && user) {
      reset({
        email: user.email,
        fullName: user.fullName,
        ci: user.ci,
        phone: user.phone || ''
      })
    }
  }, [open, user, reset])

  const handleFormSubmit = (data: EditCompanyAdminFormData) => {
    onSubmit(data)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Box>
            <Typography variant='h5'>Editar Admin de Empresa</Typography>
            <Typography variant='body2' color='text.secondary'>
              Actualice la información del administrador de empresa
            </Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={isLoading}>
            <i className='tabler-x' />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid size={12}>
              <CustomTextField
                fullWidth
                label='Nombre Completo *'
                placeholder='Juan Pérez'
                {...register('fullName')}
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-user' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid size={12}>
              <CustomTextField
                fullWidth
                label='Email *'
                type='email'
                placeholder='usuario@gmail.com'
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-mail' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='CI *'
                placeholder='11726358'
                {...register('ci')}
                error={!!errors.ci}
                helperText={errors.ci?.message}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-id' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Teléfono *'
                placeholder='76565243'
                {...register('phone')}
                error={!!errors.phone}
                helperText={errors.phone?.message}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-phone' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} disabled={isLoading} color='secondary'>
            Cancelar
          </Button>
          <Button
            type='submit'
            variant='contained'
            disabled={isLoading}
            startIcon={isLoading ? <i className='tabler-loader' /> : <i className='tabler-check' />}
          >
            {isLoading ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default EditCompanyAdminDialog
