'use client'

import { Box, Typography, Chip, Paper, Tooltip, useMediaQuery, useTheme } from '@mui/material'

import type { TravelSeat } from '@/types/api/travels'

interface BusSeatMapProps {
  seats: TravelSeat[]
  deck: number
  deckPrice: string
  selectedSeats: Set<string>
  onSeatToggle: (seatId: string) => void
  totalDecks?: number
}

const BusSeatMap = ({ seats, deck, deckPrice, selectedSeats, onSeatToggle, totalDecks = 1 }: BusSeatMapProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  const deckSeats = seats.filter(seat => seat.deck === deck)

  if (deckSeats.length === 0) {
    return null
  }

  const maxRow = Math.max(...deckSeats.map(s => s.row))
  const maxCol = Math.max(...deckSeats.map(s => s.column))

  const totalSeats = deckSeats.length
  let seatSize = 60

  if (totalSeats > 40) {
    seatSize = 45
  } else if (totalSeats > 30) {
    seatSize = 50
  } else if (totalSeats > 20) {
    seatSize = 55
  }

  // Ajustar tamaño para móvil y tablet
  if (isMobile) {
    seatSize = Math.min(seatSize, 38)
  } else if (isTablet) {
    seatSize = Math.min(seatSize, 48)
  }

  const seatMatrix: (TravelSeat | null)[][] = Array(maxRow)
    .fill(null)
    .map(() => Array(maxCol).fill(null))

  deckSeats.forEach(seat => {
    if (seat.row > 0 && seat.column > 0) {
      seatMatrix[seat.row - 1][seat.column - 1] = seat
    }
  })

  const isSeat = (seat: TravelSeat) => {
    return seat.type === 'seat'
  }

  const getSeatColor = (seat: TravelSeat) => {
    const seatId = String(seat.id)

    if (selectedSeats.has(seatId)) {
      return 'primary.main'
    }

    const status = seat.status.toLowerCase()

    if (status === 'available' || status === 'libre') {
      return 'success.light'
    }

    if (status === 'reserved' || status === 'reservado' || status === 'pending_payment') {
      return 'warning.light'
    }

    if (status === 'sold' || status === 'vendido') {
      return 'error.light'
    }

    return 'grey.400'
  }

  const getSeatBorderColor = (seat: TravelSeat) => {
    const seatId = String(seat.id)

    if (selectedSeats.has(seatId)) {
      return 'primary.main'
    }

    const status = seat.status.toLowerCase()

    if (status === 'available' || status === 'libre') {
      return 'success.main'
    }

    if (status === 'reserved' || status === 'reservado' || status === 'pending_payment') {
      return 'warning.main'
    }

    if (status === 'sold' || status === 'vendido') {
      return 'error.main'
    }

    return 'grey.600'
  }

  const getSeatIconColor = (seat: TravelSeat, isSelected: boolean) => {
    if (isSelected) return '#fff'

    const status = seat.status.toLowerCase()

    if (status === 'available' || status === 'libre') {
      return '#2e7d32'
    }

    if (status === 'reserved' || status === 'reservado' || status === 'pending_payment') {
      return '#ed6c02'
    }

    if (status === 'sold' || status === 'vendido') {
      return '#d32f2f'
    }

    return '#757575'
  }

  const getSeatStatusText = (seat: TravelSeat) => {
    const status = seat.status.toLowerCase()

    if (status === 'available' || status === 'libre') {
      return 'Disponible'
    }

    if (status === 'reserved' || status === 'reservado' || status === 'pending_payment') {
      return 'Reservado'
    }

    if (status === 'sold' || status === 'vendido') {
      return 'Vendido'
    }

    return 'No disponible'
  }

  const isSeatAvailable = (seat: TravelSeat) => {
    const status = seat.status.toLowerCase()

    return status === 'available' || status === 'libre'
  }

  return (
    <Box>
      <Box display='flex' alignItems='center' gap={1} mb={2}>
        <i className={deck === 2 ? 'tabler-stairs-up' : 'tabler-stairs-down'} />
        <Typography variant='subtitle1' fontWeight={600}>
          Piso {deck}
        </Typography>
        <Chip label={`Bs. ${deckPrice}`} size='small' color='info' variant='tonal' />
      </Box>

      {/* Bus container */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2, md: 3 },
          bgcolor: 'action.hover',
          border: '2px solid',
          borderColor: 'divider',
          borderRadius: 2,
          position: 'relative',
          overflowX: 'auto'
        }}
      >
        {/* Bus front indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'info.main',
            color: 'white',
            px: 2,
            py: 0.5,
            borderRadius: '0 0 8px 8px',
            fontSize: '12px',
            fontWeight: 600
          }}
        >
          <i className='tabler-steering-wheel' style={{ marginRight: 4 }} />
          FRENTE
        </Box>

        {/* Seat grid */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            mt: 4
          }}
        >
          {seatMatrix.map((row, rowIndex) => (
            <Box
              key={rowIndex}
              sx={{
                display: 'flex',
                gap: 1,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {row.map((seat, colIndex) => {
                // Si no hay seat, mostrar espacio completamente vacío (nada en la matriz)
                if (!seat) {
                  return (
                    <Box
                      key={`empty-${colIndex}`}
                      sx={{
                        width: seatSize,
                        height: seatSize,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1,
                        opacity: 0.3,
                        background:
                          'repeating-linear-gradient(45deg, transparent, transparent 4px, var(--mui-palette-divider) 4px, var(--mui-palette-divider) 8px)',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          inset: 0,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          opacity: 0.3
                        }
                      }}
                    />
                  )
                }

                // Si es pasillo, mostrar cuadrado con ícono de flechas
                if (seat.type === 'aisle') {
                  return (
                    <Box
                      key={`aisle-${seat.id}`}
                      sx={{
                        width: seatSize,
                        height: seatSize,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'action.hover',
                        border: '2px dashed',
                        borderColor: 'divider',
                        borderRadius: 2
                      }}
                    >
                      <i
                        className='tabler-arrows-left-right'
                        style={{
                          fontSize: `${seatSize * 0.35}px`,
                          color: 'var(--mui-palette-text-disabled)'
                        }}
                      />
                    </Box>
                  )
                }

                if (seat.type !== 'seat' || !seat.seatNumber) {
                  return (
                    <Box
                      key={`structural-${seat.id}`}
                      sx={{
                        width: seatSize,
                        height: seatSize,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1,
                        opacity: 0.4,
                        background:
                          'repeating-linear-gradient(45deg, transparent, transparent 4px, var(--mui-palette-divider) 4px, var(--mui-palette-divider) 8px)',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          inset: 0,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          opacity: 0.5
                        }
                      }}
                    />
                  )
                }

                const isAvailable = isSeatAvailable(seat)
                const isSelected = selectedSeats.has(String(seat.id))

                let displayPrice = seat.price

                if (!displayPrice || parseFloat(displayPrice) === 0) {
                  displayPrice = deckPrice
                }

                return (
                  <Tooltip
                    key={seat.id}
                    title={
                      <Box>
                        <Typography variant='caption' fontWeight={600} sx={{ color: 'inherit' }}>
                          Asiento {seat.seatNumber}
                        </Typography>
                        <Typography variant='caption' display='block' sx={{ color: 'inherit' }}>
                          Precio: Bs. {displayPrice}
                        </Typography>
                        <Typography variant='caption' display='block' sx={{ color: 'inherit' }}>
                          Estado: {getSeatStatusText(seat)}
                        </Typography>
                      </Box>
                    }
                    arrow
                    componentsProps={{
                      tooltip: {
                        sx: {
                          bgcolor: 'grey.800',
                          color: 'common.white',
                          '& .MuiTooltip-arrow': {
                            color: 'grey.800'
                          }
                        }
                      }
                    }}
                  >
                    <Box
                      onClick={() => isAvailable && onSeatToggle(String(seat.id))}
                      sx={{
                        width: seatSize,
                        height: seatSize,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: getSeatColor(seat),
                        border: '2px solid',
                        borderColor: getSeatBorderColor(seat),
                        borderRadius: 2,
                        cursor: isAvailable ? 'pointer' : 'not-allowed',
                        opacity: isAvailable ? 1 : 0.5,
                        transition: 'all 0.2s ease',
                        '&:hover': isAvailable
                          ? {
                              transform: 'scale(1.1)',
                              boxShadow: 2,
                              zIndex: 1
                            }
                          : {},
                        position: 'relative'
                      }}
                    >
                      <i
                        className='tabler-armchair'
                        style={{
                          fontSize: `${seatSize * 0.4}px`,
                          color: getSeatIconColor(seat, isSelected)
                        }}
                      />
                      <Typography
                        variant='caption'
                        fontWeight={600}
                        sx={{
                          color: getSeatIconColor(seat, isSelected),
                          fontSize: `${seatSize * 0.18}px`
                        }}
                      >
                        {seat.seatNumber}
                      </Typography>
                    </Box>
                  </Tooltip>
                )
              })}
            </Box>
          ))}
        </Box>

        {/* Legend */}
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 1, sm: 2 },
            justifyContent: 'center',
            mt: { xs: 2, sm: 3 },
            flexWrap: 'wrap'
          }}
        >
          <Box display='flex' alignItems='center' gap={0.5}>
            <Box
              sx={{
                width: { xs: 14, sm: 20 },
                height: { xs: 14, sm: 20 },
                bgcolor: 'success.light',
                border: '2px solid',
                borderColor: 'success.main',
                borderRadius: 1
              }}
            />
            <Typography variant='caption' sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>Disponible</Typography>
          </Box>
          <Box display='flex' alignItems='center' gap={0.5}>
            <Box
              sx={{
                width: { xs: 14, sm: 20 },
                height: { xs: 14, sm: 20 },
                bgcolor: 'primary.main',
                border: '2px solid',
                borderColor: 'primary.main',
                borderRadius: 1
              }}
            />
            <Typography variant='caption' sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>Seleccionado</Typography>
          </Box>
          <Box display='flex' alignItems='center' gap={0.5}>
            <Box
              sx={{
                width: { xs: 14, sm: 20 },
                height: { xs: 14, sm: 20 },
                bgcolor: 'warning.light',
                border: '2px solid',
                borderColor: 'warning.main',
                borderRadius: 1
              }}
            />
            <Typography variant='caption' sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>Reservado</Typography>
          </Box>
          <Box display='flex' alignItems='center' gap={0.5}>
            <Box
              sx={{
                width: { xs: 14, sm: 20 },
                height: { xs: 14, sm: 20 },
                bgcolor: 'error.light',
                border: '2px solid',
                borderColor: 'error.main',
                borderRadius: 1
              }}
            />
            <Typography variant='caption' sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>Vendido</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default BusSeatMap
