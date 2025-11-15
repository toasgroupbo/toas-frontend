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
import { OfficePlaces } from '@/types/api/offices'

interface OfficeFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateOfficeDto | UpdateOfficeDto) => Promise<void>
  office?: Office | null
  isEditMode?: boolean
  isLoading?: boolean
}

interface FormData {
  name: string
  place: string
}

const OfficeFormDialog = ({
  open,
  onClose,
  onSubmit,
  office,
  isEditMode = false,
  isLoading = false
}: OfficeFormDialogProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      place: ''
    }
  })

  useEffect(() => {
    if (office && isEditMode) {
      reset({
        name: office.name,
        place: office.place
      })
    } else {
      reset({
        name: '',
        place: ''
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
                  required: 'El nombre es requerido',
                  minLength: {
                    value: 2,
                    message: 'El nombre debe tener al menos 2 caracteres'
                  }
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
                      startAdornment: <i className='tabler-building-community' style={{ marginRight: '8px' }} />
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='place'
                control={control}
                rules={{ required: 'La ubicación es requerida' }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label='Ubicación'
                    error={!!errors.place}
                    helperText={errors.place?.message}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: <i className='tabler-map-pin' style={{ marginRight: '8px' }} />
                    }}
                  >
                    {Object.values(OfficePlaces).map(place => (
                      <MenuItem key={place} value={place}>
                        {place}
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
