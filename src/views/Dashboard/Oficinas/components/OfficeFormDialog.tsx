'use client'

import { useEffect } from 'react'

import { useForm, Controller } from 'react-hook-form'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'

import { MenuItem } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
import type { Office, CreateOfficeDto, UpdateOfficeDto } from '@/types/api/offices'

import { usePlaces } from '@/hooks/useOffices'

interface OfficeFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateOfficeDto | UpdateOfficeDto) => Promise<void>
  office?: Office | null
  isEditMode?: boolean
  isLoading?: boolean
}

interface FormData {
  url_gps: string
  name: string
  address: string
  placeId: number
}

const OfficeFormDialog = ({
  open,
  onClose,
  onSubmit,
  office,
  isEditMode = false,
  isLoading = false
}: OfficeFormDialogProps) => {
  const { data: places, isLoading: placesLoading } = usePlaces()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      url_gps: '',
      name: '',
      address: '',
      placeId: 0
    }
  })

  useEffect(() => {
    if (office && isEditMode) {
      reset({
        url_gps: office.url_gps,
        name: office.name || '',
        address: office.address || '',
        placeId: office.place.id
      })
    } else {
      reset({
        url_gps: '',
        name: '',
        address: '',
        placeId: 0
      })
    }
  }, [office, isEditMode, reset, open])

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit(data)
  }

  const handleClose = () => {
    if (!isLoading) {
      reset()
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className='flex items-center gap-2'>
          <i className='tabler-building' style={{ fontSize: '24px' }} />
          <span>{isEditMode ? 'Editar Oficina' : 'Nueva Oficina'}</span>
        </div>
        <IconButton onClick={handleClose} disabled={isLoading}>
          <i className='tabler-x' />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Controller
                name='name'
                control={control}
                rules={{
                  required: 'El nombre de la oficina es requerido'
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Nombre de la Oficina'
                    placeholder='Ej: Oficina Central'
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: <i className='tabler-building' style={{ marginRight: '8px' }} />
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='address'
                control={control}
                rules={{
                  required: 'La dirección es requerida'
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Dirección'
                    placeholder='Ej: Av. Libertador #123, Edificio Centro'
                    error={!!errors.address}
                    helperText={errors.address?.message}
                    disabled={isLoading}
                    multiline
                    rows={2}
                    InputProps={{
                      startAdornment: <i className='tabler-address-book' style={{ marginRight: '8px' }} />
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='url_gps'
                control={control}
                rules={{
                  required: 'La URL de GPS es requerida',
                  pattern: {
                    value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                    message: 'Ingrese una URL válida'
                  }
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='URL GPS'
                    placeholder='Ej: https://maps.google.com/...'
                    error={!!errors.url_gps}
                    helperText={errors.url_gps?.message}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: <i className='tabler-map-pin' style={{ marginRight: '8px' }} />
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='placeId'
                control={control}
                rules={{ required: 'La ubicación es requerida' }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label='Ciudad / Ubicación'
                    error={!!errors.placeId}
                    helperText={errors.placeId?.message}
                    disabled={isLoading || placesLoading}
                    InputProps={{
                      startAdornment: <i className='tabler-map-pin-filled' style={{ marginRight: '8px' }} />
                    }}
                  >
                    {places?.map(place => (
                      <MenuItem key={place.id} value={place.id}>
                        {place.name}
                      </MenuItem>
                    ))}
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
            {isLoading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default OfficeFormDialog
