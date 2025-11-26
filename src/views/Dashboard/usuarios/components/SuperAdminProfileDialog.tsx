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
import InputAdornment from '@mui/material/InputAdornment'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import CustomTextField from '@core/components/mui/TextField'
import type { UpdateUserDto } from '@/types/api/users'
import type { User } from '@/types/api/auth'

// Schemas
const updateProfileSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email es requerido'),
  fullName: z.string().min(1, 'Nombre completo es requerido'),
  ci: z.string().min(1, 'CI es requerido'),
  phone: z.string().min(1, 'Teléfono es requerido')
})

const changePasswordSchema = z
  .object({
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword']
  })

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

interface SuperAdminProfileDialogProps {
  open: boolean
  onClose: () => void
  user: User | null
  onUpdateProfile: (data: UpdateUserDto) => void | Promise<void>
  onChangePassword: (password: string) => void | Promise<void>
  isLoading?: boolean
}

const SuperAdminProfileDialog = ({
  open,
  onClose,
  user,
  onUpdateProfile,
  onChangePassword,
  isLoading
}: SuperAdminProfileDialogProps) => {
  const [activeTab, setActiveTab] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Form para perfil
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: errorsProfile }
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      email: '',
      fullName: '',
      ci: '',
      phone: ''
    }
  })

  // Form para contraseña
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: errorsPassword }
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  })

  useEffect(() => {
    if (open && user) {
      resetProfile({
        email: user.email,
        fullName: user.fullName,
        ci: user.ci,
        phone: user.phone || ''
      })
      resetPassword()
      setActiveTab(0)
    }
  }, [open, user, resetProfile, resetPassword])

  const handleProfileSubmit = (data: UpdateProfileFormData) => {
    const userRole = user?.rol?.name

    const shouldExcludeRole = userRole === 'SUPER_ADMIN' || userRole === 'COMPANY_ADMIN'

    const updateData: UpdateUserDto = {
      ...data,
      ...(shouldExcludeRole ? {} : { rol: user?.rol?.id })
    }

    onUpdateProfile(updateData)
  }

  const handlePasswordSubmit = (data: ChangePasswordFormData) => {
    onChangePassword(data.password)
  }

  const handleClose = () => {
    resetProfile()
    resetPassword()
    setActiveTab(0)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Box>
            <Typography variant='h5'>Mi Perfil</Typography>
            <Typography variant='body2' color='text.secondary'>
              Gestiona tu información personal
            </Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={isLoading}>
            <i className='tabler-x' />
          </IconButton>
        </Box>
      </DialogTitle>

      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
      >
        <Tab
          label='Editar Perfil'
          icon={<i className='tabler-user-edit' />}
          iconPosition='start'
          sx={{ textTransform: 'none' }}
        />
        <Tab
          label='Cambiar Contraseña'
          icon={<i className='tabler-key' />}
          iconPosition='start'
          sx={{ textTransform: 'none' }}
        />
      </Tabs>

      {/* Tab 1: Editar Perfil */}
      {activeTab === 0 && (
        <form onSubmit={handleSubmitProfile(handleProfileSubmit)}>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid size={12}>
                <CustomTextField
                  fullWidth
                  label='Nombre Completo *'
                  placeholder='Juan Pérez'
                  {...registerProfile('fullName')}
                  error={!!errorsProfile.fullName}
                  helperText={errorsProfile.fullName?.message}
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
                  {...registerProfile('email')}
                  error={!!errorsProfile.email}
                  helperText={errorsProfile.email?.message}
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
                  {...registerProfile('ci')}
                  error={!!errorsProfile.ci}
                  helperText={errorsProfile.ci?.message}
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
                  {...registerProfile('phone')}
                  error={!!errorsProfile.phone}
                  helperText={errorsProfile.phone?.message}
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
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogActions>
        </form>
      )}

      {/* Tab 2: Cambiar Contraseña */}
      {activeTab === 1 && (
        <form onSubmit={handleSubmitPassword(handlePasswordSubmit)}>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid size={12}>
                <CustomTextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  label='Nueva Contraseña *'
                  placeholder='••••••••'
                  {...registerPassword('password')}
                  error={!!errorsPassword.password}
                  helperText={errorsPassword.password?.message}
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

              <Grid size={12}>
                <CustomTextField
                  fullWidth
                  type={showConfirmPassword ? 'text' : 'password'}
                  label='Confirmar Contraseña *'
                  placeholder='••••••••'
                  {...registerPassword('confirmPassword')}
                  error={!!errorsPassword.confirmPassword}
                  helperText={errorsPassword.confirmPassword?.message}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='tabler-lock-check' />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge='end'>
                          <i className={showConfirmPassword ? 'tabler-eye-off' : 'tabler-eye'} />
                        </IconButton>
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
              startIcon={isLoading ? <i className='tabler-loader' /> : <i className='tabler-key' />}
            >
              {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  )
}

export default SuperAdminProfileDialog
