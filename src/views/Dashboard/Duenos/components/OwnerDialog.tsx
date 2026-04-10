'use client'

import { useEffect } from 'react'

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

const ownerSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  ci: z.string().min(1, 'El CI es requerido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  bankAccount: z.object({
    bankCode: z.enum(BANCOS_VALUES, { message: 'Seleccione un banco' }),
    account: z.string().min(8, 'El número de cuenta debe tener al menos 8 dígitos'),
    titularName: z.string().min(3, 'El nombre del titular es requerido'),
    branchOfficeId: z.number(),
    documentNumber: z.string().min(5, 'El número de documento es requerido'),
    documentType: z.enum(DOCUMENT_TYPE_VALUES, { message: 'Seleccione un tipo de documento' }),
    documentExtension: z.enum(DOCUMENT_EXTENSION_VALUES, { message: 'Seleccione una extensión de documento' })
  })
})

type OwnerFormData = z.infer<typeof ownerSchema>

interface OwnerDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { name: string; ci: string; phone: string; bankAccount: any }) => void
  owner?: Owner | null
  isLoading?: boolean
  isEdit?: boolean
}

const OwnerDialog = ({ open, onClose, onSubmit, owner, isLoading, isEdit = false }: OwnerDialogProps) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<OwnerFormData>({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      name: '',
      ci: '',
      phone: '',
      bankAccount: {
        bankCode: '',
        account: '',
        titularName: '',
        branchOfficeId: 201, // La Paz por defecto
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
    onSubmit(data)
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
