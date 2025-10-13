'use client'

import { useState, useEffect } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'

import CustomTextField from '@core/components/mui/TextField'

type CellType = 'empty' | 'seat' | 'aisle' | 'driver' | 'door' | 'bathroom' | 'wall'

interface Cell {
  type: CellType
  seatNumber?: string
  price?: number
  priceType?: 'normal' | 'preferencial' | 'habitado'
}

interface Props {
  open: boolean
  onClose: () => void
  busData: {
    placa: string
    marca: string
    filas: number
    tipoPiso: 'uno' | 'dos'
  }
  onSave: (layouts: { piso1: Cell[][]; piso2: Cell[][] }) => void
}

const TOOLS = [
  { type: 'seat' as CellType, label: 'Asiento', icon: 'tabler-armchair', color: '#4CAF50' },
  { type: 'aisle' as CellType, label: 'Pasillo', icon: 'tabler-arrows-horizontal', color: '#9E9E9E' },
  { type: 'driver' as CellType, label: 'Conductor', icon: 'tabler-steering-wheel', color: '#795548' },
  { type: 'door' as CellType, label: 'Puerta', icon: 'tabler-door', color: '#8BC34A' },
  { type: 'bathroom' as CellType, label: 'Baño', icon: 'tabler-wash', color: '#9C27B0' },
  { type: 'wall' as CellType, label: 'Pared', icon: 'tabler-wall', color: '#424242' },
  { type: 'empty' as CellType, label: 'Vacío', icon: 'tabler-x', color: '#E0E0E0' }
]

interface CellComponentProps {
  cell: Cell
  rowIndex: number
  colIndex: number
  onClick: () => void
}

const CellComponent: React.FC<CellComponentProps> = ({ cell, rowIndex, colIndex, onClick }) => {
  const colors: Record<CellType, string> = {
    seat: '#4CAF50',
    aisle: '#E0E0E0',
    driver: '#795548',
    door: '#8BC34A',
    bathroom: '#9C27B0',
    wall: '#424242',
    empty: 'transparent'
  }

  const icons: Record<CellType, string> = {
    seat: cell.seatNumber || '💺',
    aisle: '═',
    driver: '🚗',
    door: '🚪',
    bathroom: '🚻',
    wall: '▓',
    empty: ''
  }

  const priceColors = {
    normal: '#FFC107',
    preferencial: '#FF5722',
    habitado: '#00BCD4'
  }

  return (
    <Tooltip title={`F${rowIndex + 1}, C${colIndex + 1}`} arrow>
      <Box
        onClick={onClick}
        sx={{
          width: '45px',
          height: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: 600,
          backgroundColor: colors[cell.type],
          color: cell.type === 'empty' || cell.type === 'aisle' ? '#666' : 'white',
          position: 'relative',
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: 2
          }
        }}
      >
        <span style={{ fontSize: '13px' }}>{icons[cell.type]}</span>
        {cell.price && (
          <Chip
            label={cell.price}
            size='small'
            sx={{
              position: 'absolute',
              bottom: 1,
              fontSize: '7px',
              height: '12px',
              backgroundColor: cell.priceType ? priceColors[cell.priceType] : undefined,
              color: 'white'
            }}
          />
        )}
      </Box>
    </Tooltip>
  )
}

