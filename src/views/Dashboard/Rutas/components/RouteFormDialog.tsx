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
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import CustomTextField from '@core/components/mui/TextField'
import type { Route, CreateRouteDto, UpdateRouteDto } from '@/types/api/rutas'
import { useOffices } from '@/hooks/useOffices'

interface RouteFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateRouteDto | UpdateRouteDto) => Promise<void>
  route?: Route | null
  isEditMode?: boolean
  isLoading?: boolean
}

interface FormData {
  officeOriginId: number | string // Cambiar a permitir string también
  officeDestinationId: number | string
  pass_by: string[]
  travel_hours: number
}

const RouteFormDialog = ({
  open,
  onClose,
  onSubmit,
  route,
  isEditMode = false,
  isLoading = false
}: RouteFormDialogProps) => {
  const { data: offices, isLoading: officesLoading } = useOffices()
  const [newStop, setNewStop] = useState('')

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      officeOriginId: '',
      officeDestinationId: '',
      pass_by: [],
      travel_hours: 1
    }
  })

  const passBy = watch('pass_by')

  useEffect(() => {
    if (route && isEditMode) {
      reset({
        officeOriginId: route.officeOrigin.id,
        officeDestinationId: route.officeDestination.id,
        pass_by: route.pass_by || [],
        travel_hours: route.travel_hours || 1
      })
    } else {
      reset({
        officeOriginId: '',
        officeDestinationId: '',
        pass_by: [],
        travel_hours: 1
      })
    }
  }, [route, isEditMode, reset, open])

  const handleFormSubmit = async (data: FormData) => {
    const submitData = {
      ...data,
      officeOriginId: Number(data.officeOriginId),
      officeDestinationId: Number(data.officeDestinationId),
      travel_hours: Number(data.travel_hours)
    }

    await onSubmit(submitData)
  }

  const handleClose = () => {
    if (!isLoading) {
      reset()
      setNewStop('')
      onClose()
    }
  }

  const handleAddStop = () => {
    if (newStop.trim()) {
      const currentStops = passBy || []

      setValue('pass_by', [...currentStops, newStop.trim()])
      setNewStop('')
    }
  }

  const handleRemoveStop = (index: number) => {
    const currentStops = passBy || []

    setValue(
      'pass_by',
      currentStops.filter((_, i) => i !== index)
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddStop()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className='flex items-center gap-2'>
          <i className='tabler-route' style={{ fontSize: '24px' }} />
          <span>{isEditMode ? 'Editar Ruta' : 'Nueva Ruta'}</span>
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
                name='officeOriginId'
                control={control}
                rules={{
                  required: 'La oficina de origen es requerida'
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label='Oficina de Origen'
                    error={!!errors.officeOriginId}
                    helperText={errors.officeOriginId?.message}
                    disabled={isLoading || officesLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-flag' />
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
                        <MenuItem key={office.id} value={office.id}>
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

            <Grid item xs={12} sm={6}>
              <Controller
                name='officeDestinationId'
                control={control}
                rules={{
                  required: 'La oficina de destino es requerida',
                  validate: value => value !== watch('officeOriginId') || 'El destino no puede ser igual al origen'
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label='Oficina de Destino'
                    error={!!errors.officeDestinationId}
                    helperText={errors.officeDestinationId?.message}
                    disabled={isLoading || officesLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-flag-filled' />
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
                        <MenuItem key={office.id} value={office.id}>
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
            <Grid item xs={12} sm={6}>
              <Controller
                name='travel_hours'
                control={control}
                rules={{
                  required: 'Las horas de viaje son requeridas',
                  min: { value: 1, message: 'Mínimo 1 hora' }
                }}
                render={({ field: { ref, value, onChange, ...field } }) => (
                  <CustomTextField
                    {...field}
                    inputRef={ref}
                    type='number'
                    fullWidth
                    label='Horas de Viaje'
                    value={value || ''}
                    error={!!errors.travel_hours}
                    helperText={errors.travel_hours?.message}
                    disabled={isLoading}
                    onChange={e => {
                      const inputValue = e.target.value

                      if (inputValue === '') {
                        onChange('')

                        return
                      }

                      const numValue = parseInt(inputValue, 10)

                      if (!isNaN(numValue) && numValue >= 1) {
                        onChange(numValue)
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-clock' />
                        </InputAdornment>
                      ),
                      endAdornment: <InputAdornment position='end'>horas</InputAdornment>,
                      inputProps: {
                        min: 1,
                        step: 1,
                        pattern: '[0-9]*'
                      }
                    }}
                    slotProps={{
                      htmlInput: {
                        inputMode: 'numeric'
                      }
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 600 }}>
                Trayecto (Puntos por donde pasa)
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <CustomTextField
                  fullWidth
                  label='Agregar Punto del Trayecto'
                  placeholder='Ej: Sucre, Aiquile, Punata, etc.'
                  value={newStop}
                  onChange={e => setNewStop(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='tabler-map-pin' />
                      </InputAdornment>
                    )
                  }}
                />
                <Button
                  variant='contained'
                  onClick={handleAddStop}
                  disabled={!newStop.trim() || isLoading}
                  sx={{ minWidth: '120px' }}
                  startIcon={<i className='tabler-plus' />}
                >
                  Agregar
                </Button>
              </Box>

              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                  minHeight: '100px',
                  backgroundColor: 'action.hover'
                }}
              >
                {passBy && passBy.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {passBy.map((stop, index) => (
                      <Chip
                        key={index}
                        label={stop}
                        onDelete={() => handleRemoveStop(index)}
                        color='info'
                        variant='filled'
                        icon={<i className='tabler-map-pin' style={{ fontSize: '14px' }} />}
                        deleteIcon={<i className='tabler-x' />}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant='body2' color='text.secondary' textAlign='center'>
                    No hay puntos en el trayecto. Agrega los lugares por donde pasa la ruta.
                  </Typography>
                )}
              </Box>
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
            {isLoading ? 'Guardando...' : isEditMode ? 'Actualizar Ruta' : 'Crear Ruta'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default RouteFormDialog
