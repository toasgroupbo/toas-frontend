'use client'

import { useEffect, useState } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import CustomTextField from '@core/components/mui/TextField'
import type { Owner } from '@/types/api/owners'
import {
  BANCOS_OPTIONS,
  BRANCH_OFFICE_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
  DOCUMENT_EXTENSION_OPTIONS
} from '@/types/api/company'

const BANCOS_VALUES = BANCOS_OPTIONS.map(b => b.value) as [string, ...string[]]
const DOCUMENT_TYPE_VALUES = DOCUMENT_TYPE_OPTIONS.map(d => d.value) as [string, ...string[]]
const DOCUMENT_EXTENSION_VALUES = DOCUMENT_EXTENSION_OPTIONS.map(d => d.value) as [string, ...string[]]

const bankAccountSchema = z.object({
  bankCode: z.enum(BANCOS_VALUES, { message: 'Seleccione un banco' }),
  account: z.string().min(8, 'El número de cuenta debe tener al menos 8 dígitos'),
  titularName: z.string().min(3, 'El nombre del titular es requerido'),
  branchOfficeId: z.number(),
  documentNumber: z.string().min(5, 'El número de documento es requerido'),
  documentType: z.enum(DOCUMENT_TYPE_VALUES, { message: 'Seleccione un tipo de documento' }),
  documentExtension: z.enum(DOCUMENT_EXTENSION_VALUES, { message: 'Seleccione una extensión de documento' })
})

const ownerSchema = z
  .object({
    name: z.string().min(1, 'El nombre es requerido'),
    ci: z.string().min(1, 'El CI es requerido'),
    phone: z.string().min(1, 'El teléfono es requerido'),
    email: z.string().optional().or(z.literal('')),
    password: z.string().optional().or(z.literal('')),
    newPassword: z.string().optional().or(z.literal('')),
    confirmPassword: z.string().optional().or(z.literal('')),
    bankAccount: bankAccountSchema
  })
  .superRefine((data, ctx) => {
    if (data.newPassword && data.newPassword.length > 0 && data.newPassword.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La contraseña debe tener al menos 6 caracteres',
        path: ['newPassword']
      })
    }

    if (data.newPassword && data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword']
      })
    }
  })

type OwnerFormData = z.infer<typeof ownerSchema>

interface OwnerDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    name: string
    ci: string
    phone: string
    email?: string
    password?: string
    newPassword?: string
    bankAccount: any
  }) => void
  owner?: Owner | null
  isLoading?: boolean
  isEdit?: boolean
}

const OwnerDialog = ({ open, onClose, onSubmit, owner, isLoading, isEdit = false }: OwnerDialogProps) => {
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors }
  } = useForm<OwnerFormData>({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      name: '',
      ci: '',
      phone: '',
      email: '',
      password: '',
      newPassword: '',
      confirmPassword: '',
      bankAccount: {
        bankCode: '',
        account: '',
        titularName: '',
        branchOfficeId: 201,
        documentNumber: '',
        documentType: '',
        documentExtension: ''
      }
    }
  })

  useEffect(() => {
    if (open) {
      if (owner && isEdit) {
        reset({
          name: owner.name,
          ci: owner.ci,
          phone: owner.phone,
          email: '',
          password: '',
          newPassword: '',
          confirmPassword: '',
          bankAccount: {
            bankCode: owner.bankAccount.bankCode,
            account: owner.bankAccount.account,
            titularName: owner.bankAccount.titularName,
            branchOfficeId: owner.bankAccount.branchOfficeId,
            documentNumber: owner.bankAccount.documentNumber,
            documentType: owner.bankAccount.documentType,
            documentExtension: owner.bankAccount.documentExtension
          }
        })
      } else {
        reset({
          name: '',
          ci: '',
          phone: '',
          email: '',
          password: '',
          newPassword: '',
          confirmPassword: '',
          bankAccount: {
            bankCode: '',
            account: '',
            titularName: '',
            branchOfficeId: 201,
            documentNumber: '',
            documentType: '',
            documentExtension: ''
          }
        })
      }
    }
  }, [open, owner, isEdit, reset])

  const handleFormSubmit = (data: OwnerFormData) => {
    // Validar email y password al crear
    if (!isEdit) {
      if (!data.email || data.email.trim() === '') {
        setError('email', { type: 'manual', message: 'El email es requerido' })

        return
      }

      if (!data.password || data.password.trim() === '') {
        setError('password', { type: 'manual', message: 'La contraseña es requerida' })

        return
      }

      if (data.password.length < 6) {
        setError('password', { type: 'manual', message: 'La contraseña debe tener al menos 6 caracteres' })

        return
      }
    }

    onSubmit({
      name: data.name,
      ci: data.ci,
      phone: data.phone,
      email: data.email,
      password: data.password,
      newPassword: data.newPassword,
      bankAccount: data.bankAccount
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <div className='flex items-center justify-between'>
          <Typography variant='h5'>{isEdit ? 'Editar Dueño' : 'Crear Nuevo Dueño'}</Typography>
          <IconButton onClick={onClose} size='small'>
            <i className='tabler-x' />
          </IconButton>
        </div>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Grid container spacing={4}>
            {/* Información Personal */}
            <Grid size={{ xs: 12 }}>
              <Typography variant='h6' sx={{ mb: 2 }}>
                Información Personal
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                label='Nombre Completo *'
                placeholder='Juan Pérez'
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
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
                placeholder='12345678'
                {...register('ci')}
                error={!!errors.ci}
                helperText={errors.ci?.message}
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
                placeholder='78965432'
                {...register('phone')}
                error={!!errors.phone}
                helperText={errors.phone?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-phone' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {/* Credenciales - Solo para crear */}
            {!isEdit && (
              <>
                <Grid size={{ xs: 12 }}>
                  <Typography variant='h6' sx={{ mb: 2, mt: 2 }}>
                    Credenciales de Acceso
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomTextField
                    fullWidth
                    label='Email *'
                    type='email'
                    placeholder='owner@gmail.com'
                    {...register('email')}
                    error={!!errors.email}
                    helperText={errors.email?.message}
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
                    label='Contraseña *'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='••••••••'
                    {...register('password')}
                    error={!!errors.password}
                    helperText={errors.password?.message}
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
              </>
            )}

            {/* Cambiar Contraseña - Solo para editar */}
            {isEdit && (
              <>
                <Grid size={{ xs: 12 }}>
                  <Typography variant='h6' sx={{ mb: 2, mt: 2 }}>
                    Cambiar Contraseña (Opcional)
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomTextField
                    fullWidth
                    label='Nueva Contraseña'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='••••••••'
                    {...register('newPassword')}
                    error={!!errors.newPassword}
                    helperText={errors.newPassword?.message}
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
                    label='Confirmar Contraseña'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='••••••••'
                    {...register('confirmPassword')}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-lock' />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </>
            )}

            {/* Información Bancaria */}
            <Grid size={{ xs: 12 }}>
              <Typography variant='h6' sx={{ mb: 2, mt: 2 }}>
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
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} variant='outlined' color='secondary' disabled={isLoading}>
            Cancelar
          </Button>
          <Button type='submit' variant='contained' disabled={isLoading}>
            {isLoading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default OwnerDialog
