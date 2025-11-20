'use client'

import { useState } from 'react'

import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

import CustomTextField from '@core/components/mui/TextField'
import { SeatType } from '@/types/api/buses'
import type { Seat, DeckType } from '@/types/api/buses'

interface DeckFormData {
  deck: number
  deckType: DeckType
  rows: number
  columns: number
  seats: Seat[]
}

interface StepConfiguracionProps {
  busTypeName: string
  setBusTypeName: (value: string) => void
  decks: DeckFormData[]
  setDecks: (decks: DeckFormData[]) => void
  selectedSeatTool: SeatType
  setSelectedSeatTool: (tool: SeatType) => void
  handleCellClick: (deckIndex: number, rowIndex: number, colIndex: number) => void
  updateDeckDimensions: (deckIndex: number, rows: number, columns: number) => void
  updateDeck: (index: number, field: keyof DeckFormData, value: any) => void
  handleEditSeatNumber: (deckIndex: number, rowIndex: number, colIndex: number, newNumber: string) => void
}

const DECK_TYPES = ['LEITO', 'SEMICAMA', 'CAMA', 'MIXTO'] as const

const SEAT_TOOLS = [
  { type: SeatType.SEAT, label: 'Asiento', icon: 'tabler-armchair', color: '#4CAF50' },
  { type: SeatType.AISLE, label: 'Pasillo', icon: 'tabler-arrows-horizontal', color: '#9E9E9E' },
  { type: SeatType.SPACE, label: 'Espacio', icon: 'tabler-square', color: '#E0E0E0' }
]

interface CellComponentProps {
  seat: Seat
  rowIndex: number
  colIndex: number
  onClick: () => void
  onEditNumber?: (newNumber: string) => void
}

