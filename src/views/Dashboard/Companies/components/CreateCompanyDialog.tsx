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

import {
  BANCOS_OPTIONS,
  BRANCH_OFFICE_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
  DOCUMENT_EXTENSION_OPTIONS
} from '@/types/api/company'

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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
      commission_app: 10,
      commission_company: 1,
      hours_before_closing: 3,
      bankAccount: {
        bankCode: '',
        account: '',
        titularName: '',
        branchOfficeId: 201,
        documentNumber: '',
        documentType: '',
        documentExtension: ''
      },
      manager: {
        email: '',
        password: '',
        confirmPassword: '',
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

      const { manager, ...rest } = data
      const { confirmPassword, ...managerData } = manager

      const formattedData: CreateCompanyDto = {
        ...rest,
        logo: logoUrl,
        manager: managerData
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
              <Typography variant='subtitle2' sx={{ mb: 2, color: errors.logo ? 'error.main' : 'inherit' }}>
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
                    <Typography variant='caption' color='text.disabled' sx={{ mt: 0.5 }}>
                      JPG, JPEG, PNG, WEBP hasta 5MB
                    </Typography>
                  </>
                )}
                <input
                  type='file'
                  accept='image/png,image/jpeg,image/jpg,image/webp'
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

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='commission_app'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    type='text'
                    label='Comisión App (%) *'
                    {...field}
                    onChange={e => {
                      const value = e.target.value.replace(/[^0-9.]/g, '')

                      field.onChange(value === '' ? '' : Number(value))
                    }}
                    error={!!errors.commission_app}
                    helperText={errors.commission_app?.message}
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
                name='commission_company'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    type='text'
                    label='Comisión Empresa (Bs.) *'
                    {...field}
                    value={field.value ?? ''}
                    onChange={e => {
                      const value = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')

                      field.onChange(value === '' ? '' : value)
                    }}
                    onBlur={e => {
                      const value = e.target.value

                      field.onChange(value === '' ? 0 : Number(value))
                      field.onBlur()
                    }}
                    error={!!errors.commission_company}
                    helperText={errors.commission_company?.message}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-currency-dollar' />
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

            <Grid size={12}>
              <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
                Datos Bancarios
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='bankAccount.bankCode'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label='Banco *'
                    {...field}
                    error={!!errors.bankAccount?.bankCode}
                    helperText={errors.bankAccount?.bankCode?.message}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-building-bank' />
                        </InputAdornment>
                      )
                    }}
                  >
                    {BANCOS_OPTIONS.map(banco => (
                      <MenuItem key={banco.value} value={banco.value}>
                        {banco.label}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='bankAccount.branchOfficeId'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label='Sucursal *'
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                    error={!!errors.bankAccount?.branchOfficeId}
                    helperText={errors.bankAccount?.branchOfficeId?.message}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-building' />
                        </InputAdornment>
                      )
                    }}
                  >
                    {BRANCH_OFFICE_OPTIONS.map(office => (
                      <MenuItem key={office.value} value={office.value}>
                        {office.label}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
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

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Nombre del Titular *'
                placeholder='Juan Pérez'
                {...register('bankAccount.titularName')}
                error={!!errors.bankAccount?.titularName}
                helperText={errors.bankAccount?.titularName?.message}
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
              <Controller
                name='bankAccount.documentType'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label='Tipo de Documento *'
                    {...field}
                    error={!!errors.bankAccount?.documentType}
                    helperText={errors.bankAccount?.documentType?.message}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-file-text' />
                        </InputAdornment>
                      )
                    }}
                  >
                    {DOCUMENT_TYPE_OPTIONS.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Número de Documento *'
                placeholder='1234567890'
                {...register('bankAccount.documentNumber')}
                error={!!errors.bankAccount?.documentNumber}
                helperText={errors.bankAccount?.documentNumber?.message}
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
              <Controller
                name='bankAccount.documentExtension'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label='Extensión de Documento *'
                    {...field}
                    error={!!errors.bankAccount?.documentExtension}
                    helperText={errors.bankAccount?.documentExtension?.message}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-map-pin' />
                        </InputAdornment>
                      )
                    }}
                  >
                    {DOCUMENT_EXTENSION_OPTIONS.map(ext => (
                      <MenuItem key={ext.value} value={ext.value}>
                        {ext.label}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

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

            <Grid size={{ xs: 12, sm: 6 }}>
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

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                type={showConfirmPassword ? 'text' : 'password'}
                label='Confirmar Contraseña *'
                placeholder='••••••••'
                {...register('manager.confirmPassword')}
                error={!!errors.manager?.confirmPassword}
                helperText={errors.manager?.confirmPassword?.message}
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
