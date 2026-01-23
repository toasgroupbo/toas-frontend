'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'

import { useBusById } from '@/hooks/useBuses'

interface BusDetailsDialogProps {
  open: boolean
  onClose: () => void
  busId: string | null
}

const getDeckTypeLabel = (deckType: string): string => {
  switch (deckType) {
    case 'LEITO':
      return 'Leito'
    case 'SEMICAMA':
      return 'Semicama'
    case 'CAMA':
      return 'Cama'
    case 'MIXTO':
      return 'Mixto'
    case 'suit_cama':
      return 'Suit Cama'
    default:
      return deckType
  }
}

const getEquipmentLabel = (equipment: string): string => {
  const labels: Record<string, string> = {
    wifi: 'WiFi',
    tv: 'TV',
    air_conditioning: 'Aire Acondicionado',
    bathroom: 'Baño',
    usb_charger: 'Cargador USB',
    tablet: 'Tablet'
  }

  return labels[equipment] || equipment
}

const getEquipmentIcon = (equipment: string): string => {
  const icons: Record<string, string> = {
    wifi: 'tabler-wifi',
    tv: 'tabler-device-tv',
    air_conditioning: 'tabler-air-conditioning',
    bathroom: 'tabler-toilet-paper',
    usb_charger: 'tabler-usb',
    tablet: 'tabler-device-tablet'
  }

  return icons[equipment] || 'tabler-check'
}

