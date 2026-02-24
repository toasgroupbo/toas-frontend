'use client'

import { useState, useEffect, useRef } from 'react'

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
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'

import CustomTextField from '@core/components/mui/TextField'
import type { CreateTicketDto, SeatSelection } from '@/types/api/tickets'
import type { Travel, TravelSeat } from '@/types/api/travels'
import { useCashierTravels, useCashierTravelById } from '@/hooks/useCashierTravels'
import BusSeatMap from './BusSeatMap'
import CustomerSearchField from './CustomerSearchField'

interface SellTicketDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<CreateTicketDto, 'payment_type'>, travel: Travel) => Promise<void>
  isLoading?: boolean
  preSelectedTravel?: Travel
}

interface FormData {
  travelId: number | ''
  customerId: number | ''
  selectedSeats: string[]
}

const SellTicketDialog = ({ open, onClose, onSubmit, isLoading = false, preSelectedTravel }: SellTicketDialogProps) => {
  const { data: travels, isLoading: travelsLoading } = useCashierTravels()
  const [selectedTravelId, setSelectedTravelId] = useState<number | null>(null)
  const { data: travelDetail, refetch: refetchTravel, isRefetching } = useCashierTravelById(selectedTravelId)
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set())
  const [seatPrices, setSeatPrices] = useState<Record<string, string>>({})
  const customerFieldRef = useRef<HTMLDivElement>(null)

  const selectedTravel = travelDetail || null

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      travelId: '',
      customerId: '',
      selectedSeats: []
    }
  })

  useEffect(() => {
    if (errors.customerId && customerFieldRef.current) {
      customerFieldRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [errors.customerId])

  const travelId = watch('travelId')

  useEffect(() => {
    if (!open) {
      reset()
      setSelectedTravelId(null)
      setSelectedSeats(new Set())
      setSeatPrices({})
    } else if (open && selectedTravelId) {
      refetchTravel()
    }
  }, [open, reset, selectedTravelId, refetchTravel])

  // Handle pre-selected travel
  useEffect(() => {
    if (open && preSelectedTravel) {
      setValue('travelId', preSelectedTravel.id)
      setSelectedTravelId(preSelectedTravel.id)
    }
  }, [open, preSelectedTravel, setValue])

  useEffect(() => {
    if (travelId && !preSelectedTravel) {
      setSelectedTravelId(Number(travelId))
      setSelectedSeats(new Set())
      setSeatPrices({})
      setValue('selectedSeats', [])
    } else if (!preSelectedTravel && !travelId) {
      setSelectedTravelId(null)
      setSelectedSeats(new Set())
      setSeatPrices({})
    }
  }, [travelId, setValue, preSelectedTravel])

  const handleSeatToggle = (seatId: string) => {
    const newSelected = new Set(selectedSeats)
    const newPrices = { ...seatPrices }

    if (newSelected.has(seatId)) {
      newSelected.delete(seatId)
      delete newPrices[seatId]
    } else {
      newSelected.add(seatId)
      const seat = selectedTravel?.travelSeats.find(s => String(s.id) === seatId)

      if (seat && selectedTravel) {
        let price = seat.price

        if (!price || parseFloat(price) === 0) {
          price = seat.deck === 2 ? selectedTravel.price_deck_2 : selectedTravel.price_deck_1
        }

        newPrices[seatId] = price
      }
    }

    setSelectedSeats(newSelected)
    setSeatPrices(newPrices)
    setValue('selectedSeats', Array.from(newSelected))
  }

  const handleFormSubmit = async (data: FormData) => {
    if (selectedSeats.size === 0) {
      return
    }

    // Refetch travel data to get latest seat availability
    const { data: latestTravelData } = await refetchTravel()

    if (!latestTravelData) {
      return
    }

    // Validate all selected seats are still available
    const unavailableSeats: string[] = []

    selectedSeats.forEach(seatId => {
      const seat = latestTravelData.travelSeats.find(s => String(s.id) === seatId)

      if (!seat || (seat.status !== 'available' && seat.status !== 'libre' && seat.status !== 'AVAILABLE')) {
        unavailableSeats.push(seat?.seatNumber || seatId)
      }
    })

    if (unavailableSeats.length > 0) {
      alert(
        `Los siguientes asientos ya no están disponibles: ${unavailableSeats.join(', ')}. Por favor, selecciona otros asientos.`
      )

      // Remove unavailable seats from selection
      const newSelected = new Set(selectedSeats)

      unavailableSeats.forEach(seatNum => {
        const seat = latestTravelData.travelSeats.find(s => s.seatNumber === seatNum)

        if (seat) {
          newSelected.delete(String(seat.id))
        }
      })
      setSelectedSeats(newSelected)
      setValue('selectedSeats', Array.from(newSelected))

      return
    }

    const seatSelections: SeatSelection[] = Array.from(selectedSeats).map(seatId => {
      return {
        seatId: seatId,
        price: seatPrices[seatId]
      }
    })

    const createData: Omit<CreateTicketDto, 'payment_type'> = {
      travelId: typeof data.travelId === 'number' ? data.travelId : Number(data.travelId),
      customerId: typeof data.customerId === 'number' ? data.customerId : Number(data.customerId),
      seatSelections: seatSelections
    }

    await onSubmit(createData, latestTravelData)
  }

  const handleClose = () => {
    if (!isLoading) {
      reset()
      setSelectedTravelId(null)
      setSelectedSeats(new Set())
      setSeatPrices({})
      onClose()
    }
  }

  const getAvailableSeats = () => {
    if (!selectedTravel) return []

    return selectedTravel.travelSeats.filter(
      seat =>
        (seat.status === 'available' || seat.status === 'libre' || seat.status === 'AVAILABLE') && seat.type === 'seat'
    )
  }

  const getSeatsByDeck = (deck: number) => {
    return getAvailableSeats().filter(seat => seat.deck === deck)
  }

  const calculateTotal = () => {
    let total = 0

    selectedSeats.forEach(seatId => {
      total += parseFloat(seatPrices[seatId] || '0')
    })

    return total.toFixed(2)
  }

  const handlePriceChange = (seatId: string, newPrice: string) => {
    setSeatPrices(prev => ({
      ...prev,
      [seatId]: newPrice
    }))
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='lg' fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display='flex' alignItems='center' gap={2}>
          <i className='tabler-ticket' style={{ fontSize: '24px' }} />
          <Typography variant='h6'>Vender Ticket</Typography>
          {selectedTravel && (
            <Chip
              label={`${selectedTravel.route.officeOrigin.place?.name || 'N/A'} → ${selectedTravel.route.officeDestination.place?.name || 'N/A'}`}
              color='primary'
              variant='tonal'
              size='small'
            />
          )}
        </Box>
        <IconButton onClick={handleClose} disabled={isLoading}>
          <i className='tabler-x' />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Grid container spacing={4}>
            {!preSelectedTravel && (
              <Grid item xs={12} sm={6}>
                <Controller
                  name='travelId'
                  control={control}
                  rules={{
                    required: 'El viaje es requerido'
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      select
                      fullWidth
                      label='Viaje'
                      error={!!errors.travelId}
                      helperText={errors.travelId?.message}
                      disabled={isLoading || travelsLoading}
                      onChange={e => field.onChange(Number(e.target.value))}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start'>
                            <i className='tabler-road' />
                          </InputAdornment>
                        )
                      }}
                    >
                      {travelsLoading ? (
                        <MenuItem disabled>
                          <CircularProgress size={20} />
                          <span style={{ marginLeft: 8 }}>Cargando viajes...</span>
                        </MenuItem>
                      ) : travels && travels.length > 0 ? (
                        travels
                          .filter(travel => travel.travel_status === 'active')
                          .map(travel => (
                            <MenuItem key={travel.id} value={Number(travel.id)}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <i
                                    className='tabler-flag'
                                    style={{ fontSize: '14px', color: 'var(--mui-palette-success-main)' }}
                                  />
                                  <Typography variant='body2'>
                                    {travel.route.officeOrigin.place?.name || 'N/A'}
                                  </Typography>
                                  <i className='tabler-arrow-right' style={{ fontSize: '14px' }} />
                                  <i
                                    className='tabler-flag-filled'
                                    style={{ fontSize: '14px', color: 'var(--mui-palette-error-main)' }}
                                  />
                                  <Typography variant='body2'>
                                    {travel.route.officeDestination.place?.name || 'N/A'}
                                  </Typography>
                                </Box>
                                <Typography variant='caption' color='text.secondary'>
                                  {travel.departure_time} - {travel.bus.name} ({travel.bus.plaque})
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))
                      ) : (
                        <MenuItem disabled>No hay viajes disponibles</MenuItem>
                      )}
                    </CustomTextField>
                  )}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={preSelectedTravel ? 12 : 6} ref={customerFieldRef}>
              <Controller
                name='customerId'
                control={control}
                rules={{
                  required: 'El cliente es requerido'
                }}
                render={({ field }) => (
                  <CustomerSearchField
                    onCustomerSelect={customer => {
                      field.onChange(customer.id)
                    }}
                    disabled={isLoading}
                    hasError={!!errors.customerId}
                    helperText={errors.customerId?.message}
                  />
                )}
              />
            </Grid>

            {selectedTravel && (
              <>
                <Grid item xs={12}>
                  <Box display='flex' gap={2} alignItems='center'>
                    <Alert severity='info' icon={<i className='tabler-info-circle' />} sx={{ flex: 1 }}>
                      Selecciona los asientos haciendo clic en el esquema del bus. Total seleccionados:{' '}
                      {selectedSeats.size}
                    </Alert>
                    <Button
                      variant='outlined'
                      color='primary'
                      onClick={() => refetchTravel()}
                      disabled={isRefetching || isLoading}
                      startIcon={isRefetching ? <CircularProgress size={16} /> : <i className='tabler-refresh' />}
                      sx={{ minWidth: 140 }}
                    >
                      {isRefetching ? 'Actualizando...' : 'Actualizar'}
                    </Button>
                  </Box>
                </Grid>

                {/* Mostrar pisos */}
                {selectedTravel.bus.decks === true && getSeatsByDeck(2).length > 0 ? (
                  <>
                    <Grid item xs={12} md={6}>
                      <BusSeatMap
                        seats={selectedTravel.travelSeats}
                        deck={1}
                        deckPrice={selectedTravel.price_deck_1}
                        selectedSeats={selectedSeats}
                        onSeatToggle={handleSeatToggle}
                        totalDecks={2}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <BusSeatMap
                        seats={selectedTravel.travelSeats}
                        deck={2}
                        deckPrice={selectedTravel.price_deck_2}
                        selectedSeats={selectedSeats}
                        onSeatToggle={handleSeatToggle}
                        totalDecks={2}
                      />
                    </Grid>
                  </>
                ) : (
                  <Grid item xs={12}>
                    <BusSeatMap
                      seats={selectedTravel.travelSeats}
                      deck={1}
                      deckPrice={selectedTravel.price_deck_1}
                      selectedSeats={selectedSeats}
                      onSeatToggle={handleSeatToggle}
                      totalDecks={1}
                    />
                  </Grid>
                )}

                {/* Total */}
                {selectedSeats.size > 0 && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant='subtitle1' fontWeight={600} sx={{ mb: 2 }}>
                        Precios por Asiento
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {Array.from(selectedSeats).map(seatId => {
                          const seat = selectedTravel?.travelSeats.find(s => String(s.id) === seatId)

                          return (
                            <Box key={seatId} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={`Asiento ${seat?.seatNumber || seatId}`}
                                color='primary'
                                variant='tonal'
                                size='small'
                              />
                              <CustomTextField
                                type='number'
                                value={seatPrices[seatId] || ''}
                                onChange={e => handlePriceChange(seatId, e.target.value)}
                                sx={{ width: 130 }}
                                size='small'
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position='start'>
                                      <Typography variant='caption'>Bs.</Typography>
                                    </InputAdornment>
                                  )
                                }}
                              />
                            </Box>
                          )
                        })}
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: 'success.lighter',
                          borderRadius: 1,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Typography variant='h6' fontWeight='bold'>
                          Total a pagar:
                        </Typography>
                        <Typography variant='h5' color='success.main' fontWeight='bold'>
                          Bs. {calculateTotal()}
                        </Typography>
                      </Box>
                    </Grid>
                  </>
                )}
              </>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} variant='outlined' color='secondary' disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            type='submit'
            variant='contained'
            disabled={isLoading || selectedSeats.size === 0}
            startIcon={isLoading ? <CircularProgress size={20} /> : <i className='tabler-ticket' />}
          >
            {isLoading ? 'Vendiendo...' : 'Vender Ticket'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default SellTicketDialog
