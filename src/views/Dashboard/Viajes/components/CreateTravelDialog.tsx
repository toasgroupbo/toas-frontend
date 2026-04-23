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
import Alert from '@mui/material/Alert'

import CustomTextField from '@core/components/mui/TextField'
import type { CreateTravelDto, TravelType } from '@/types/api/travels'
import { useBuses, useBusesForCashier } from '@/hooks/useBuses'
import { useRoutes, useRoutesForCashier } from '@/hooks/useRoutes'

interface CreateTravelDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateTravelDto) => Promise<void>
  isLoading?: boolean
  isCashier?: boolean
}

interface FormData {
  busId: number | ''
  routeId: number | ''
  type: TravelType
  lane: number | ''
  price_deck_1: string
  price_deck_2: string
  departure_time: string
  arrival_time: string
}

const CreateTravelDialog = ({ open, onClose, onSubmit, isLoading = false, isCashier = false }: CreateTravelDialogProps) => {
  // Solo ejecutar los hooks según el rol - el componente solo se monta cuando está abierto
  const busesForCashierQuery = useBusesForCashier(isCashier)
  const routesForCashierQuery = useRoutesForCashier(isCashier)
  const busesQuery = useBuses(!isCashier)
  const routesQuery = useRoutes(!isCashier)

  const buses = isCashier ? busesForCashierQuery.data : busesQuery.data
  const busesLoading = isCashier ? busesForCashierQuery.isLoading : busesQuery.isLoading
  const busesError = isCashier ? busesForCashierQuery.error : busesQuery.error
  const routes = isCashier ? routesForCashierQuery.data : routesQuery.data
  const routesLoading = isCashier ? routesForCashierQuery.isLoading : routesQuery.isLoading
  const routesError = isCashier ? routesForCashierQuery.error : routesQuery.error

  const hasError = busesError || routesError

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      busId: '',
      routeId: '',
      type: 'normal',
      lane: '',
      price_deck_1: '',
      price_deck_2: '',
      departure_time: '',
      arrival_time: ''
    }
  })

  const busId = watch('busId')
  const routeId = watch('routeId')
  const departureTime = watch('departure_time')
  const travelType = watch('type')

  // Obtener la ruta seleccionada para calcular travel_hours
  const selectedRoute = routeId && routes ? routes.find(r => Number(r.id) === Number(routeId)) : null

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  // Calcular automáticamente la hora de llegada basándose en travel_hours
  useEffect(() => {
    if (departureTime && selectedRoute?.travel_hours) {
      const departure = new Date(departureTime)
      const arrival = new Date(departure.getTime() + selectedRoute.travel_hours * 60 * 60 * 1000)

      // Formatear para datetime-local (YYYY-MM-DDTHH:mm)
      const year = arrival.getFullYear()
      const month = String(arrival.getMonth() + 1).padStart(2, '0')
      const day = String(arrival.getDate()).padStart(2, '0')
      const hours = String(arrival.getHours()).padStart(2, '0')
      const minutes = String(arrival.getMinutes()).padStart(2, '0')

      setValue('arrival_time', `${year}-${month}-${day}T${hours}:${minutes}`)
    }
  }, [departureTime, selectedRoute, setValue])

  useEffect(() => {
    if (busId && buses) {
      const selectedBus = buses.find(b => Number(b.id) === Number(busId))

      if (selectedBus?.busType?.decks) {
        const deck1 = selectedBus.busType.decks.find(d => d.deck === 1)

        if (deck1?.price) {
          setValue('price_deck_1', deck1.price)
        }

        const deck2 = selectedBus.busType.decks.find(d => d.deck === 2)

        if (deck2?.price) {
          setValue('price_deck_2', deck2.price)
        } else {
          setValue('price_deck_2', '')
        }
      }
    }
  }, [busId, buses, travelType, setValue])

  const selectedBus = busId && buses ? buses.find(b => Number(b.id) === Number(busId)) : null
  const hasTwoDecks = selectedBus?.busType?.decks && selectedBus.busType.decks.length > 1

  const handleFormSubmit = async (data: FormData) => {
    const payload: CreateTravelDto = {
      busId: typeof data.busId === 'number' ? data.busId : Number(data.busId),
      routeId: typeof data.routeId === 'number' ? data.routeId : Number(data.routeId),
      type: data.type,
      lane: typeof data.lane === 'number' ? data.lane : Number(data.lane),
      price_deck_1: data.price_deck_1,
      price_deck_2: data.price_deck_2 || data.price_deck_1,
      departure_time: new Date(data.departure_time).toISOString(),
      arrival_time: new Date(data.arrival_time).toISOString()
    }

    try {
      await onSubmit(payload)
    } catch (error: any) {
      console.error('Error en handleFormSubmit:', error)

      throw error
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
          <i className='tabler-bus' style={{ fontSize: '24px' }} />
          <span>Nuevo Viaje</span>
        </div>
        <IconButton onClick={handleClose} disabled={isLoading}>
          <i className='tabler-x' />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          {hasError && (
            <Alert severity='error' sx={{ mb: 3 }}>
              Error al cargar los datos. Por favor, intente cerrar y abrir el diálogo nuevamente.
            </Alert>
          )}
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Controller
                name='type'
                control={control}
                rules={{
                  required: 'El tipo de viaje es requerido'
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label='Tipo de Viaje'
                    error={!!errors.type}
                    helperText={errors.type?.message}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-ticket' />
                        </InputAdornment>
                      )
                    }}
                  >
                    <MenuItem value='normal'>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i
                          className='tabler-circle-filled'
                          style={{ fontSize: '10px', color: 'var(--mui-palette-primary-main)' }}
                        />
                        <Typography variant='body2'>Normal</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value='habilitada'>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i
                          className='tabler-star-filled'
                          style={{ fontSize: '14px', color: 'var(--mui-palette-warning-main)' }}
                        />
                        <Typography variant='body2'>Habilitada</Typography>
                      </Box>
                    </MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='lane'
                control={control}
                rules={{
                  required: 'El carril es requerido',
                  min: {
                    value: 1,
                    message: 'El carril debe ser mayor a 0'
                  }
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Carril'
                    placeholder='Ej: 7'
                    error={!!errors.lane}
                    helperText={errors.lane?.message || 'Número de carril de salida'}
                    disabled={isLoading}
                    onChange={e => field.onChange(e.target.value ? Number(e.target.value) : '')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-road' />
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </Grid>

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
                            <Typography variant='body2'>{route.officeOrigin.place?.name}</Typography>
                            <i className='tabler-arrow-right' style={{ fontSize: '14px' }} />
                            <i
                              className='tabler-flag-filled'
                              style={{ fontSize: '14px', color: 'var(--mui-palette-error-main)' }}
                            />
                            <Typography variant='body2'>{route.officeDestination.place?.name}</Typography>
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

            <Grid item xs={12} sm={hasTwoDecks ? 6 : 12}>
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
                    helperText={
                      travelType === 'normal' ? 'Precio cargado automáticamente del bus' : errors.price_deck_1?.message
                    }
                    disabled={isLoading || travelType === 'normal'}
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

            {hasTwoDecks && (
              <Grid item xs={12} sm={6}>
                <Controller
                  name='price_deck_2'
                  control={control}
                  rules={{
                    required: hasTwoDecks ? 'El precio de piso 2 es requerido' : false,
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
                      label='Precio Piso 2'
                      placeholder='0.00'
                      error={!!errors.price_deck_2}
                      helperText={
                        travelType === 'normal'
                          ? 'Precio cargado automáticamente del bus'
                          : errors.price_deck_2?.message
                      }
                      disabled={isLoading || travelType === 'normal'}
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
            )}

            <Grid item xs={12} sm={6}>
              <Controller
                name='departure_time'
                control={control}
                rules={{
                  required: 'La fecha y hora de salida es requerida'
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='datetime-local'
                    label='Fecha y Hora de Salida'
                    error={!!errors.departure_time}
                    helperText={errors.departure_time?.message}
                    disabled={isLoading}
                    InputLabelProps={{
                      shrink: true
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-calendar-clock' />
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
                  required: 'La fecha y hora de llegada es requerida'
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='datetime-local'
                    label='Fecha y Hora de Llegada'
                    error={!!errors.arrival_time}
                    helperText={
                      selectedRoute?.travel_hours
                        ? `(${selectedRoute.travel_hours} hora${selectedRoute.travel_hours > 1 ? 's' : ''} de viaje)`
                        : 'Seleccione una ruta y hora de salida'
                    }
                    disabled
                    InputLabelProps={{
                      shrink: true
                    }}
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-calendar-check' />
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