const BusDetailsDialog = ({ open, onClose, busId }: BusDetailsDialogProps) => {
  const { data: bus, isLoading } = useBusById(busId || undefined)

  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

    return imagePath.startsWith('http') ? imagePath : `${baseUrl}${imagePath}`
  }

  const renderSeatMap = (seats: any[]) => {
    const maxRow = Math.max(...seats.map(s => s.row))
    const maxCol = Math.max(...seats.map(s => s.column))

    const seatMap: any[][] = Array(maxRow)
      .fill(null)
      .map(() => Array(maxCol).fill(null))

    seats.forEach(seat => {
      seatMap[seat.row - 1][seat.column - 1] = seat
    })

    return (
      <Box
        sx={{
          display: 'inline-grid',
          gridTemplateColumns: `repeat(${maxCol}, 40px)`,
          gap: 0.5,
          p: 2,
          bgcolor: 'action.hover',
          borderRadius: 1
        }}
      >
        {seatMap.map((row, rowIndex) =>
          row.map((seat, colIndex) => {
            // Si no hay asiento o no tiene número de asiento, es un pasillo
            if (!seat || !seat.seatNumber) {
              return (
                <Box
                  key={`${rowIndex}-${colIndex}`}
                  sx={{
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'divider',
                    borderRadius: 0.5,
                    fontSize: '18px',
                    fontWeight: 700,
                    color: 'action.disabled'
                  }}
                >
                  =
                </Box>
              )
            }

            return (
              <Tooltip key={`${rowIndex}-${colIndex}`} title={`Asiento ${seat.seatNumber}`}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'primary.dark'
                    }
                  }}
                >
                  {seat.seatNumber}
                </Box>
              </Tooltip>
            )
          })
        )}
      </Box>
    )
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='lg' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' gap={2}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <i className='tabler-bus' style={{ fontSize: '28px', color: 'white' }} />
          </Box>
          <Box>
            <Typography variant='h5' fontWeight={600}>
              {isLoading ? 'Cargando...' : bus?.name || 'Detalles del Bus'}
            </Typography>
            {bus && (
              <Typography variant='body2' color='text.secondary'>
                {bus.brand} {bus.model} - {bus.plaque}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {isLoading ? (
          <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
            <CircularProgress />
          </Box>
        ) : bus ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 2 }}>
            {/* Imágenes */}
            <Box>
              <Typography variant='h6' fontWeight={600} sx={{ mb: 2 }}>
                Imágenes del Bus
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 1 }}>
                      Imagen Exterior
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: 250,
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      {getImageUrl(bus.exterior_image) ? (
                        <img
                          src={getImageUrl(bus.exterior_image) || ''}
                          alt='Exterior del bus'
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <Box
                          display='flex'
                          alignItems='center'
                          justifyContent='center'
                          height='100%'
                          bgcolor='action.hover'
                        >
                          <i className='tabler-photo-off' style={{ fontSize: '48px', color: 'var(--mui-palette-text-disabled)' }} />
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 1 }}>
                      Imagen Interior
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: 250,
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      {getImageUrl(bus.interior_image) ? (
                        <img
                          src={getImageUrl(bus.interior_image) || ''}
                          alt='Interior del bus'
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <Box
                          display='flex'
                          alignItems='center'
                          justifyContent='center'
                          height='100%'
                          bgcolor='action.hover'
                        >
                          <i className='tabler-photo-off' style={{ fontSize: '48px', color: 'var(--mui-palette-text-disabled)' }} />
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Información General */}
            <Box>
              <Typography variant='h6' fontWeight={600} sx={{ mb: 2 }}>
                Información General
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant='caption' color='text.secondary'>
                    Nombre
                  </Typography>
                  <Typography variant='body1' fontWeight={600}>
                    {bus.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant='caption' color='text.secondary'>
                    Placa
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={bus.plaque} color='primary' variant='tonal' size='small' sx={{ fontWeight: 600 }} />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant='caption' color='text.secondary'>
                    Marca
                  </Typography>
                  <Typography variant='body1' fontWeight={600}>
                    {bus.brand}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant='caption' color='text.secondary'>
                    Modelo
                  </Typography>
                  <Typography variant='body1' fontWeight={600}>
                    {bus.model}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant='caption' color='text.secondary'>
                    Tipo de Bus
                  </Typography>
                  <Typography variant='body1' fontWeight={600}>
                    {bus.busType.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant='caption' color='text.secondary'>
                    Cantidad de Pisos
                  </Typography>
                  <Typography variant='body1' fontWeight={600}>
                    {bus.busType.decks.length > 1 ? 'Dos pisos' : 'Un piso'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Equipamiento */}
            <Box>
              <Typography variant='h6' fontWeight={600} sx={{ mb: 2 }}>
                Equipamiento
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {bus.equipment.map((item, index) => (
                  <Chip
                    key={index}
                    icon={<i className={getEquipmentIcon(item)} />}
                    label={getEquipmentLabel(item)}
                    variant='outlined'
                    color='primary'
                  />
                ))}
              </Box>
            </Box>

            <Divider />

            {/* Propietario */}
            <Box>
              <Typography variant='h6' fontWeight={600} sx={{ mb: 2 }}>
                Propietario
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant='caption' color='text.secondary'>
                    Nombre
                  </Typography>
                  <Typography variant='body1' fontWeight={600}>
                    {bus.owner.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant='caption' color='text.secondary'>
                    CI
                  </Typography>
                  <Typography variant='body1' fontWeight={600}>
                    {bus.owner.ci}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant='caption' color='text.secondary'>
                    Teléfono
                  </Typography>
                  <Typography variant='body1' fontWeight={600}>
                    {bus.owner.phone}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Configuración de Asientos */}
            <Box>
              <Typography variant='h6' fontWeight={600} sx={{ mb: 2, textAlign: 'center' }}>
                Configuración de Asientos
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  gap: 4,
                  flexWrap: 'wrap'
                }}
              >
                {bus.busType.decks.map((deck, deckIndex) => (
                  <Box key={deckIndex} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                      <Chip
                        label={`Piso ${deck.deck}`}
                        color={deckIndex === 0 ? 'primary' : 'secondary'}
                        variant='tonal'
                        size='small'
                      />
                      <Chip label={getDeckTypeLabel(deck.deckType)} variant='outlined' size='small' />
                      {deck.price && (
                        <Chip
                          label={`Bs. ${deck.price}`}
                          variant='outlined'
                          size='small'
                          color='info'
                          icon={<i className='tabler-currency-dollar' />}
                        />
                      )}
                      <Chip
                        label={`${deck.seats.filter(s => s.type === 'seat').length} asientos`}
                        variant='outlined'
                        size='small'
                        color='success'
                      />
                    </Box>
                    {renderSeatMap(deck.seats)}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        ) : (
          <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
            <Typography variant='body1' color='text.secondary'>
              No se encontró información del bus
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant='contained' color='primary' fullWidth>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BusDetailsDialog
