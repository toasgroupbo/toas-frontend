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

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import MenuItem from '@mui/material/MenuItem'

import CustomTextField from '@core/components/mui/TextField'
import { useUploadImage } from '@/hooks/useUploadImage'
import { updateCompanySchema, type UpdateCompanyFormData } from '@/schemas/companySchemas'

import { BANCOS_BOLIVIA, TIPOS_CUENTA, type Company } from '@/types/api/company'

interface UpdateCompanyDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (companyId: string, bankAccountId: string, companyData: any, bankAccountData: any) => void
  isLoading?: boolean
  company: Company | null
}

const UpdateCompanyDialog = ({ open, onClose, onSubmit, isLoading, company }: UpdateCompanyDialogProps) => {
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)

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

      const logoUrl = company.logo.startsWith('http')
        ? company.logo
        : `${process.env.NEXT_PUBLIC_API_URL}${company.logo}`

      setLogoPreview(logoUrl)
      setLogoFile(null)

      setUploadError('')
    }
  }, [open, company, reset])

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Por favor seleccione una imagen válida')

        return
      }

      if (file.size > 5 * 1024 * 1024) {
        setUploadError('La imagen no debe superar los 5MB')

        return
      }

      setLogoFile(file)
      setUploadError('')

      const reader = new FileReader()

      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }

      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    if (company) {
      const logoUrl = company.logo.startsWith('http')
        ? company.logo
        : `${process.env.NEXT_PUBLIC_API_URL}${company.logo}`

      setLogoPreview(logoUrl)
      setLogoFile(null)
      setValue('logo', company.logo)
    } else {
      setLogoPreview('')
      setLogoFile(null)
      setValue('logo', '')
    }

    setUploadError('')
  }

  const handleFormSubmit = async (data: UpdateCompanyFormData) => {
    if (!company) {
      setUploadError('Error: No se encontró la información de la empresa')
      console.error('❌ Company is null or undefined')

      return
    }

    if (!company.id) {
      setUploadError('Error: ID de empresa no disponible')
      console.error('❌ Company ID is missing:', company)

      return
    }

    if (!company.bankAccount?.id) {
      setUploadError('Error: ID de cuenta bancaria no disponible')
      console.error('❌ Bank account ID is missing:', company.bankAccount)

      return
    }

    try {
      setIsUploading(true)
      setUploadError('')

      let logoUrl = data.logo || company.logo

      if (logoFile) {
        try {
          logoUrl = await uploadImageMutation.mutateAsync(logoFile)
        } catch (error) {
          console.error('❌ Error al subir imagen:', error)
          setUploadError('Error al subir la imagen. Por favor, intente nuevamente.')
          setIsUploading(false)

          return
        }
      }

      const companyData = {
        name: data.name,
        logo: logoUrl,
        commission: data.commission,
        hours_before_closing: data.hours_before_closing
      }

      const bankAccountData = {
        bank: data.bankAccount.bank,
        typeAccount: data.bankAccount.typeAccount,
        account: data.bankAccount.account
      }

      await onSubmit(company.id, company.bankAccount.id, companyData, bankAccountData)

      setIsUploading(false)
    } catch (error) {
      console.error('❌ Error en handleFormSubmit:', error)
      setUploadError('Error al actualizar la empresa. Por favor, intente nuevamente.')
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading && !isUploading) {
      reset()
      setLogoPreview('')
      setLogoFile(null)
      setUploadError('')
      onClose()
    }
  }

  const isProcessing = isLoading || isUploading

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
          <IconButton onClick={handleClose} disabled={isProcessing}>
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
                  borderColor: errors.logo || uploadError ? 'error.main' : 'divider',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  position: 'relative',
                  minHeight: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: logoPreview ? 'background.paper' : 'action.hover'
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
                        maxHeight: 150,
                        objectFit: 'contain',
                        mb: 1
                      }}
                    />
                    <Typography variant='caption' color='text.secondary' sx={{ mb: 1 }}>
                      {logoFile ? 'Nueva imagen seleccionada' : 'Imagen actual'}
                    </Typography>
                    <IconButton
                      size='small'
                      onClick={handleRemoveLogo}
                      sx={{
                        bgcolor: logoFile ? 'warning.main' : 'action.selected',
                        color: 'white',
                        '&:hover': { bgcolor: logoFile ? 'warning.dark' : 'action.hover' }
                      }}
                      title={logoFile ? 'Cancelar cambio' : 'Restaurar original'}
                    >
                      <i className='tabler-x' style={{ fontSize: '16px' }} />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <i
                      className='tabler-upload'
                      style={{ fontSize: '48px', color: 'var(--mui-palette-text-disabled)' }}
                    />
                    <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                      Haga clic o arrastre una imagen aquí
                    </Typography>
                    <Typography variant='caption' color='text.disabled' sx={{ mt: 0.5 }}>
                      PNG, JPG, GIF hasta 5MB
                    </Typography>
                  </>
                )}
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleLogoChange}
                  disabled={isProcessing}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: isProcessing ? 'not-allowed' : 'pointer'
                  }}
                />
              </Box>
              {uploadError && (
                <Typography variant='caption' color='error' sx={{ mt: 1, display: 'block' }}>
                  {uploadError}
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
                disabled={isProcessing}
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
                    disabled={isProcessing}
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
                    disabled={isProcessing}
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
                    disabled={isProcessing}
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
                    disabled={isProcessing}
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
                disabled={isProcessing}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-credit-card' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} disabled={isLoading || uploadImageMutation.isPending} color='secondary'>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit(handleFormSubmit)}
            variant='contained'
            disabled={isProcessing}
            startIcon={
              isUploading ? (
                <i className='tabler-loader' />
              ) : isLoading ? (
                <i className='tabler-loader' />
              ) : (
                <i className='tabler-check' />
              )
            }
          >
            {isUploading ? 'Subiendo imagen...' : isLoading ? 'Actualizando...' : 'Actualizar Empresa'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default UpdateCompanyDialog
