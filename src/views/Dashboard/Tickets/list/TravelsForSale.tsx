'use client'

import { useState } from 'react'

import Grid from '@mui/material/Grid2'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'

import { useCashierTravels } from '@/hooks/useCashierTravels'
import TravelsForSaleCard from './TravelsForSaleCard'
import TicketsTable from './TicketsTable'

const TravelsForSale = () => {
  const { data: travels, isLoading, error } = useCashierTravels()
  const [showTicketsList, setShowTicketsList] = useState(false)

  const getActiveTravels = () => {
    if (!travels) {
      return []
    }

    // Obtener fecha/hora actual en Bolivia (UTC-4)
    const now = new Date()
    const boliviaOffset = -4 * 60 // UTC-4 en minutos
    const localOffset = now.getTimezoneOffset() // Offset local en minutos
    const boliviaTime = new Date(now.getTime() + (localOffset + boliviaOffset) * 60 * 1000)

    return travels.filter(travel => {
      // Solo viajes con estado activo
      if (travel.travel_status !== 'active') {
        return false
      }

      // Verificar que el viaje no haya partido aún
      const departureTime = new Date(travel.departure_time)

      return departureTime > boliviaTime
    })
  }

  if (isLoading) {
    return (
      <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' minHeight='400px' gap={2}>
        <CircularProgress size={40} />
        <Typography variant='body2' color='text.secondary'>
          Cargando viajes disponibles...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity='error'>Error al cargar los viajes. Por favor, intente nuevamente.</Alert>
      </Box>
    )
  }

  const activeTravels = getActiveTravels()

  if (showTicketsList) {
    return (
      <Box>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
          <Typography variant='h4'>Lista de Tickets Vendidos</Typography>
          <Button
            variant='outlined'
            startIcon={<i className='tabler-arrow-left' />}
            onClick={() => setShowTicketsList(false)}
          >
            Volver a Venta
          </Button>
        </Box>
        <TicketsTable />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header con estadísticas */}
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={4} flexWrap='wrap' gap={2}>
        <Chip
          icon={<i className='tabler-bus' />}
          label={`${activeTravels.length} ${activeTravels.length === 1 ? 'viaje disponible' : 'viajes disponibles'}`}
          color='primary'
          variant='outlined'
        />
        <Button variant='outlined' startIcon={<i className='tabler-list' />} onClick={() => setShowTicketsList(true)}>
          Ver Tickets Vendidos
        </Button>
      </Box>

      {/* Travels Grid */}
      {activeTravels.length === 0 ? (
        <Alert severity='info' icon={<i className='tabler-info-circle' />}>
          No hay viajes disponibles en este momento.
        </Alert>
      ) : (
        <Grid container spacing={4}>
          {activeTravels.map(travel => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={travel.id}>
              <TravelsForSaleCard travel={travel} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

export default TravelsForSale
