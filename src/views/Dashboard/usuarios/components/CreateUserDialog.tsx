'use client'

import { useState, useEffect } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import CustomTextField from '@core/components/mui/TextField'
import type { CreateUserDto } from '@/types/api/users'
import { useRoles } from '@/hooks/useRoles'

const getRoleDisplayName = (roleName: string): string => {
  const roleNames: Record<string, string> = {
    SUPER_ADMIN: 'Super Administrador',
    COMPANY_ADMIN: 'Administrador de Empresa',
    OFFICE_ADMIN: 'Administrador de Oficina',
    CASHIER: 'Cajero',
    CUSTOMER: 'Cliente'
  }

  return roleNames[roleName] || roleName
}

const createUserSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  fullName: z.string().min(1, 'Nombre completo es requerido'),
  ci: z.string().min(1, 'CI es requerido'),
  phone: z.string().min(1, 'Teléfono es requerido'),
  rol: z.number().min(1, 'Debe seleccionar un rol')
})

type CreateUserFormData = z.infer<typeof createUserSchema>

interface CreateUserDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateUserDto) => void
  isLoading?: boolean
}

const CreateUserDialog = ({ open, onClose, onSubmit, isLoading }: CreateUserDialogProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const { data: roles, isLoading: rolesLoading } = useRoles()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      ci: '',
      phone: '',
      rol: 0
    }
  })

  useEffect(() => {
    if (open) {
      reset()
    }
  }, [open, reset])

  const handleFormSubmit = (data: CreateUserFormData) => {
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
            <Typography variant='h5'>Crear Nuevo Usuario</Typography>
            <Typography variant='body2' color='text.secondary'>
              Complete la información del usuario administrador
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
            {/* Nombre Completo */}
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

            {/* Email */}
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

            {/* Contraseña */}
            <Grid size={12}>
              <CustomTextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                label='Contraseña *'
                placeholder='••••••••'
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={isLoading}
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
            </Grid>

            {/* CI */}
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

            {/* Teléfono */}
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

            {/* Rol */}
            <Grid size={12}>
              <Controller
                name='rol'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label='Rol *'
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                    error={!!errors.rol}
                    helperText={errors.rol?.message}
                    disabled={isLoading || rolesLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-shield' />
                        </InputAdornment>
                      ),
                      endAdornment: rolesLoading ? (
                        <InputAdornment position='end'>
                          <CircularProgress size={20} />
                        </InputAdornment>
                      ) : null
                    }}
                  >
                    <MenuItem value={0}>Seleccione un rol</MenuItem>
                    {roles?.map(role => (
                      <MenuItem key={role.id} value={role.id}>
                        {getRoleDisplayName(role.name)}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
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
            disabled={isLoading || rolesLoading}
            startIcon={isLoading ? <i className='tabler-loader' /> : <i className='tabler-check' />}
          >
            {isLoading ? 'Creando...' : 'Crear Usuario'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default CreateUserDialog