const ConfiguradorAsientosModal: React.FC<Props> = ({ open, onClose, busData, onSave }) => {
  const [selectedTool, setSelectedTool] = useState<CellType>('seat')
  const [selectedPiso, setSelectedPiso] = useState<1 | 2>(1)
  const [layoutPiso1, setLayoutPiso1] = useState<Cell[][]>([])
  const [layoutPiso2, setLayoutPiso2] = useState<Cell[][]>([])
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [priceDialogOpen, setPriceDialogOpen] = useState(false)
  const [tempPrice, setTempPrice] = useState('')
  const [tempPriceType, setTempPriceType] = useState<'normal' | 'preferencial' | 'habitado'>('normal')

  useEffect(() => {
    if (open) {
      const cols = 5

      const initLayout = (rows: number): Cell[][] => {
        return Array(rows)
          .fill(null)
          .map(() =>
            Array(cols)
              .fill(null)
              .map(() => ({ type: 'empty' as CellType }))
          )
      }

      setLayoutPiso1(initLayout(busData.filas))
      setLayoutPiso2(initLayout(busData.filas + 1))
    }
  }, [open, busData.filas])

  const handleCellClick = (piso: 1 | 2, rowIndex: number, colIndex: number) => {
    const layout = piso === 1 ? layoutPiso1 : layoutPiso2
    const setLayout = piso === 1 ? setLayoutPiso1 : setLayoutPiso2

    const newLayout = layout.map((row, rIdx) =>
      row.map((cell, cIdx) => {
        if (rIdx === rowIndex && cIdx === colIndex) {
          if (selectedTool === 'seat') {
            setSelectedCell({ row: rowIndex, col: colIndex })
            setPriceDialogOpen(true)

            return cell
          } else {
            return { type: selectedTool }
          }
        }

        return cell
      })
    )

    setLayout(newLayout)
  }

  const handleSavePrice = () => {
    if (!selectedCell) return

    const layout = selectedPiso === 1 ? layoutPiso1 : layoutPiso2
    const setLayout = selectedPiso === 1 ? setLayoutPiso1 : setLayoutPiso2

    const newLayout = layout.map((row, rIdx) =>
      row.map((cell, cIdx) => {
        if (rIdx === selectedCell.row && cIdx === selectedCell.col) {
          const seatCount = layout.flat().filter(c => c.type === 'seat').length + 1

          return {
            type: 'seat' as CellType,
            seatNumber: seatCount.toString(),
            price: parseFloat(tempPrice) || 0,
            priceType: tempPriceType
          }
        }

        return cell
      })
    )

    setLayout(newLayout)
    setPriceDialogOpen(false)
    setTempPrice('')
    setSelectedCell(null)
  }

  const applyPreset = (preset: 'bus_2+2' | 'bus_cama') => {
    const presets = {
      'bus_2+2': (): Cell[][] => {
        const layout: Cell[][] = []

        for (let i = 0; i < 10; i++) {
          layout.push([
            { type: i === 0 ? ('driver' as CellType) : ('seat' as CellType) },
            { type: 'seat' as CellType },
            { type: i === 0 ? ('door' as CellType) : ('aisle' as CellType) },
            { type: 'seat' as CellType },
            { type: 'seat' as CellType }
          ])
        }

        return layout
      },
      bus_cama: (): Cell[][] => {
        const layout: Cell[][] = []

        for (let i = 0; i < 8; i++) {
          layout.push([
            { type: 'seat' as CellType },
            { type: 'aisle' as CellType },
            { type: 'seat' as CellType },
            { type: 'seat' as CellType },
            { type: 'empty' as CellType }
          ])
        }

        return layout
      }
    }

    if (selectedPiso === 1) {
      setLayoutPiso1(presets[preset]())
    } else {
      setLayoutPiso2(presets[preset]())
    }
  }

  const clearLayout = () => {
    if (window.confirm('¿Limpiar todo el diseño?')) {
      const layout = selectedPiso === 1 ? layoutPiso1 : layoutPiso2
      const setLayout = selectedPiso === 1 ? setLayoutPiso1 : setLayoutPiso2

      setLayout(layout.map(row => row.map(() => ({ type: 'empty' as CellType }))))
    }
  }

  const handleSaveConfiguration = () => {
    onSave({ piso1: layoutPiso1, piso2: layoutPiso2 })
  }

  const currentLayout = selectedPiso === 1 ? layoutPiso1 : layoutPiso2
  const totalSeats = currentLayout.flat().filter(c => c.type === 'seat').length

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth='xl'
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className='tabler-layout' style={{ fontSize: '24px' }} />
              <Typography variant='h6'>
                Configurador de Asientos - {busData.placa} - Piso {selectedPiso}
              </Typography>
            </Box>

            {busData.tipoPiso === 'dos' && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size='small'
                  variant={selectedPiso === 1 ? 'contained' : 'outlined'}
                  onClick={() => setSelectedPiso(1)}
                  startIcon={<i className='tabler-number-1' />}
                >
                  Piso 1
                </Button>
                <Button
                  size='small'
                  variant={selectedPiso === 2 ? 'contained' : 'outlined'}
                  onClick={() => setSelectedPiso(2)}
                  startIcon={<i className='tabler-number-2' />}
                >
                  Piso 2
                </Button>
              </Box>
            )}
          </Box>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Paper sx={{ p: 2, position: 'sticky', top: 0 }}>
                <Typography variant='subtitle2' fontWeight={600} gutterBottom>
                  Herramientas
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                  {TOOLS.map(tool => (
                    <Button
                      key={tool.type}
                      size='small'
                      variant={selectedTool === tool.type ? 'contained' : 'outlined'}
                      onClick={() => setSelectedTool(tool.type)}
                      startIcon={<i className={tool.icon} />}
                      sx={{
                        justifyContent: 'flex-start',
                        backgroundColor: selectedTool === tool.type ? tool.color : undefined,
                        borderColor: tool.color,
                        color: selectedTool === tool.type ? 'white' : tool.color,
                        '&:hover': {
                          backgroundColor: tool.color,
                          color: 'white'
                        }
                      }}
                    >
                      {tool.label}
                    </Button>
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant='subtitle2' fontWeight={600} gutterBottom>
                  Presets
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                  <Button
                    size='small'
                    variant='outlined'
                    startIcon={<i className='tabler-template' />}
                    onClick={() => applyPreset('bus_2+2')}
                  >
                    Bus 2+2
                  </Button>
                  <Button
                    size='small'
                    variant='outlined'
                    startIcon={<i className='tabler-bed' />}
                    onClick={() => applyPreset('bus_cama')}
                  >
                    Bus Cama
                  </Button>
                  <Button
                    size='small'
                    variant='outlined'
                    color='error'
                    startIcon={<i className='tabler-trash' />}
                    onClick={clearLayout}
                  >
                    Limpiar
                  </Button>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Paper sx={{ p: 2, backgroundColor: 'success.lighter' }}>
                  <Typography variant='subtitle2' fontWeight={600} gutterBottom>
                    Estadísticas
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant='body2'>Total asientos:</Typography>
                    <Chip label={totalSeats} color='success' size='small' />
                  </Box>
                </Paper>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 9 }}>
              <Paper sx={{ p: 3 }}>
                <Box
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px 8px 0 0',
                    textAlign: 'center',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  FRENTE DEL BUS
                </Box>

                <Box
                  sx={{
                    display: 'inline-block',
                    padding: 3,
                    backgroundColor: 'action.hover',
                    borderRadius: 2,
                    border: '3px solid',
                    borderColor: 'divider'
                  }}
                >
                  {currentLayout.map((row, rowIndex) => (
                    <Box key={rowIndex} sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                      <Box
                        sx={{
                          width: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          fontSize: '11px',
                          color: 'text.secondary'
                        }}
                      >
                        F{rowIndex + 1}
                      </Box>

                      {row.map((cell, colIndex) => (
                        <CellComponent
                          key={`${rowIndex}-${colIndex}`}
                          cell={cell}
                          rowIndex={rowIndex}
                          colIndex={colIndex}
                          onClick={() => handleCellClick(selectedPiso, rowIndex, colIndex)}
                        />
                      ))}
                    </Box>
                  ))}
                </Box>

                <Box
                  sx={{
                    backgroundColor: 'grey.700',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '0 0 8px 8px',
                    textAlign: 'center',
                    fontWeight: 600,
                    mt: 2
                  }}
                >
                  PARTE TRASERA
                </Box>

                <Paper sx={{ p: 2, mt: 3 }}>
                  <Typography variant='subtitle2' fontWeight={600} gutterBottom>
                    Leyenda
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {TOOLS.map(tool => (
                      <Box key={tool.type} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            backgroundColor: tool.color,
                            borderRadius: 1
                          }}
                        />
                        <Typography variant='body2'>{tool.label}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color='secondary' variant='outlined'>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveConfiguration}
            variant='contained'
            color='success'
            startIcon={<i className='tabler-check' />}
          >
            Guardar Configuración
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={priceDialogOpen} onClose={() => setPriceDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <i className='tabler-coin' style={{ fontSize: '24px' }} />
            Configurar Precio del Asiento
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <CustomTextField
              fullWidth
              label='Precio (Bs)'
              type='number'
              value={tempPrice}
              onChange={e => setTempPrice(e.target.value)}
              sx={{ mb: 3 }}
              placeholder='Ej: 50'
            />

            <Typography variant='subtitle2' fontWeight={600} gutterBottom>
              Tipo de Precio
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant={tempPriceType === 'normal' ? 'contained' : 'outlined'}
                onClick={() => setTempPriceType('normal')}
                sx={{
                  justifyContent: 'flex-start',
                  backgroundColor: tempPriceType === 'normal' ? '#FFC107' : undefined,
                  color: tempPriceType === 'normal' ? 'white' : '#FFC107',
                  borderColor: '#FFC107',
                  '&:hover': { backgroundColor: '#FFC107', color: 'white' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Box sx={{ width: 16, height: 16, backgroundColor: '#FFC107', borderRadius: '50%' }} />
                  Precio Normal
                </Box>
              </Button>
              <Button
                variant={tempPriceType === 'preferencial' ? 'contained' : 'outlined'}
                onClick={() => setTempPriceType('preferencial')}
                sx={{
                  justifyContent: 'flex-start',
                  backgroundColor: tempPriceType === 'preferencial' ? '#FF5722' : undefined,
                  color: tempPriceType === 'preferencial' ? 'white' : '#FF5722',
                  borderColor: '#FF5722',
                  '&:hover': { backgroundColor: '#FF5722', color: 'white' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Box sx={{ width: 16, height: 16, backgroundColor: '#FF5722', borderRadius: '50%' }} />
                  Precio Preferencial
                </Box>
              </Button>
              <Button
                variant={tempPriceType === 'habitado' ? 'contained' : 'outlined'}
                onClick={() => setTempPriceType('habitado')}
                sx={{
                  justifyContent: 'flex-start',
                  backgroundColor: tempPriceType === 'habitado' ? '#00BCD4' : undefined,
                  color: tempPriceType === 'habitado' ? 'white' : '#00BCD4',
                  borderColor: '#00BCD4',
                  '&:hover': { backgroundColor: '#00BCD4', color: 'white' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Box sx={{ width: 16, height: 16, backgroundColor: '#00BCD4', borderRadius: '50%' }} />
                  Precio Normal Habitado
                </Box>
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPriceDialogOpen(false)}>Cancelar</Button>
          <Button variant='contained' onClick={handleSavePrice} disabled={!tempPrice}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ConfiguradorAsientosModal
