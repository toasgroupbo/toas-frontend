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
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import CustomTextField from '@core/components/mui/TextField'
import type { Owner } from '@/types/api/owners'

const BANCOS_BOLIVIA = [
  'Banco Nacional de Bolivia',
  'Banco de Crédito de Bolivia',
  'Banco Mercantil Santa Cruz',
  'Banco Unión',
  'Banco FIE',
  'Banco Ganadero',
  'Banco Económico',
  'Banco PRODEM',
  'BancoSol',
  'BancoVisión',
  'Banco Fortaleza',
  'Banco BISA'
]

const TIPOS_CUENTA = [
  { value: 'caja_ahorro', label: 'Caja de Ahorro' },
  { value: 'cuenta_corriente', label: 'Cuenta Corriente' },
  { value: 'otro', label: 'Otro' }
]

const ownerSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  ci: z.string().min(1, 'El CI es requerido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  bankAccount: z.object({
    bank: z.string().min(1, 'El banco es requerido'),
    typeAccount: z.enum(['caja_ahorro', 'cuenta_corriente', 'otro']),
    account: z.string().min(1, 'El número de cuenta es requerido')
  })
})

type OwnerFormData = z.infer<typeof ownerSchema>

interface OwnerDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (
    ownerData: { name: string; ci: string; phone: string },
    bankAccountData: { bank: string; typeAccount: 'caja_ahorro' | 'cuenta_corriente' | 'otro'; account: string }
  ) => void
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
        bank: '',
        typeAccount: 'caja_ahorro',
        account: ''
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
            bank: owner.bankAccount.bank,
            typeAccount: owner.bankAccount.typeAccount,
            account: owner.bankAccount.account
          }
        })
      } else {
        reset({
          name: '',
          ci: '',
          phone: '',
          bankAccount: {
            bank: '',
            typeAccount: 'caja_ahorro',
            account: ''
          }
        })
      }
    }
  }, [open, owner, isEdit, reset])

  const handleFormSubmit = (data: OwnerFormData) => {
    onSubmit(
      {
        name: data.name,
        ci: data.ci,
        phone: data.phone
      },
      data.bankAccount
    )
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
                label='Nombre Completo'
                placeholder='Juan Pérez'
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='CI'
                placeholder='12345678'
                {...register('ci')}
                error={!!errors.ci}
                helperText={errors.ci?.message}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Teléfono'
                placeholder='78965432'
                {...register('phone')}
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            </Grid>

            {/* Información Bancaria */}
            <Grid size={{ xs: 12 }}>
              <Typography variant='h6' sx={{ mb: 2, mt: 2 }}>
                Información Bancaria
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
                    label='Banco'
                    {...field}
                    error={!!errors.bankAccount?.bank}
                    helperText={errors.bankAccount?.bank?.message}
                  >
                    {BANCOS_BOLIVIA.map(bank => (
                      <MenuItem key={bank} value={bank}>
                        {bank}
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
                    label='Tipo de Cuenta'
                    {...field}
                    error={!!errors.bankAccount?.typeAccount}
                    helperText={errors.bankAccount?.typeAccount?.message}
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

            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                label='Número de Cuenta'
                placeholder='1234567890'
                {...register('bankAccount.account')}
                error={!!errors.bankAccount?.account}
                helperText={errors.bankAccount?.account?.message}
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
