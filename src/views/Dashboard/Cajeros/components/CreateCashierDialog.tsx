'use client'

import { useEffect, useState } from 'react'

import { useForm, Controller } from 'react-hook-form'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'

import CustomTextField from '@core/components/mui/TextField'
import type { Cashier, CreateCashierDto, UpdateCashierDto } from '@/types/api/cashiers'
import { useOffices } from '@/hooks/useOffices'

interface CreateCashierDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateCashierDto | UpdateCashierDto, officeId: number) => Promise<void>
  cashier?: Cashier | null
  mode: 'create' | 'edit'
  isLoading?: boolean
}

interface FormData {
  email: string
  password?: string
  confirmPassword?: string
  fullName: string
  ci: string
  phone: string
  officeId: number | ''
}

const CreateCashierDialog = ({
  open,
  onClose,
  onSubmit,
  cashier,
  mode,
  isLoading = false
}: CreateCashierDialogProps) => {
  const { data: offices, isLoading: officesLoading } = useOffices()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      ci: '',
      phone: '',
      officeId: ''
    }
  })

  useEffect(() => {
    if (cashier && mode === 'edit') {
      reset({
        email: cashier.email,
        fullName: cashier.fullName,
        ci: cashier.ci,
        phone: cashier.phone,
        officeId: cashier.office?.id || '',
        password: '',
        confirmPassword: ''
      })
    } else {
      reset({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        ci: '',
        phone: '',
        officeId: ''
      })
    }
  }, [cashier, mode, reset, open])

  const handleFormSubmit = async (data: FormData) => {
    const officeId = typeof data.officeId === 'number' ? data.officeId : Number(data.officeId)

    if (mode === 'create') {
      const createData: CreateCashierDto = {
        email: data.email,
        password: data.password!,
        fullName: data.fullName,
        ci: data.ci,
        phone: data.phone,
        officeId: officeId
      }

      await onSubmit(createData, officeId)
    } else {
      const updateData: UpdateCashierDto = {
        email: data.email,
        fullName: data.fullName,
        ci: data.ci,
        phone: data.phone
      }

      await onSubmit(updateData, officeId)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      reset()
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className='flex items-center gap-2'>
          <i className='tabler-users' style={{ fontSize: '24px' }} />
          <span>{mode === 'create' ? 'Nuevo Cajero' : 'Editar Cajero'}</span>
        </div>
        <IconButton onClick={handleClose} disabled={isLoading}>
          <i className='tabler-x' />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <Controller
                name='fullName'
                control={control}
                rules={{
                  required: 'El nombre completo es requerido',
                  minLength: {
                    value: 3,
                    message: 'El nombre debe tener al menos 3 caracteres'
                  }
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Nombre Completo'
                    placeholder='Ej: Juan Pérez'
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
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='ci'
                control={control}
                rules={{
                  required: 'El CI es requerido',
                  pattern: {
                    value: /^[0-9]+$/,
                    message: 'El CI solo debe contener números'
                  }
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Cédula de Identidad'
                    placeholder='Ej: 12345678'
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
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='email'
                control={control}
                rules={{
                  required: 'El email es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='email'
                    label='Correo Electrónico'
                    placeholder='Ej: correo@ejemplo.com'
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
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='phone'
                control={control}
                rules={{
                  required: 'El teléfono es requerido',
                  pattern: {
                    value: /^[0-9]+$/,
                    message: 'El teléfono solo debe contener números'
                  }
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Teléfono'
                    placeholder='Ej: 76565243'
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
                )}
              />
            </Grid>

            {mode === 'create' && (
              <>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='password'
                    control={control}
                    rules={{
                      required: mode === 'create' ? 'La contraseña es requerida' : false,
                      minLength: {
                        value: 6,
                        message: 'La contraseña debe tener al menos 6 caracteres'
                      }
                    }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        label='Contraseña'
                        placeholder='Mínimo 6 caracteres'
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
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge='end'
                                disabled={isLoading}
                              >
                                <i className={showPassword ? 'tabler-eye-off' : 'tabler-eye'} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='confirmPassword'
                    control={control}
                    rules={{
                      required: mode === 'create' ? 'Debe confirmar la contraseña' : false,
                      validate: value => value === watch('password') || 'Las contraseñas no coinciden'
                    }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        type={showConfirmPassword ? 'text' : 'password'}
                        label='Repetir Contraseña'
                        placeholder='Confirme su contraseña'
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                        disabled={isLoading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position='start'>
                              <i className='tabler-lock' />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge='end'
                                disabled={isLoading}
                              >
                                <i className={showConfirmPassword ? 'tabler-eye-off' : 'tabler-eye'} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Controller
                name='officeId'
                control={control}
                rules={{
                  required: 'La oficina es requerida'
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label='Oficina'
                    error={!!errors.officeId}
                    helperText={errors.officeId?.message}
                    disabled={isLoading || officesLoading}
                    onChange={e => field.onChange(Number(e.target.value))}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-building' />
                        </InputAdornment>
                      )
                    }}
                  >
                    {officesLoading ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} />
                        <span style={{ marginLeft: 8 }}>Cargando oficinas...</span>
                      </MenuItem>
                    ) : offices && offices.length > 0 ? (
                      offices.map(office => (
                        <MenuItem key={office.id} value={Number(office.id)}>
                          <div className='flex items-center gap-2'>
                            <i className='tabler-building' style={{ fontSize: '18px' }} />
                            <div className='flex flex-col'>
                              <span>{office.city}</span>
                              <span style={{ fontSize: '12px', color: 'var(--mui-palette-text-secondary)' }}>
                                {office.place.name}
                              </span>
                            </div>
                          </div>
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No hay oficinas disponibles</MenuItem>
                    )}
                  </CustomTextField>
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
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Guardando...' : mode === 'create' ? 'Crear Cajero' : 'Actualizar Cajero'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default CreateCashierDialog
