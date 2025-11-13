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
import Alert from '@mui/material/Alert'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { MenuItem } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
import type { CreateCompanyDto } from '@/types/api/company'

import { useUploadImage } from '@/hooks/useUploadImage'
import { createCompanySchema, type CreateCompanyFormData } from '@/schemas/companySchemas'

import { BANCOS_BOLIVIA, TIPOS_CUENTA } from '@/types/api/company'

interface CreateCompanyDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateCompanyDto) => void
  isLoading?: boolean
}

const CreateCompanyDialog = ({ open, onClose, onSubmit, isLoading }: CreateCompanyDialogProps) => {
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const uploadImageMutation = useUploadImage()

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors }
  } = useForm<CreateCompanyFormData>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: '',
      logo: '',
      commission: 10,
      hours_before_closing: 3,
      bankAccount: {
        bank: '',
        typeAccount: 'caja_ahorro',
        account: ''
      },
      manager: {
        email: '',
        password: '',
        fullName: '',
        ci: '',
        phone: ''
      }
    }
  })

  useEffect(() => {
    if (open) {
      reset()
      setLogoPreview('')
      setLogoFile(null)
    }
  }, [open, reset])

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      setLogoFile(file)
      const reader = new FileReader()

      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }

      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setLogoPreview('')
    setLogoFile(null)
    setValue('logo', '')
  }

  const handleFormSubmit = async (data: CreateCompanyFormData) => {
    try {
      let logoUrl = data.logo

      if (logoFile) {
        logoUrl = await uploadImageMutation.mutateAsync(logoFile)
      }

      const formattedData: CreateCompanyDto = {
        ...data,
        logo: logoUrl
      }

      onSubmit(formattedData)
    } catch (error) {
      console.error('Error al subir imagen:', error)
    }
  }

  const handleClose = () => {
    reset()
    setLogoPreview('')
    setLogoFile(null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Box>
            <Typography variant='h5'>Crear Nueva Empresa</Typography>
            <Typography variant='body2' color='text.secondary'>
              Complete la información de la empresa
            </Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={isLoading}>
            <i className='tabler-x' />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={4}>
            {/* Logo */}
            <Grid size={12}>
              <Typography variant='subtitle2' sx={{ mb: 2 }}>
                Logo de la Empresa
              </Typography>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: errors.logo ? 'error.main' : 'divider',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  position: 'relative',
                  minHeight: 150,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {logoPreview ? (
                  <>
                    <Box
                      component='img'
                      src={logoPreview}
                      alt='Logo preview'
                      sx={{
                        maxWidth: '100%',
                        maxHeight: 120,
                        objectFit: 'contain'
                      }}
                    />
                    <IconButton
                      size='small'
                      onClick={handleRemoveLogo}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'error.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'error.dark' }
                      }}
                    >
                      <i className='tabler-trash' style={{ fontSize: '16px' }} />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <i
                      className='tabler-upload'
                      style={{ fontSize: '48px', color: 'var(--mui-palette-text-disabled)' }}
                    />
                    <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                      Haga clic para seleccionar un logo
                    </Typography>
                  </>
                )}
                <input
                  type='file'
                  accept='image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml'
                  onChange={e => {
                    handleLogoChange(e)
                    setValue('logo', 'temp')
                  }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
              </Box>
              {errors.logo && (
                <Typography variant='caption' color='error' sx={{ mt: 1, display: 'block' }}>
                  {errors.logo.message}
                </Typography>
              )}
            </Grid>

            {/* Nombre */}
            <Grid size={12}>
              <CustomTextField
                fullWidth
                label='Nombre de la Empresa *'
                placeholder='Ej: TRANS SAIPINA'
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-building' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {/* Comisión y Horas */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='commission'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    type='text'
                    label='Comisión (%) *'
                    {...field}
                    onChange={e => {
                      const value = e.target.value.replace(/[^0-9.]/g, '')

                      field.onChange(value === '' ? '' : Number(value))
                    }}
                    error={!!errors.commission}
                    helperText={errors.commission?.message}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-percentage' />
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='hours_before_closing'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    type='number'
                    label='Horas antes de cancelar *'
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                    error={!!errors.hours_before_closing}
                    helperText={errors.hours_before_closing?.message}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-clock' />
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </Grid>
            {/* Datos Bancarios */}
            <Grid size={12}>
              <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
                Datos Bancarios
              </Typography>
            </Grid>

            {/* CAMBIAR A SELECT */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='bankAccount.bank'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label='Banco *'
                    {...field}
                    error={!!errors.bankAccount?.bank}
                    helperText={errors.bankAccount?.bank?.message}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-building-bank' />
                        </InputAdornment>
                      )
                    }}
                  >
                    {BANCOS_BOLIVIA.map(banco => (
                      <MenuItem key={banco} value={banco}>
                        {banco}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            {/* CAMBIAR A SELECT */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='bankAccount.typeAccount'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label='Tipo de Cuenta *'
                    {...field}
                    error={!!errors.bankAccount?.typeAccount}
                    helperText={errors.bankAccount?.typeAccount?.message}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-wallet' />
                        </InputAdornment>
                      )
                    }}
                  >
                    {TIPOS_CUENTA.map(tipo => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid size={12}>
              <CustomTextField
                fullWidth
                label='Número de Cuenta *'
                placeholder='1234567890'
                {...register('bankAccount.account')}
                error={!!errors.bankAccount?.account}
                helperText={errors.bankAccount?.account?.message}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-credit-card' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {/* Datos del Administrador */}
            <Grid size={12}>
              <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
                Datos del Administrador
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Nombre Completo *'
                placeholder='Juan Pérez'
                {...register('manager.fullName')}
                error={!!errors.manager?.fullName}
                helperText={errors.manager?.fullName?.message}
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

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='CI *'
                placeholder='1234567'
                {...register('manager.ci')}
                error={!!errors.manager?.ci}
                helperText={errors.manager?.ci?.message}
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
                label='Email *'
                type='email'
                placeholder='admin@empresa.com'
                {...register('manager.email')}
                error={!!errors.manager?.email}
                helperText={errors.manager?.email?.message}
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
                label='Teléfono *'
                placeholder='76565243'
                {...register('manager.phone')}
                error={!!errors.manager?.phone}
                helperText={errors.manager?.phone?.message}
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

            <Grid size={12}>
              <CustomTextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                label='Contraseña *'
                placeholder='••••••••'
                {...register('manager.password')}
                error={!!errors.manager?.password}
                helperText={errors.manager?.password?.message}
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

            {uploadImageMutation.isError && (
              <Grid size={12}>
                <Alert severity='error'>Error al subir la imagen. Por favor, intente nuevamente.</Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} disabled={isLoading || uploadImageMutation.isPending} color='secondary'>
            Cancelar
          </Button>
          <Button
            type='submit'
            variant='contained'
            disabled={isLoading || uploadImageMutation.isPending}
            startIcon={uploadImageMutation.isPending ? <i className='tabler-loader' /> : <i className='tabler-check' />}
          >
            {uploadImageMutation.isPending ? 'Subiendo imagen...' : isLoading ? 'Creando...' : 'Crear Empresa'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default CreateCompanyDialog
