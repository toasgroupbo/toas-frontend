'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Tooltip from '@mui/material/Tooltip'
import Collapse from '@mui/material/Collapse'
import Alert from '@mui/material/Alert'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Badge from '@mui/material/Badge'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import CustomTextField from '@core/components/mui/TextField'

type CellType = 'empty' | 'seat' | 'aisle' | 'driver' | 'door' | 'bathroom' | 'wall'

interface Cell {
  type: CellType
  seatNumber?: string
  price?: number
  priceType?: 'normal' | 'preferencial' | 'habitado'
}

interface BusFormData {
  placa: string
  marca: string
  modelo: string
  year: string
  tipo: string
  cantidadAsientosPiso1: string
  cantidadFilasPiso1: string
  cantidadAsientosPiso2: string
  cantidadFilasPiso2: string
  imagenInterior?: string
  imagenExterior?: string
}

interface Props {
  busId?: number
}

const TOOLS = [
  { type: 'seat' as CellType, label: 'Asiento', icon: 'tabler-armchair', color: '#4CAF50' },
  { type: 'aisle' as CellType, label: 'Pasillo', icon: 'tabler-arrows-horizontal', color: '#9E9E9E' },
  { type: 'driver' as CellType, label: 'Conductor', icon: 'tabler-steering-wheel', color: '#795548' },
  { type: 'door' as CellType, label: 'Puerta', icon: 'tabler-door', color: '#8BC34A' },
  { type: 'bathroom' as CellType, label: 'Baño', icon: 'tabler-wash', color: '#9C27B0' },
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
          width: '50px',
          height: '45px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: '2px solid',
          borderColor: 'divider',
          borderRadius: '8px',
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: colors[cell.type],
          color: cell.type === 'empty' || cell.type === 'aisle' ? '#666' : 'white',
          position: 'relative',
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'scale(1.08)',
            boxShadow: 4,
            zIndex: 10
          }
        }}
      >
        <span style={{ fontSize: '14px' }}>{icons[cell.type]}</span>
        {cell.price && (
          <Chip
            label={`${cell.price}`}
            size='small'
            sx={{
              position: 'absolute',
              bottom: 2,
              fontSize: '8px',
              height: '14px',
              backgroundColor: cell.priceType ? priceColors[cell.priceType] : undefined,
              color: 'white',
              fontWeight: 700
            }}
          />
        )}
      </Box>
    </Tooltip>
  )
}

