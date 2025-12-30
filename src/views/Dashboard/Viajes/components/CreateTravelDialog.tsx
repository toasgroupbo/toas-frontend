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
  busId: number | ''
  routeId: number | ''
  price_deck_1: string
  price_deck_2: string
  departure_date: string
  departure_hour: string
}

const CreateTravelDialog = ({ open, onClose, onSubmit, isLoading = false }: CreateTravelDialogProps) => {
  const { data: buses, isLoading: busesLoading } = useBuses()
  const { data: routes, isLoading: routesLoading } = useRoutes()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      busId: '',
      routeId: '',
      price_deck_1: '',
      price_deck_2: '',
      departure_date: '',
      departure_hour: ''
    }
  })

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const handleFormSubmit = async (data: FormData) => {
    // Combinar fecha y hora en formato ISO
    const departureDateTime = `${data.departure_date}T${data.departure_hour}:00`

    // Asegurar que busId y routeId sean números válidos
    const payload: CreateTravelDto = {
      busId: typeof data.busId === 'number' ? data.busId : Number(data.busId),
      routeId: typeof data.routeId === 'number' ? data.routeId : Number(data.routeId),
      price_deck_1: data.price_deck_1,
      price_deck_2: data.price_deck_2 || data.price_deck_1, // Si está vacío, usar el mismo precio del piso 1
      departure_time: departureDateTime,
      arrival_time: departureDateTime // Usar el mismo valor por ahora
    }

    await onSubmit(payload)
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
                name='busId'
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
                    error={!!errors.busId}
                    helperText={errors.busId?.message}
                    disabled={isLoading || busesLoading}
                    onChange={e => field.onChange(Number(e.target.value))}
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
                        <MenuItem key={bus.id} value={Number(bus.id)}>
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
                name='routeId'
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
                    error={!!errors.routeId}
                    helperText={errors.routeId?.message}
                    disabled={isLoading || routesLoading}
                    onChange={e => field.onChange(Number(e.target.value))}
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
                        <MenuItem key={route.id} value={Number(route.id)}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i
                              className='tabler-flag'
                              style={{ fontSize: '14px', color: 'var(--mui-palette-success-main)' }}
                            />
                            <Typography variant='body2'>{route.officeOrigin.city}</Typography>
                            <i className='tabler-arrow-right' style={{ fontSize: '14px' }} />
                            <i
                              className='tabler-flag-filled'
                              style={{ fontSize: '14px', color: 'var(--mui-palette-error-main)' }}
                            />
                            <Typography variant='body2'>{route.officeDestination.city}</Typography>
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
                  pattern: {
                    value: /^\d+(\.\d{1,2})?$/,
                    message: 'Ingrese un precio válido'
                  },
                  validate: value => {
                    if (value && parseFloat(value) < 0.01) {
                      return 'El precio debe ser mayor a 0'
                    }

                    return true
                  }
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Precio Piso 2 (Opcional)'
                    placeholder='0.00'
                    error={!!errors.price_deck_2}
                    helperText={errors.price_deck_2?.message || 'Dejar vacío si el bus no tiene segundo piso'}
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
                name='departure_date'
                control={control}
                rules={{
                  required: 'La fecha de salida es requerida'
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='date'
                    label='Fecha de Salida'
                    error={!!errors.departure_date}
                    helperText={errors.departure_date?.message}
                    disabled={isLoading}
                    InputLabelProps={{
                      shrink: true
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-calendar' />
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='departure_hour'
                control={control}
                rules={{
                  required: 'La hora de salida es requerida'
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='time'
                    label='Hora de Salida'
                    error={!!errors.departure_hour}
                    helperText={errors.departure_hour?.message}
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
                    inputProps={{
                      step: 300 // 5 minutos
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
