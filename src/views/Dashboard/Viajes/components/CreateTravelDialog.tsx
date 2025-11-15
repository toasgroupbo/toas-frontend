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
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

import CustomTextField from '@core/components/mui/TextField'
import type { CreateTravelDto } from '@/types/api/travels'
import { useBuses } from '@/hooks/useBuses'
import { useRoutes } from '@/hooks/useRoutes'

interface CreateTravelDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateTravelDto) => Promise<void>
  isLoading?: boolean
}

interface FormData {
  busUUID: string
  routeUUID: string
  price_deck_1: string
  price_deck_2: string
  departure_time: string
  arrival_time: string
}

const CreateTravelDialog = ({ open, onClose, onSubmit, isLoading = false }: CreateTravelDialogProps) => {
  const { data: buses, isLoading: busesLoading } = useBuses()
  const { data: routes, isLoading: routesLoading } = useRoutes()

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      busUUID: '',
      routeUUID: '',
      price_deck_1: '',
      price_deck_2: '',
      departure_time: '',
      arrival_time: ''
    }
  })

  const departureTime = watch('departure_time')

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

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
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className='flex items-center gap-2'>
          <i className='tabler-bus' style={{ fontSize: '24px' }} />
          <span>Nuevo Viaje</span>
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
                name='busUUID'
                control={control}
                rules={{
                  required: 'El bus es requerido'
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label='Bus'
                    error={!!errors.busUUID}
                    helperText={errors.busUUID?.message}
                    disabled={isLoading || busesLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-bus' />
                        </InputAdornment>
                      )
                    }}
                  >
                    {busesLoading ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} />
                        <span style={{ marginLeft: 8 }}>Cargando buses...</span>
                      </MenuItem>
                    ) : buses && buses.length > 0 ? (
                      buses.map(bus => (
                        <MenuItem key={bus.id} value={bus.id}>
                          <div className='flex items-center gap-2'>
                            <i className='tabler-bus' style={{ fontSize: '18px' }} />
                            <div className='flex flex-col'>
                              <span>{bus.name}</span>
                              <span style={{ fontSize: '12px', color: 'var(--mui-palette-text-secondary)' }}>
                                {bus.plaque} - {bus.busType.name}
                              </span>
                            </div>
                          </div>
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No hay buses disponibles</MenuItem>
                    )}
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='routeUUID'
                control={control}
                rules={{
                  required: 'La ruta es requerida'
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label='Ruta'
                    error={!!errors.routeUUID}
                    helperText={errors.routeUUID?.message}
                    disabled={isLoading || routesLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-route' />
                        </InputAdornment>
                      )
                    }}
                  >
                    {routesLoading ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} />
                        <span style={{ marginLeft: 8 }}>Cargando rutas...</span>
                      </MenuItem>
                    ) : routes && routes.length > 0 ? (
                      routes.map(route => (
                        <MenuItem key={route.id} value={route.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i
                              className='tabler-flag'
                              style={{ fontSize: '14px', color: 'var(--mui-palette-success-main)' }}
                            />
                            <Typography variant='body2'>{route.officeOrigin.place}</Typography>
                            <i className='tabler-arrow-right' style={{ fontSize: '14px' }} />
                            <i
                              className='tabler-flag-filled'
                              style={{ fontSize: '14px', color: 'var(--mui-palette-error-main)' }}
                            />
                            <Typography variant='body2'>{route.officeDestination.place}</Typography>
                          </Box>
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No hay rutas disponibles</MenuItem>
                    )}
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='price_deck_1'
                control={control}
                rules={{
                  required: 'El precio de piso 1 es requerido',
                  pattern: {
                    value: /^\d+(\.\d{1,2})?$/,
                    message: 'Ingrese un precio válido'
                  },
                  min: {
                    value: 0.01,
                    message: 'El precio debe ser mayor a 0'
                  }
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Precio Piso 1'
                    placeholder='0.00'
                    error={!!errors.price_deck_1}
                    helperText={errors.price_deck_1?.message}
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

            <Grid item xs={12} sm={6}>
              <Controller
                name='price_deck_2'
                control={control}
                rules={{
                  required: 'El precio de piso 2 es requerido',
                  pattern: {
                    value: /^\d+(\.\d{1,2})?$/,
                    message: 'Ingrese un precio válido'
                  },
                  min: {
                    value: 0.01,
                    message: 'El precio debe ser mayor a 0'
                  }
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Precio Piso 2'
                    placeholder='0.00'
                    error={!!errors.price_deck_2}
                    helperText={errors.price_deck_2?.message}
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

            <Grid item xs={12} sm={6}>
              <Controller
                name='departure_time'
                control={control}
                rules={{
                  required: 'La hora de salida es requerida'
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='datetime-local'
                    label='Hora de Salida'
                    error={!!errors.departure_time}
                    helperText={errors.departure_time?.message}
                    disabled={isLoading}
                    InputLabelProps={{
                      shrink: true
                    }}
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

            <Grid item xs={12} sm={6}>
              <Controller
                name='arrival_time'
                control={control}
                rules={{
                  required: 'La hora de llegada es requerida',
                  validate: value => {
                    if (!departureTime) return true

                    return new Date(value) > new Date(departureTime) || 'La llegada debe ser posterior a la salida'
                  }
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='datetime-local'
                    label='Hora de Llegada'
                    error={!!errors.arrival_time}
                    helperText={errors.arrival_time?.message}
                    disabled={isLoading}
                    InputLabelProps={{
                      shrink: true
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-clock-check' />
                        </InputAdornment>
                      )
                    }}
                  />
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
            {isLoading ? 'Creando...' : 'Crear Viaje'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default CreateTravelDialog