const FormularioBus: React.FC<Props> = ({ busId }) => {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(0)

  const [formData, setFormData] = useState<BusFormData>({
    placa: '',
    marca: '',
    modelo: '',
    year: '',
    tipo: '',
    cantidadAsientosPiso1: '5',
    cantidadFilasPiso1: '5',
    cantidadAsientosPiso2: '6',
    cantidadFilasPiso2: '6'
  })

  const [imagenInteriorPreview, setImagenInteriorPreview] = useState<string>('')
  const [imagenExteriorPreview, setImagenExteriorPreview] = useState<string>('')
  const [tipoPiso, setTipoPiso] = useState<'uno' | 'dos'>('dos')
  const [selectedTool, setSelectedTool] = useState<CellType>('seat')
  const [layoutPiso1, setLayoutPiso1] = useState<Cell[][]>([])
  const [layoutPiso2, setLayoutPiso2] = useState<Cell[][]>([])

  /* const [priceDialogOpen, setPriceDialogOpen] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{ piso: 1 | 2; row: number; col: number } | null>(null)
  const [tempPrice, setTempPrice] = useState('')
  const [tempPriceType, setTempPriceType] = useState<'normal' | 'preferencial' | 'habitado'>('normal') */

  const [precioGlobal, setPrecioGlobal] = useState('')
  const [tipoPrecioGlobal, setTipoPrecioGlobal] = useState<'normal' | 'preferencial' | 'habitado'>('normal')

  useEffect(() => {
    const filasPiso1 = parseInt(formData.cantidadFilasPiso1) || 5
    const colsPiso1 = parseInt(formData.cantidadAsientosPiso1) || 5
    const filasPiso2 = parseInt(formData.cantidadFilasPiso2) || 6
    const colsPiso2 = parseInt(formData.cantidadAsientosPiso2) || 5

    const initLayout = (rows: number, cols: number): Cell[][] => {
      return Array(rows)
        .fill(null)
        .map(() =>
          Array(cols)
            .fill(null)
            .map(() => ({ type: 'empty' as CellType }))
        )
    }

    setLayoutPiso1(initLayout(filasPiso1, colsPiso1))
    setLayoutPiso2(initLayout(filasPiso2, colsPiso2))
  }, [
    formData.cantidadFilasPiso1,
    formData.cantidadAsientosPiso1,
    formData.cantidadFilasPiso2,
    formData.cantidadAsientosPiso2
  ])

  useEffect(() => {
    const filas = parseInt(formData.cantidadFilasPiso1) || 5
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

    setLayoutPiso1(initLayout(filas))
    setLayoutPiso2(initLayout(parseInt(formData.cantidadFilasPiso2) || 6))
  }, [formData.cantidadFilasPiso1, formData.cantidadFilasPiso2])

  const handleChange = (field: keyof BusFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImagenInteriorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      const reader = new FileReader()

      reader.onloadend = () => {
        setImagenInteriorPreview(reader.result as string)
        handleChange('imagenInterior', reader.result as string)
      }

      reader.readAsDataURL(file)
    }
  }

  const handleImagenExteriorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      const reader = new FileReader()

      reader.onloadend = () => {
        setImagenExteriorPreview(reader.result as string)
        handleChange('imagenExterior', reader.result as string)
      }

      reader.readAsDataURL(file)
    }
  }

  const handleCellClick = (piso: 1 | 2, rowIndex: number, colIndex: number) => {
    const layout = piso === 1 ? layoutPiso1 : layoutPiso2
    const setLayout = piso === 1 ? setLayoutPiso1 : setLayoutPiso2

    const newLayout = layout.map((row, rIdx) =>
      row.map((cell, cIdx) => {
        if (rIdx === rowIndex && cIdx === colIndex) {
          if (selectedTool === 'seat') {
            const seatCount = layout.flat().filter(c => c.type === 'seat').length + 1

            return {
              type: 'seat' as CellType,
              seatNumber: seatCount.toString(),
              price: parseFloat(precioGlobal) || 0,
              priceType: tipoPrecioGlobal
            }
          } else {
            return { type: selectedTool }
          }
        }

        return cell
      })
    )

    setLayout(newLayout)
  }

  const applyPreset = (piso: 1 | 2, preset: 'bus_2+2' | 'bus_cama') => {
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

    if (piso === 1) {
      setLayoutPiso1(presets[preset]())
    } else {
      setLayoutPiso2(presets[preset]())
    }
  }

  const handleGuardarBus = () => {
    const config = {
      ...formData,
      tipoPiso,
      layoutPiso1,
      layoutPiso2
    }

    console.log('Bus guardado:', config)
    alert('✅ Bus guardado exitosamente')
    router.push('/buses/list')
  }

  const totalSeatsPiso1 = layoutPiso1.flat().filter(c => c.type === 'seat').length
  const totalSeatsPiso2 = layoutPiso2.flat().filter(c => c.type === 'seat').length
  const steps = ['Datos Generales', 'Imágenes', 'Tipo y Pisos', 'Configurar Asientos']

  return (
    <>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Collapse in={activeStep === 0}>
            <Card sx={{ mb: 3 }}>
              <CardHeader
                avatar={
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}
                  >
                    <i className='tabler-info-circle' style={{ fontSize: '24px' }} />
                  </Box>
                }
                title={
                  <Typography variant='h6' fontWeight={600}>
                    Información del Bus
                  </Typography>
                }
                subheader='Datos básicos del vehículo'
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <CustomTextField
                      fullWidth
                      label='Placa'
                      placeholder='2543KDF'
                      value={formData.placa}
                      onChange={e => handleChange('placa', e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start'>
                            <i className='tabler-license' />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <CustomTextField
                      fullWidth
                      label='Marca'
                      placeholder='Nissan'
                      value={formData.marca}
                      onChange={e => handleChange('marca', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <CustomTextField
                      fullWidth
                      label='Modelo'
                      placeholder='Civilian'
                      value={formData.modelo}
                      onChange={e => handleChange('modelo', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <CustomTextField
                      fullWidth
                      label='Año'
                      placeholder='2023'
                      value={formData.year}
                      onChange={e => handleChange('year', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      select
                      fullWidth
                      label='Tipo'
                      value={formData.tipo}
                      onChange={e => handleChange('tipo', e.target.value)}
                    >
                      <MenuItem value=''>Seleccionar...</MenuItem>
                      <MenuItem value='Leito'>Leito</MenuItem>
                      <MenuItem value='Semi-Leito'>Semi-Leito</MenuItem>
                      <MenuItem value='Ejecutivo'>Ejecutivo</MenuItem>
                      <MenuItem value='Cama'>Cama</MenuItem>
                    </CustomTextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Collapse>

          <Collapse in={activeStep === 1}>
            <Card sx={{ mb: 3 }}>
              <CardHeader
                avatar={
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}
                  >
                    <i className='tabler-photo' style={{ fontSize: '24px' }} />
                  </Box>
                }
                title={
                  <Typography variant='h6' fontWeight={600}>
                    Imágenes del Bus
                  </Typography>
                }
                subheader='Fotografías interior y exterior'
              />
              <CardContent>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography
                      variant='subtitle1'
                      sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <i className='tabler-camera' />
                      Imagen Interior
                    </Typography>
                    <Box
                      sx={{
                        border: '3px dashed',
                        borderColor: 'primary.main',
                        borderRadius: 3,
                        p: 3,
                        textAlign: 'center',
                        position: 'relative',
                        minHeight: 220,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': {
                          borderColor: 'secondary.main',
                          transform: 'scale(1.02)'
                        }
                      }}
                    >
                      {imagenInteriorPreview ? (
                        <>
                          <img
                            src={imagenInteriorPreview}
                            alt='Interior'
                            style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }}
                          />
                          <IconButton
                            size='small'
                            onClick={e => {
                              e.stopPropagation()
                              setImagenInteriorPreview('')
                            }}
                            sx={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              bgcolor: 'error.main',
                              color: 'white',
                              '&:hover': { bgcolor: 'error.dark' }
                            }}
                          >
                            <i className='tabler-trash' />
                          </IconButton>
                        </>
                      ) : (
                        <Box>
                          <i className='tabler-cloud-upload' style={{ fontSize: '64px', opacity: 0.3 }} />
                          <Typography variant='body1' color='text.primary' fontWeight={600} sx={{ mt: 2 }}>
                            Click para cargar imagen
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            JPG, PNG o GIF (Max 5MB)
                          </Typography>
                        </Box>
                      )}
                      <input
                        type='file'
                        accept='image/*'
                        onChange={handleImagenInteriorChange}
                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                      />
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography
                      variant='subtitle1'
                      sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <i className='tabler-camera' />
                      Imagen Exterior
                    </Typography>
                    <Box
                      sx={{
                        border: '3px dashed',
                        borderColor: 'success.main',
                        borderRadius: 3,
                        p: 3,
                        textAlign: 'center',
                        position: 'relative',
                        minHeight: 220,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(139,195,74,0.1) 100%)',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': {
                          borderColor: 'warning.main',
                          transform: 'scale(1.02)'
                        }
                      }}
                    >
                      {imagenExteriorPreview ? (
                        <>
                          <img
                            src={imagenExteriorPreview}
                            alt='Exterior'
                            style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }}
                          />
                          <IconButton
                            size='small'
                            onClick={e => {
                              e.stopPropagation()
                              setImagenExteriorPreview('')
                            }}
                            sx={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              bgcolor: 'error.main',
                              color: 'white',
                              '&:hover': { bgcolor: 'error.dark' }
                            }}
                          >
                            <i className='tabler-trash' />
                          </IconButton>
                        </>
                      ) : (
                        <Box>
                          <i className='tabler-cloud-upload' style={{ fontSize: '64px', opacity: 0.3 }} />
                          <Typography variant='body1' color='text.primary' fontWeight={600} sx={{ mt: 2 }}>
                            Click para cargar imagen
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            JPG, PNG o GIF (Max 5MB)
                          </Typography>
                        </Box>
                      )}
                      <input
                        type='file'
                        accept='image/*'
                        onChange={handleImagenExteriorChange}
                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Collapse>

          <Collapse in={activeStep === 2}>
            <Card>
              <CardHeader
                avatar={
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      boxShadow: 3
                    }}
                  >
                    <i className='tabler-building' style={{ fontSize: '28px' }} />
                  </Box>
                }
                title={
                  <Typography variant='h5' fontWeight={700}>
                    Tipo de Bus y Dimensiones del Grid
                  </Typography>
                }
                subheader='Define el tipo de bus y las dimensiones del área de trabajo'
                sx={{ pb: 0 }}
              />
              <CardContent>
                <Grid container spacing={6}>
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant='subtitle1'
                        fontWeight={700}
                        sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <i className='tabler-directions' style={{ fontSize: '20px' }} />
                        Selecciona el Tipo de Bus
                      </Typography>
                      <ToggleButtonGroup
                        value={tipoPiso}
                        exclusive
                        onChange={(_, newValue) => newValue && setTipoPiso(newValue)}
                        fullWidth
                        sx={{
                          '& .MuiToggleButton-root': {
                            py: 2.5,
                            fontSize: '16px',
                            fontWeight: 700,
                            border: '2px solid',
                            borderColor: 'divider',
                            '&.Mui-selected': {
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              borderColor: 'primary.main',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                              }
                            }
                          }
                        }}
                      >
                        <ToggleButton value='uno'>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '8px',
                                bgcolor: tipoPiso === 'uno' ? 'rgba(255,255,255,0.2)' : 'action.selected',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <i className='tabler-number-1' style={{ fontSize: '22px' }} />
                            </Box>
                            UN PISO
                          </Box>
                        </ToggleButton>
                        <ToggleButton value='dos'>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '8px',
                                bgcolor: tipoPiso === 'dos' ? 'rgba(255,255,255,0.2)' : 'action.selected',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <i className='tabler-number-2' style={{ fontSize: '22px' }} />
                            </Box>
                            DOS PISOS
                          </Box>
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Box>

                    <Alert severity='info' icon={<i className='tabler-info-circle' />} sx={{ mt: 3 }}>
                      <Typography variant='body2'>
                        <strong>Importante:</strong> Define las dimensiones del grid. En el siguiente paso podrás
                        diseñar la disposición de asientos y otros elementos.
                      </Typography>
                    </Alert>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Divider>
                      <Chip
                        label='Dimensiones del Grid'
                        icon={<i className='tabler-grid-dots' />}
                        color='primary'
                        variant='outlined'
                      />
                    </Divider>
                  </Grid>

                  <Grid size={{ xs: 12, md: tipoPiso === 'dos' ? 6 : 12 }}>
                    <Card variant='outlined' sx={{ height: '100%', borderWidth: 2, borderColor: 'primary.main' }}>
                      <CardHeader
                        avatar={
                          <Chip
                            icon={<i className='tabler-number-1' />}
                            label='Piso 1'
                            color='primary'
                            sx={{ fontWeight: 700 }}
                          />
                        }
                        title={
                          <Typography variant='h6' fontWeight={700}>
                            Dimensiones Piso 1
                          </Typography>
                        }
                        sx={{
                          background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)'
                        }}
                      />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomTextField
                              fullWidth
                              type='number'
                              label='Cantidad de Filas'
                              placeholder='Ej: 10'
                              value={formData.cantidadFilasPiso1}
                              onChange={e => handleChange('cantidadFilasPiso1', e.target.value)}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position='start'>
                                    <i className='tabler-layout-rows' style={{ fontSize: '22px' }} />
                                  </InputAdornment>
                                )
                              }}
                              inputProps={{ min: 1, max: 20 }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomTextField
                              fullWidth
                              type='number'
                              label='Cantidad de Columnas'
                              placeholder='Ej: 5'
                              value={formData.cantidadAsientosPiso1}
                              onChange={e => handleChange('cantidadAsientosPiso1', e.target.value)}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position='start'>
                                    <i className='tabler-layout-columns' style={{ fontSize: '22px' }} />
                                  </InputAdornment>
                                )
                              }}
                              inputProps={{ min: 1, max: 10 }}
                            />
                          </Grid>
                        </Grid>

                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            mt: 3,
                            bgcolor: 'action.hover',
                            border: '2px dashed',
                            borderColor: 'primary.main',
                            borderRadius: 2
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography
                              variant='subtitle2'
                              fontWeight={700}
                              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                            >
                              <i className='tabler-eye' />
                              Vista Previa del Grid
                            </Typography>
                            <Chip
                              size='small'
                              label={`${parseInt(formData.cantidadFilasPiso1) || 0} × ${parseInt(formData.cantidadAsientosPiso1) || 0}`}
                              color='primary'
                              variant='tonal'
                            />
                          </Box>

                          <Box
                            sx={{
                              bgcolor: 'background.paper',
                              p: 2,
                              borderRadius: 2,
                              boxShadow: 1,
                              maxHeight: 400,
                              overflow: 'auto'
                            }}
                          >
                            <Box
                              sx={{
                                display: 'inline-block',
                                p: 2,
                                bgcolor: 'grey.50',
                                borderRadius: 2,
                                border: '2px solid',
                                borderColor: 'divider'
                              }}
                            >
                              <Typography
                                variant='caption'
                                fontWeight={700}
                                sx={{
                                  display: 'block',
                                  textAlign: 'center',
                                  mb: 1,
                                  color: 'primary.main'
                                }}
                              >
                                🚍 FRENTE
                              </Typography>

                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {Array(Math.min(parseInt(formData.cantidadFilasPiso1) || 1, 20))
                                  .fill(null)
                                  .map((_, rowIdx) => (
                                    <Box key={rowIdx} sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                      <Typography
                                        variant='caption'
                                        fontWeight={700}
                                        sx={{ width: '20px', textAlign: 'center', color: 'text.secondary' }}
                                      >
                                        {rowIdx + 1}
                                      </Typography>
                                      {Array(Math.min(parseInt(formData.cantidadAsientosPiso1) || 1, 10))
                                        .fill(null)
                                        .map((_, colIdx) => (
                                          <Box
                                            key={colIdx}
                                            sx={{
                                              width: '32px',
                                              height: '28px',
                                              bgcolor: 'grey.300',
                                              borderRadius: 1,
                                              border: '2px solid',
                                              borderColor: 'background.paper',
                                              boxShadow: 1,
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              color: 'text.secondary',
                                              fontSize: '10px',
                                              fontWeight: 600
                                            }}
                                          >
                                            {colIdx + 1}
                                          </Box>
                                        ))}
                                    </Box>
                                  ))}
                              </Box>

                              <Typography
                                variant='caption'
                                fontWeight={700}
                                sx={{
                                  display: 'block',
                                  textAlign: 'center',
                                  mt: 1,
                                  color: 'text.secondary'
                                }}
                              >
                                TRASERA
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                              size='small'
                              icon={<i className='tabler-grid-dots' style={{ fontSize: '14px' }} />}
                              label={`${(parseInt(formData.cantidadFilasPiso1) || 0) * (parseInt(formData.cantidadAsientosPiso1) || 0)} celdas totales`}
                              color='primary'
                              variant='tonal'
                            />
                            <Chip
                              size='small'
                              icon={<i className='tabler-layout-rows' style={{ fontSize: '14px' }} />}
                              label={`${parseInt(formData.cantidadFilasPiso1) || 0} filas`}
                              color='info'
                              variant='tonal'
                            />
                            <Chip
                              size='small'
                              icon={<i className='tabler-layout-columns' style={{ fontSize: '14px' }} />}
                              label={`${parseInt(formData.cantidadAsientosPiso1) || 0} columnas`}
                              color='info'
                              variant='tonal'
                            />
                          </Box>
                        </Paper>
                      </CardContent>
                    </Card>
                  </Grid>

                  {tipoPiso === 'dos' && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Card variant='outlined' sx={{ height: '100%', borderWidth: 2, borderColor: 'warning.main' }}>
                        <CardHeader
                          avatar={
                            <Chip
                              icon={<i className='tabler-number-2' />}
                              label='Piso 2'
                              color='warning'
                              sx={{ fontWeight: 700 }}
                            />
                          }
                          title={
                            <Typography variant='h6' fontWeight={700}>
                              Dimensiones Piso 2
                            </Typography>
                          }
                          sx={{
                            background: 'linear-gradient(135deg, rgba(255,152,0,0.1) 0%, rgba(255,193,7,0.1) 100%)'
                          }}
                        />
                        <CardContent>
                          <Grid container spacing={3}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <CustomTextField
                                fullWidth
                                type='number'
                                label='Cantidad de Filas'
                                placeholder='Ej: 10'
                                value={formData.cantidadFilasPiso2}
                                onChange={e => handleChange('cantidadFilasPiso2', e.target.value)}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position='start'>
                                      <i className='tabler-layout-rows' style={{ fontSize: '22px' }} />
                                    </InputAdornment>
                                  )
                                }}
                                inputProps={{ min: 1, max: 20 }}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <CustomTextField
                                fullWidth
                                type='number'
                                label='Cantidad de Columnas'
                                placeholder='Ej: 5'
                                value={formData.cantidadAsientosPiso2}
                                onChange={e => handleChange('cantidadAsientosPiso2', e.target.value)}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position='start'>
                                      <i className='tabler-layout-columns' style={{ fontSize: '22px' }} />
                                    </InputAdornment>
                                  )
                                }}
                                inputProps={{ min: 1, max: 10 }}
                              />
                            </Grid>
                          </Grid>

                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              mt: 3,
                              bgcolor: 'action.hover',
                              border: '2px dashed',
                              borderColor: 'warning.main',
                              borderRadius: 2
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                              <Typography
                                variant='subtitle2'
                                fontWeight={700}
                                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                              >
                                <i className='tabler-eye' />
                                Vista Previa del Grid
                              </Typography>
                              <Chip
                                size='small'
                                label={`${parseInt(formData.cantidadFilasPiso2) || 0} × ${parseInt(formData.cantidadAsientosPiso2) || 0}`}
                                color='warning'
                                variant='tonal'
                              />
                            </Box>

                            <Box
                              sx={{
                                bgcolor: 'background.paper',
                                p: 2,
                                borderRadius: 2,
                                boxShadow: 1,
                                maxHeight: 400,
                                overflow: 'auto'
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'inline-block',
                                  p: 2,
                                  bgcolor: 'grey.50',
                                  borderRadius: 2,
                                  border: '2px solid',
                                  borderColor: 'divider'
                                }}
                              >
                                <Typography
                                  variant='caption'
                                  fontWeight={700}
                                  sx={{
                                    display: 'block',
                                    textAlign: 'center',
                                    mb: 1,
                                    color: 'warning.main'
                                  }}
                                >
                                  🚍 FRENTE
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  {Array(Math.min(parseInt(formData.cantidadFilasPiso2) || 1, 20))
                                    .fill(null)
                                    .map((_, rowIdx) => (
                                      <Box key={rowIdx} sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                        <Typography
                                          variant='caption'
                                          fontWeight={700}
                                          sx={{ width: '20px', textAlign: 'center', color: 'text.secondary' }}
                                        >
                                          {rowIdx + 1}
                                        </Typography>
                                        {Array(Math.min(parseInt(formData.cantidadAsientosPiso2) || 1, 10))
                                          .fill(null)
                                          .map((_, colIdx) => (
                                            <Box
                                              key={colIdx}
                                              sx={{
                                                width: '32px',
                                                height: '28px',
                                                bgcolor: 'grey.300',
                                                borderRadius: 1,
                                                border: '2px solid',
                                                borderColor: 'background.paper',
                                                boxShadow: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'text.secondary',
                                                fontSize: '10px',
                                                fontWeight: 600
                                              }}
                                            >
                                              {colIdx + 1}
                                            </Box>
                                          ))}
                                      </Box>
                                    ))}
                                </Box>

                                <Typography
                                  variant='caption'
                                  fontWeight={700}
                                  sx={{
                                    display: 'block',
                                    textAlign: 'center',
                                    mt: 1,
                                    color: 'text.secondary'
                                  }}
                                >
                                  TRASERA
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip
                                size='small'
                                icon={<i className='tabler-grid-dots' style={{ fontSize: '14px' }} />}
                                label={`${(parseInt(formData.cantidadFilasPiso2) || 0) * (parseInt(formData.cantidadAsientosPiso2) || 0)} celdas totales`}
                                color='warning'
                                variant='tonal'
                              />
                              <Chip
                                size='small'
                                icon={<i className='tabler-layout-rows' style={{ fontSize: '14px' }} />}
                                label={`${parseInt(formData.cantidadFilasPiso2) || 0} filas`}
                                color='info'
                                variant='tonal'
                              />
                              <Chip
                                size='small'
                                icon={<i className='tabler-layout-columns' style={{ fontSize: '14px' }} />}
                                label={`${parseInt(formData.cantidadAsientosPiso2) || 0} columnas`}
                                color='info'
                                variant='tonal'
                              />
                            </Box>
                          </Paper>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}

                  <Grid size={{ xs: 12 }}>
                    <Paper
                      sx={{
                        p: 3,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        borderRadius: 2
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '12px',
                            bgcolor: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <i className='tabler-calculator' style={{ fontSize: '32px' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant='h6' fontWeight={700} gutterBottom>
                            Total de Celdas del Grid
                          </Typography>
                          <Typography variant='body2' sx={{ opacity: 0.9 }}>
                            Celdas disponibles para diseñar la disposición del bus
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant='h3' fontWeight={800}>
                            {(parseInt(formData.cantidadFilasPiso1) || 0) *
                              (parseInt(formData.cantidadAsientosPiso1) || 0) +
                              (tipoPiso === 'dos'
                                ? (parseInt(formData.cantidadFilasPiso2) || 0) *
                                  (parseInt(formData.cantidadAsientosPiso2) || 0)
                                : 0)}
                          </Typography>
                          <Typography variant='caption' sx={{ opacity: 0.9 }}>
                            celdas totales
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Collapse>
          <Collapse in={activeStep === 3}>
            <Card>
              <CardHeader
                avatar={
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      background: theme =>
                        theme.palette.mode === 'dark'
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 2
                    }}
                  >
                    <i className='tabler-layout' style={{ fontSize: '28px', color: 'white' }} />
                  </Box>
                }
                title={
                  <Typography variant='h5' fontWeight={700}>
                    Diseño de Asientos
                  </Typography>
                }
                subheader='Configura el precio y diseña la disposición de los asientos'
                sx={{ pb: 2 }}
              />
              <CardContent>
              
                <Card
                  variant='outlined'
                  sx={{
                    mb: 4,
                    borderWidth: 2,
                    borderColor: 'warning.main',
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      background: theme =>
                        theme.palette.mode === 'dark'
                          ? 'linear-gradient(135deg, rgba(255, 234, 167, 0.08) 0%, rgba(253, 203, 110, 0.08) 100%)'
                          : 'linear-gradient(135deg, rgba(255, 234, 167, 0.3) 0%, rgba(253, 203, 110, 0.2) 100%)',
                      borderBottom: '2px solid',
                      borderColor: 'warning.main',
                      p: 3
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 3
                        }}
                      >
                        <i className='tabler-coin' style={{ fontSize: '32px', color: '#fff' }} />
                      </Box>
                      <Box>
                        <Typography variant='h6' fontWeight={700}>
                          Configuración de Precio Global
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          Este precio se aplicará a todos los asientos que crees
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <CardContent sx={{ pt: 3 }}>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <CustomTextField
                          fullWidth
                          label='Precio de los Asientos'
                          type='number'
                          value={precioGlobal}
                          onChange={e => setPrecioGlobal(e.target.value)}
                          placeholder='Ej: 50'
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position='start'>
                                <i className='tabler-currency-dollar' style={{ fontSize: '22px' }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position='end'>
                                <Typography variant='body2' fontWeight={600} color='text.secondary'>
                                  Bs
                                </Typography>
                              </InputAdornment>
                            )
                          }}
                          inputProps={{ min: 0, step: 0.5 }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                          {precioGlobal ? (
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                width: '100%',
                                background: theme =>
                                  theme.palette.mode === 'dark'
                                    ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(139, 195, 74, 0.15) 100%)'
                                    : 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%)',
                                border: '2px solid',
                                borderColor: 'success.main',
                                borderRadius: 2
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Box
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: '10px',
                                      bgcolor: 'success.main',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <i className='tabler-check' style={{ fontSize: '24px', color: 'white' }} />
                                  </Box>
                                  <Box>
                                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                                      Precio Configurado
                                    </Typography>
                                    <Typography variant='h6' fontWeight={700} color='success.main'>
                                      Bs {precioGlobal}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Chip
                                  label='Activo'
                                  size='small'
                                  color='success'
                                  icon={<i className='tabler-circle-check-filled' />}
                                />
                              </Box>
                            </Paper>
                          ) : (
                            <Alert severity='info' icon={<i className='tabler-info-circle' />} sx={{ width: '100%' }}>
                              <Typography variant='body2'>Ingresa un precio para comenzar a crear asientos</Typography>
                            </Alert>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Divider sx={{ my: 4 }}>
                  <Chip
                    label='Diseño de Pisos'
                    icon={<i className='tabler-layout-grid' />}
                    color='primary'
                    sx={{ fontWeight: 600, px: 2 }}
                  />
                </Divider>

                {/* DISEÑO DE PISOS */}
                {[1, ...(tipoPiso === 'dos' ? [2] : [])].map(piso => {
                  const currentLayout = piso === 1 ? layoutPiso1 : layoutPiso2
                  const totalSeats = currentLayout.flat().filter(c => c.type === 'seat').length
                  const pisoColor = piso === 1 ? 'primary' : 'warning'

                  return (
                    <Box key={piso} sx={{ mb: 4 }}>
                      {/* HEADER DEL PISO */}
                      <Paper
                        elevation={0}
                        sx={{
                          mb: 2,
                          p: 2.5,
                          background: theme =>
                            theme.palette.mode === 'dark'
                              ? piso === 1
                                ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%)'
                                : 'linear-gradient(135deg, rgba(255, 152, 0, 0.12) 0%, rgba(255, 193, 7, 0.12) 100%)'
                              : piso === 1
                                ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)'
                                : 'linear-gradient(135deg, rgba(255, 152, 0, 0.08) 0%, rgba(255, 193, 7, 0.08) 100%)',
                          border: '2px solid',
                          borderColor: `${pisoColor}.main`,
                          borderRadius: 2
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 2
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Badge
                              badgeContent={totalSeats}
                              color='success'
                              max={999}
                              sx={{
                                '& .MuiBadge-badge': {
                                  right: -8,
                                  top: 8,
                                  fontWeight: 700,
                                  fontSize: '12px',
                                  minWidth: '24px',
                                  height: '24px'
                                }
                              }}
                            >
                              <Box
                                sx={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: '12px',
                                  background: `${pisoColor}.main`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  boxShadow: 2
                                }}
                              >
                                <i className={`tabler-number-${piso}`} style={{ fontSize: '28px' }} />
                              </Box>
                            </Badge>
                            <Box>
                              <Typography variant='h6' fontWeight={700}>
                                Piso {piso}
                              </Typography>
                              <Typography variant='caption' color='text.secondary'>
                                {totalSeats} asientos configurados
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title='Aplicar diseño 2+2 (estándar)' arrow>
                              <Button
                                size='small'
                                variant='outlined'
                                color={pisoColor}
                                startIcon={<i className='tabler-template' />}
                                onClick={() => applyPreset(piso as 1 | 2, 'bus_2+2')}
                                sx={{ fontWeight: 600 }}
                              >
                                Preset 2+2
                              </Button>
                            </Tooltip>
                            <Tooltip title='Aplicar diseño tipo cama' arrow>
                              <Button
                                size='small'
                                variant='outlined'
                                color={pisoColor}
                                startIcon={<i className='tabler-bed' />}
                                onClick={() => applyPreset(piso as 1 | 2, 'bus_cama')}
                                sx={{ fontWeight: 600 }}
                              >
                                Preset Cama
                              </Button>
                            </Tooltip>
                          </Box>
                        </Box>
                      </Paper>

                      {/* GRID DEL BUS */}
                      <Paper
                        elevation={3}
                        sx={{
                          p: 3,
                          background: theme =>
                            theme.palette.mode === 'dark'
                              ? 'linear-gradient(135deg, rgba(38, 38, 38, 0.6) 0%, rgba(66, 66, 66, 0.6) 100%)'
                              : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                          borderRadius: 3,
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Indicador FRENTE */}
                        <Box
                          sx={{
                            backgroundColor: `${pisoColor}.main`,
                            color: 'white',
                            padding: '14px',
                            borderRadius: '16px 16px 0 0',
                            textAlign: 'center',
                            fontWeight: 700,
                            fontSize: '15px',
                            mb: 3,
                            boxShadow: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1
                          }}
                        >
                          <i className='tabler-steering-wheel' style={{ fontSize: '20px' }} />
                          FRENTE DEL BUS
                        </Box>

                        {/* Grid de asientos */}
                        <Box
                          sx={{
                            display: 'inline-block',
                            padding: 3,
                            backgroundColor: 'background.paper',
                            borderRadius: 3,
                            border: '3px solid',
                            borderColor: 'divider',
                            boxShadow: theme => (theme.palette.mode === 'dark' ? 6 : 4),
                            maxWidth: '100%',
                            overflowX: 'auto'
                          }}
                        >
                          {currentLayout.map((row, rowIndex) => (
                            <Box key={rowIndex} sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                              {/* Numeración de filas */}
                              <Box
                                sx={{
                                  width: '40px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  fontSize: '13px',
                                  color: `${pisoColor}.main`,
                                  backgroundColor: 'action.hover',
                                  borderRadius: '8px',
                                  mr: 0.5
                                }}
                              >
                                F{rowIndex + 1}
                              </Box>

                              {/* Celdas */}
                              {row.map((cell, colIndex) => (
                                <CellComponent
                                  key={`${rowIndex}-${colIndex}`}
                                  cell={cell}
                                  rowIndex={rowIndex}
                                  colIndex={colIndex}
                                  onClick={() => handleCellClick(piso as 1 | 2, rowIndex, colIndex)}
                                />
                              ))}
                            </Box>
                          ))}
                        </Box>

                     
                        <Box
                          sx={{
                            backgroundColor: 'grey.800',
                            color: 'white',
                            padding: '14px',
                            borderRadius: '0 0 16px 16px',
                            textAlign: 'center',
                            fontWeight: 700,
                            fontSize: '15px',
                            mt: 3,
                            boxShadow: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1
                          }}
                        >
                          PARTE TRASERA
                          <i className='tabler-arrow-badge-down' style={{ fontSize: '20px' }} />
                        </Box>
                      </Paper>

                     
                      {piso < (tipoPiso === 'dos' ? 2 : 1) && (
                        <Divider sx={{ my: 5 }}>
                          <Chip
                            icon={<i className='tabler-chevron-down' />}
                            label='Siguiente Piso'
                            variant='outlined'
                            color='primary'
                          />
                        </Divider>
                      )}
                    </Box>
                  )
                })}
              </CardContent>
            </Card>
          </Collapse>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardHeader
              avatar={<i className='tabler-tool' style={{ fontSize: '24px' }} />}
              title={
                <Typography variant='h6' fontWeight={600}>
                  Panel de Control
                </Typography>
              }
            />
            <CardContent>
              {activeStep === 3 && (
                <>
                  <Typography variant='subtitle2' fontWeight={600} gutterBottom>
                    Herramientas de Diseño
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

                  
                  <Paper
                    sx={{
                      p: 2,
                      mb: 2,
                      background: 'linear-gradient(135deg, #ff0303ff 0%, #990909ff 100%)',
                      color: '#333'
                    }}
                  >
                    <Typography
                      variant='subtitle2'
                      fontWeight={700}
                      gutterBottom
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <i className='tabler-coin' />
                      Precio Configurado
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography variant='h4' fontWeight={800}>
                        Bs {precioGlobal || '0'}
                      </Typography>
                      <Chip
                        label={tipoPrecioGlobal}
                        size='small'
                        sx={{
                          bgcolor:
                            tipoPrecioGlobal === 'normal'
                              ? '#231d0aff'
                              : tipoPrecioGlobal === 'preferencial'
                                ? '#FF5722'
                                : '#00BCD4',
                          color: 'white',
                          fontWeight: 700,
                          textTransform: 'capitalize'
                        }}
                      />
                    </Box>
                  </Paper>

                  <Alert severity='info' icon={<i className='tabler-info-circle' />} sx={{ mb: 2 }}>
                    <Typography variant='caption'>
                      <strong>Tip:</strong> Selecciona la herramienta ASIENTO y haz click en el grid para crear asientos
                      con el precio configurado
                    </Typography>
                  </Alert>

                  <Paper sx={{ p: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <Typography variant='subtitle2' fontWeight={700} gutterBottom>
                      📊 Estadísticas
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant='body2'>Piso 1:</Typography>
                      <Chip
                        label={`${totalSeatsPiso1} asientos`}
                        size='small'
                        sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 700 }}
                      />
                    </Box>
                    {tipoPiso === 'dos' && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant='body2'>Piso 2:</Typography>
                        <Chip
                          label={`${totalSeatsPiso2} asientos`}
                          size='small'
                          sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 700 }}
                        />
                      </Box>
                    )}
                    <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.3)' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant='body2' fontWeight={700}>
                        Total:
                      </Typography>
                      <Chip
                        label={`${totalSeatsPiso1 + totalSeatsPiso2} asientos`}
                        size='small'
                        sx={{ bgcolor: '#4CAF50', color: 'white', fontWeight: 700 }}
                      />
                    </Box>
                  </Paper>
                </>
              )}

              {activeStep < 3 && (
                <Alert severity='success' icon={<i className='tabler-check' />}>
                  <Typography variant='body2'>Completa esta sección y continúa</Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
            <Button
              variant='outlined'
              size='large'
              onClick={() => router.push('/buses/list')}
              startIcon={<i className='tabler-arrow-left' />}
            >
              Cancelar
            </Button>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                disabled={activeStep === 0}
                onClick={() => setActiveStep(prev => prev - 1)}
                variant='outlined'
                size='large'
              >
                Anterior
              </Button>

              {activeStep < steps.length - 1 ? (
                <Button
                  variant='contained'
                  size='large'
                  onClick={() => setActiveStep(prev => prev + 1)}
                  endIcon={<i className='tabler-arrow-right' />}
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  variant='contained'
                  color='success'
                  size='large'
                  onClick={handleGuardarBus}
                  startIcon={<i className='tabler-device-floppy' />}
                  sx={{ minWidth: 200 }}
                >
                  Guardar Bus
                </Button>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/*  <Dialog
        open={priceDialogOpen}
        onClose={() => setPriceDialogOpen(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 10
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className='tabler-coin' style={{ fontSize: '24px' }} />
            </Box>
            <Box>
              <Typography variant='h6' fontWeight={700}>
                Configurar Precio
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Define el precio y tipo para este asiento
              </Typography>
            </Box>
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <i className='tabler-currency-dollar' />
                  </InputAdornment>
                )
              }}
            />

            <Typography variant='subtitle2' fontWeight={600} gutterBottom>
              Tipo de Precio
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Paper
                onClick={() => setTempPriceType('normal')}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: tempPriceType === 'normal' ? '#FFC107' : 'divider',
                  background:
                    tempPriceType === 'normal'
                      ? 'linear-gradient(135deg, rgba(255,193,7,0.1) 0%, rgba(255,193,7,0.2) 100%)'
                      : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#FFC107',
                    transform: 'scale(1.02)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 24, height: 24, backgroundColor: '#FFC107', borderRadius: '50%' }} />
                  <Box>
                    <Typography variant='body1' fontWeight={600}>
                      Precio Normal
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Asiento estándar
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <Paper
                onClick={() => setTempPriceType('preferencial')}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: tempPriceType === 'preferencial' ? '#FF5722' : 'divider',
                  background:
                    tempPriceType === 'preferencial'
                      ? 'linear-gradient(135deg, rgba(255,87,34,0.1) 0%, rgba(255,87,34,0.2) 100%)'
                      : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#FF5722',
                    transform: 'scale(1.02)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 24, height: 24, backgroundColor: '#FF5722', borderRadius: '50%' }} />
                  <Box>
                    <Typography variant='body1' fontWeight={600}>
                      Precio Preferencial
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Asiento premium
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <Paper
                onClick={() => setTempPriceType('habitado')}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: tempPriceType === 'habitado' ? '#00BCD4' : 'divider',
                  background:
                    tempPriceType === 'habitado'
                      ? 'linear-gradient(135deg, rgba(0,188,212,0.1) 0%, rgba(0,188,212,0.2) 100%)'
                      : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#00BCD4',
                    transform: 'scale(1.02)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 24, height: 24, backgroundColor: '#00BCD4', borderRadius: '50%' }} />
                  <Box>
                    <Typography variant='body1' fontWeight={600}>
                      Precio Normal Habitado
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Con servicios adicionales
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setPriceDialogOpen(false)} variant='outlined' size='large'>
            Cancelar
          </Button>
          <Button
            variant='contained'
            onClick={handleSavePrice}
            disabled={!tempPrice}
            size='large'
            startIcon={<i className='tabler-check' />}
          >
            Guardar Precio
          </Button>
        </DialogActions>
      </Dialog> */}
    </>
  )
}

export default FormularioBus