const CellComponent: React.FC<CellComponentProps> = ({ seat, rowIndex, colIndex, onClick, onEditNumber }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editedNumber, setEditedNumber] = useState(seat.seatNumber || '')

  const handleCellClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement

    if (e.detail === 2 && seat.type === SeatType.SEAT && onEditNumber) {
      e.stopPropagation()
      setEditedNumber(seat.seatNumber || '')
      setEditDialogOpen(true)

      return
    }

    onClick()
  }

  const handleSaveNumber = () => {
    if (onEditNumber && editedNumber.trim()) {
      onEditNumber(editedNumber.trim())
    }

    setEditDialogOpen(false)
  }

  const icons: Record<SeatType, string> = {
    [SeatType.SEAT]: '',
    [SeatType.AISLE]: '═',
    [SeatType.SPACE]: ''
  }

  return (
    <>
      <Box
        onClick={handleCellClick}
        className='relative flex flex-col items-center justify-center cursor-pointer border-2 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg hover:z-10'
        sx={{
          width: '50px',
          height: '45px',
          fontSize: '11px',
          fontWeight: 600,
          borderColor: 'divider',
          backgroundColor:
            seat.type === SeatType.SEAT
              ? 'success.main'
              : seat.type === SeatType.AISLE
                ? 'action.selected'
                : 'transparent',
          color:
            seat.type === SeatType.SEAT ? 'success.contrastText' : seat.type === SeatType.AISLE ? 'text.secondary' : ''
        }}
      >
        {seat.type === SeatType.SEAT && seat.seatNumber ? (
          <span className='seat-number text-sm font-bold'>{seat.seatNumber}</span>
        ) : (
          <span style={{ fontSize: '14px' }}>{icons[seat.type]}</span>
        )}
      </Box>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle>Editar Número de Asiento</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Número de Asiento'
            type='text'
            fullWidth
            value={editedNumber}
            onChange={e => setEditedNumber(e.target.value)}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                handleSaveNumber()
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color='secondary'>
            Cancelar
          </Button>
          <Button onClick={handleSaveNumber} variant='contained' color='primary'>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

const StepConfiguracion = ({
  busTypeName,
  setBusTypeName,
  decks,
  setDecks,
  selectedSeatTool,
  setSelectedSeatTool,
  handleCellClick,
  updateDeckDimensions,
  updateDeck,
  handleEditSeatNumber
}: StepConfiguracionProps) => {
  const [numPisos, setNumPisos] = useState<1 | 2>(decks.length as 1 | 2)

  const handleNumPisosChange = (_: React.SyntheticEvent, newValue: 1 | 2) => {
    if (newValue === null) return

    setNumPisos(newValue)

    if (newValue === 1 && decks.length > 1) {
      setDecks([decks[0]])
    } else if (newValue === 2 && decks.length === 1) {
      const newSeats: Seat[] = []

      for (let row = 1; row <= 10; row++) {
        for (let col = 1; col <= 4; col++) {
          newSeats.push({ row, column: col, type: SeatType.SPACE })
        }
      }

      setDecks([...decks, { deck: 2, deckType: 'SEMICAMA' as DeckType, rows: 10, columns: 4, seats: newSeats }])
    }
  }

  return (
    <Card className='mb-6'>
      <CardHeader
        avatar={
          <Box className='w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-pink-700 flex items-center justify-center text-white'>
            <i className='tabler-layout-grid text-2xl' />
          </Box>
        }
        title={
          <Typography variant='h6' className='font-semibold'>
            Tipo y Configuración de Pisos
          </Typography>
        }
        subheader='Configure el tipo de bus y la distribución de asientos'
      />
      <CardContent>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <CustomTextField
              fullWidth
              label='Nombre del Tipo de Bus'
              placeholder='Ej: Type 1, Ejecutivo, etc.'
              value={busTypeName}
              onChange={e => setBusTypeName(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <i className='tabler-category' />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider className='my-4'>
              <Chip label='Cantidad de Pisos' icon={<i className='tabler-layers' />} color='primary' />
            </Divider>
            <div className='flex justify-center mb-4'>
              <ToggleButtonGroup value={numPisos} exclusive onChange={handleNumPisosChange} className='shadow-lg'>
                <ToggleButton value={1} className='px-8 py-3'>
                  <div className='flex items-center gap-3'>
                    <div className='w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white'>
                      <i className='tabler-number-1 text-xl' />
                    </div>
                    <Typography variant='body1' className='font-bold'>
                      UN PISO
                    </Typography>
                  </div>
                </ToggleButton>
                <ToggleButton value={2} className='px-8 py-3'>
                  <div className='flex items-center gap-3'>
                    <div className='w-9 h-9 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white'>
                      <i className='tabler-number-2 text-xl' />
                    </div>
                    <Typography variant='body1' className='font-bold'>
                      DOS PISOS
                    </Typography>
                  </div>
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider className='my-4'>
              <Chip label='Herramientas de Diseño' icon={<i className='tabler-tools' />} color='secondary' />
            </Divider>
            <div className='flex justify-center mb-4'>
              <ToggleButtonGroup
                value={selectedSeatTool}
                exclusive
                onChange={(_, newValue) => newValue && setSelectedSeatTool(newValue)}
                aria-label='seat tools'
                className='shadow-md'
              >
                {SEAT_TOOLS.map(tool => (
                  <ToggleButton
                    key={tool.type}
                    value={tool.type}
                    aria-label={tool.label}
                    sx={{
                      px: 3,
                      py: 1.5,
                      '&.Mui-selected': {
                        backgroundColor: tool.color,
                        color: 'white',
                        '&:hover': {
                          backgroundColor: tool.color
                        }
                      }
                    }}
                  >
                    <div className='flex items-center gap-2'>
                      <i className={tool.icon} style={{ fontSize: '20px' }} />
                      <Typography variant='body2' className='font-semibold'>
                        {tool.label}
                      </Typography>
                    </div>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </div>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Alert severity='info' icon={<i className='tabler-info-circle' />} className='mb-4'>
              <Typography variant='body2'>
                <strong>Instrucciones:</strong> Selecciona una herramienta y haz clic en las celdas para diseñar. Haz{' '}
                <strong>doble click</strong> en un asiento para editar su número.
              </Typography>
            </Alert>
          </Grid>

          {decks.map((deck, deckIndex) => (
            <Grid key={deckIndex} size={decks.length > 1 ? { xs: 12, md: 6 } : 12}>
              <Paper className='p-6 border-2 border-primary-500 rounded-xl shadow-lg h-full'>
                <div className='flex items-center justify-between mb-4'>
                  <Chip
                    icon={<i className='tabler-layers' />}
                    label={`Piso ${deck.deck}`}
                    color={deckIndex === 0 ? 'primary' : 'secondary'}
                    className='font-bold text-base px-4 py-5'
                  />
                  <Chip
                    label={`${deck.seats.filter(s => s.type === SeatType.SEAT).length} Asientos`}
                    color='success'
                    variant='outlined'
                    className='font-semibold'
                  />
                </div>

                <Grid container spacing={2} className='mb-4'>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <CustomTextField
                      select
                      fullWidth
                      label='Tipo de Piso'
                      value={deck.deckType}
                      onChange={e => updateDeck(deckIndex, 'deckType', e.target.value as DeckType)}
                    >
                      {DECK_TYPES.map(type => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <CustomTextField
                      fullWidth
                      type='number'
                      label='Filas'
                      placeholder='Ej: 10'
                      value={deck.rows}
                      onChange={e => {
                        const value = e.target.value
                        const numValue = value === '' ? 1 : parseInt(value, 10) || 1

                        updateDeckDimensions(deckIndex, numValue, deck.columns)
                      }}
                      inputProps={{
                        min: 1,
                        step: 1
                      }}
                      helperText='Ingrese cualquier número'
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <CustomTextField
                      fullWidth
                      type='number'
                      label='Columnas'
                      placeholder='Ej: 4'
                      value={deck.columns}
                      onChange={e => {
                        const value = e.target.value
                        const numValue = value === '' ? 1 : parseInt(value, 10) || 1

                        updateDeckDimensions(deckIndex, deck.rows, numValue)
                      }}
                      inputProps={{
                        min: 1,
                        step: 1
                      }}
                      helperText='Ingrese cualquier número'
                    />
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'action.hover',
                    borderRadius: 2,
                    overflowX: 'auto'
                  }}
                >
                  <div className='flex flex-col gap-1 items-center'>
                    {Array.from({ length: deck.rows }).map((_, rowIndex) => (
                      <div key={rowIndex} className='flex gap-1'>
                        {Array.from({ length: deck.columns }).map((_, colIndex) => {
                          const seat = deck.seats.find(s => s.row === rowIndex + 1 && s.column === colIndex + 1)

                          return seat ? (
                            <CellComponent
                              key={`${rowIndex}-${colIndex}`}
                              seat={seat}
                              rowIndex={rowIndex}
                              colIndex={colIndex}
                              onClick={() => handleCellClick(deckIndex, rowIndex, colIndex)}
                              onEditNumber={newNumber => handleEditSeatNumber(deckIndex, rowIndex, colIndex, newNumber)}
                            />
                          ) : (
                            <Box
                              key={`${rowIndex}-${colIndex}`}
                              sx={{
                                width: '50px',
                                height: '45px',
                                border: '2px dashed',
                                borderColor: 'divider',
                                borderRadius: '8px'
                              }}
                            />
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default StepConfiguracion
