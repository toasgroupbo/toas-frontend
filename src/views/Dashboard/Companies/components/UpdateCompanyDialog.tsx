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
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import CustomTextField from '@core/components/mui/TextField'
import type { UpdateCompanyDto, Company } from '@/types/api/company'
import { BANCOS_BOLIVIA, TIPOS_CUENTA } from '@/types/api/company'
import { useUploadImage } from '@/hooks/useUploadImage'
import { updateCompanySchema, type UpdateCompanyFormData } from '@/schemas/companySchemas'

interface UpdateCompanyDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (id: string, data: UpdateCompanyDto) => void
  isLoading?: boolean
  company: Company | null
}

const UpdateCompanyDialog = ({ open, onClose, onSubmit, isLoading, company }: UpdateCompanyDialogProps) => {
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const uploadImageMutation = useUploadImage()

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors }
  } = useForm<UpdateCompanyFormData>({
    resolver: zodResolver(updateCompanySchema),
    defaultValues: {
      name: '',
      logo: '',
      commission: 10,
      hours_before_closing: 3,
      bankAccount: {
        bank: '',
        typeAccount: 'caja_ahorro',
        account: ''
      }
    }
  })

  useEffect(() => {
    if (open && company) {
      reset({
        name: company.name,
        logo: company.logo,
        commission: company.commission,
        hours_before_closing: company.hours_before_closing,
        bankAccount: {
          bank: company.bankAccount.bank,
          typeAccount: company.bankAccount.typeAccount,
          account: company.bankAccount.account
        }
      })

      // Construir URL completa del logo
      const logoUrl = company.logo.startsWith('http')
        ? company.logo
        : `${process.env.NEXT_PUBLIC_API_URL}${company.logo}`

      setLogoPreview(logoUrl)
      setLogoFile(null)
    }
  }, [open, company, reset])

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

  const handleFormSubmit = async (data: UpdateCompanyFormData) => {
    if (!company) return

    try {
      let logoUrl = data.logo || ''

      if (logoFile) {
        logoUrl = await uploadImageMutation.mutateAsync(logoFile)
      }

      const formattedData: UpdateCompanyDto = {
        name: data.name,
        logo: logoUrl,
        commission: data.commission,
        hours_before_closing: data.hours_before_closing,
        bankAccount: {
          bank: data.bankAccount.bank,
          typeAccount: data.bankAccount.typeAccount,
          account: data.bankAccount.account
        }
      }

      onSubmit(company.id, formattedData)
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
            <Typography variant='h5'>Editar Empresa</Typography>
            <Typography variant='body2' color='text.secondary'>
              Actualice la información de la empresa
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
                      Haga clic para cambiar el logo
                    </Typography>
                  </>
                )}
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleLogoChange}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
              </Box>
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
                    type='number'
                    label='Comisión (%) *'
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
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
                    <MenuItem value=''>Seleccione un banco</MenuItem>
                    {BANCOS_BOLIVIA.map(banco => (
                      <MenuItem key={banco} value={banco}>
                        {banco}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

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
            {uploadImageMutation.isPending
              ? 'Subiendo imagen...'
              : isLoading
                ? 'Actualizando...'
                : 'Actualizar Empresa'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default UpdateCompanyDialog
