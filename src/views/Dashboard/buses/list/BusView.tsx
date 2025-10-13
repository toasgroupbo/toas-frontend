'use client'

import { useState } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Badge from '@mui/material/Badge'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Alert from '@mui/material/Alert'

type CellType = 'empty' | 'seat' | 'aisle' | 'driver' | 'door' | 'bathroom' | 'wall'

interface Cell {
  type: CellType
  seatNumber?: string
  price?: number
  priceType?: 'normal' | 'preferencial' | 'habitado'
}

interface BusData {
  placa: string
  marca: string
  modelo: string
  year: string
  tipo: string
  tipoPiso: 'uno' | 'dos'
  cantidadFilasPiso1: string
  cantidadAsientosPiso1: string
  cantidadFilasPiso2?: string
  cantidadAsientosPiso2?: string
  layoutPiso1: Cell[][]
  layoutPiso2?: Cell[][]
  imagenInterior?: string
  imagenExterior?: string
  precioGlobal?: string
}

interface Props {
  open: boolean
  onClose: () => void
  busData: BusData | null
}

const BusDetailModal: React.FC<Props> = ({ open, onClose, busData }) => {
  const [currentView, setCurrentView] = useState<'general' | 'layout' | 'stats'>('general')

  if (!busData) return null

  const totalSeatsPiso1 = busData.layoutPiso1?.flat().filter(c => c.type === 'seat').length || 0
  const totalSeatsPiso2 = busData.layoutPiso2?.flat().filter(c => c.type === 'seat').length || 0
  const totalSeats = totalSeatsPiso1 + totalSeatsPiso2

  const totalAislesPiso1 = busData.layoutPiso1?.flat().filter(c => c.type === 'aisle').length || 0
  const totalAislesPiso2 = busData.layoutPiso2?.flat().filter(c => c.type === 'aisle').length || 0

  const totalDoorsPiso1 = busData.layoutPiso1?.flat().filter(c => c.type === 'door').length || 0
  const totalDoorsPiso2 = busData.layoutPiso2?.flat().filter(c => c.type === 'door').length || 0

  const totalBathroomsPiso1 = busData.layoutPiso1?.flat().filter(c => c.type === 'bathroom').length || 0
  const totalBathroomsPiso2 = busData.layoutPiso2?.flat().filter(c => c.type === 'bathroom').length || 0

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
    seat: '💺',
    aisle: '═',
    driver: '🚗',
    door: '🚪',
    bathroom: '🚻',
    wall: '▓',
    empty: ''
  }

  const renderMiniCell = (cell: Cell) => (
    <Box
      sx={{
        width: '35px',
        height: '32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid',
        borderColor: 'divider',
        borderRadius: '6px',
        fontSize: '10px',
        fontWeight: 600,
        backgroundColor: colors[cell.type],
        color: cell.type === 'empty' || cell.type === 'aisle' ? '#666' : 'white',
        position: 'relative'
      }}
    >
      <span style={{ fontSize: '12px' }}>{icons[cell.type]}</span>
      {cell.seatNumber && (
        <Typography variant='caption' sx={{ fontSize: '8px', fontWeight: 700 }}>
          {cell.seatNumber}
        </Typography>
      )}
    </Box>
  )

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='lg'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 3
              }}
            >
              <i className='tabler-bus' style={{ fontSize: '32px', color: 'white' }} />
            </Box>
            <Box>
              <Typography variant='h5' fontWeight={700}>
                Detalles del Bus
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {busData.placa} • {busData.marca} {busData.modelo}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size='small'>
            <i className='tabler-x' />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
          <Button
            variant={currentView === 'general' ? 'contained' : 'outlined'}
            size='small'
            startIcon={<i className='tabler-info-circle' />}
            onClick={() => setCurrentView('general')}
            sx={{ flex: 1 }}
          >
            General
          </Button>
          <Button
            variant={currentView === 'layout' ? 'contained' : 'outlined'}
            size='small'
            startIcon={<i className='tabler-layout-grid' />}
            onClick={() => setCurrentView('layout')}
            sx={{ flex: 1 }}
          >
            Distribución
          </Button>
          <Button
            variant={currentView === 'stats' ? 'contained' : 'outlined'}
            size='small'
            startIcon={<i className='tabler-chart-bar' />}
            onClick={() => setCurrentView('stats')}
            sx={{ flex: 1 }}
          >
            Estadísticas
          </Button>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        {currentView === 'general' && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant='outlined'>
                <CardContent>
                  <Typography
                    variant='h6'
                    fontWeight={700}
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <i className='tabler-file-description' />
                    Información Básica
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant='body2' color='text.secondary'>
                        Placa:
                      </Typography>
                      <Chip label={busData.placa} color='primary' size='small' />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant='body2' color='text.secondary'>
                        Marca:
                      </Typography>
                      <Typography variant='body2' fontWeight={600}>
                        {busData.marca}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant='body2' color='text.secondary'>
                        Modelo:
                      </Typography>
                      <Typography variant='body2' fontWeight={600}>
                        {busData.modelo}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant='body2' color='text.secondary'>
                        Año:
                      </Typography>
                      <Typography variant='body2' fontWeight={600}>
                        {busData.year}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant='body2' color='text.secondary'>
                        Tipo:
                      </Typography>
                      <Chip label={busData.tipo} color='secondary' size='small' />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant='body2' color='text.secondary'>
                        Configuración:
                      </Typography>
                      <Chip
                        label={busData.tipoPiso === 'uno' ? '1 Piso' : '2 Pisos'}
                        color='info'
                        size='small'
                        icon={<i className={`tabler-number-${busData.tipoPiso === 'uno' ? '1' : '2'}`} />}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant='outlined'>
                <CardContent>
                  <Typography
                    variant='h6'
                    fontWeight={700}
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <i className='tabler-users' />
                    Capacidad
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Paper
                      sx={{
                        p: 2,
                        background: theme =>
                          theme.palette.mode === 'dark'
                            ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(139, 195, 74, 0.15) 100%)'
                            : 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%)',
                        border: '2px solid',
                        borderColor: 'success.main',
                        borderRadius: 2
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant='caption' color='text.secondary' fontWeight={600}>
                          PISO 1
                        </Typography>
                        <Chip label={`${totalSeatsPiso1} asientos`} size='small' color='success' />
                      </Box>
                      <Typography variant='caption' color='text.secondary'>
                        Filas: {busData.cantidadFilasPiso1} × Columnas: {busData.cantidadAsientosPiso1}
                      </Typography>
                    </Paper>

                    {busData.tipoPiso === 'dos' && (
                      <Paper
                        sx={{
                          p: 2,
                          background: theme =>
                            theme.palette.mode === 'dark'
                              ? 'linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 193, 7, 0.15) 100%)'
                              : 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)',
                          border: '2px solid',
                          borderColor: 'warning.main',
                          borderRadius: 2
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant='caption' color='text.secondary' fontWeight={600}>
                            PISO 2
                          </Typography>
                          <Chip label={`${totalSeatsPiso2} asientos`} size='small' color='warning' />
                        </Box>
                        <Typography variant='caption' color='text.secondary'>
                          Filas: {busData.cantidadFilasPiso2} × Columnas: {busData.cantidadAsientosPiso2}
                        </Typography>
                      </Paper>
                    )}

                    <Alert
                      severity='info'
                      icon={<i className='tabler-armchair' />}
                      sx={{
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '& .MuiAlert-icon': { color: 'white' }
                      }}
                    >
                      <Typography variant='h6' fontWeight={700}>
                        Total: {totalSeats} Asientos
                      </Typography>
                    </Alert>

                    {busData.precioGlobal && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant='body2' color='text.secondary'>
                          Precio por asiento:
                        </Typography>
                        <Chip
                          label={`Bs ${busData.precioGlobal}`}
                          color='warning'
                          size='small'
                          icon={<i className='tabler-coin' />}
                        />
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {(busData.imagenInterior || busData.imagenExterior) && (
              <Grid size={{ xs: 12 }}>
                <Card variant='outlined'>
                  <CardContent>
                    <Typography
                      variant='h6'
                      fontWeight={700}
                      gutterBottom
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <i className='tabler-photo' />
                      Imágenes
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                      {busData.imagenInterior && (
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant='subtitle2' fontWeight={600} gutterBottom>
                              Interior
                            </Typography>
                            <Box
                              component='img'
                              src={busData.imagenInterior}
                              alt='Interior'
                              sx={{
                                maxWidth: '100%',
                                maxHeight: '200px',
                                objectFit: 'contain',
                                borderRadius: 2,
                                border: '2px solid',
                                borderColor: 'divider'
                              }}
                            />
                          </Paper>
                        </Grid>
                      )}
                      {busData.imagenExterior && (
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant='subtitle2' fontWeight={600} gutterBottom>
                              Exterior
                            </Typography>
                            <Box
                              component='img'
                              src={busData.imagenExterior}
                              alt='Exterior'
                              sx={{
                                maxWidth: '100%',
                                maxHeight: '200px',
                                objectFit: 'contain',
                                borderRadius: 2,
                                border: '2px solid',
                                borderColor: 'divider'
                              }}
                            />
                          </Paper>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        )}

        {currentView === 'layout' && (
          <Box>
            {[1, ...(busData.tipoPiso === 'dos' ? [2] : [])].map(piso => {
              const layout = piso === 1 ? busData.layoutPiso1 : busData.layoutPiso2
              const totalSeats = layout?.flat().filter(c => c.type === 'seat').length || 0

              return (
                <Box key={piso} sx={{ mb: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      mb: 2,
                      p: 2,
                      background: theme =>
                        theme.palette.mode === 'dark'
                          ? piso === 1
                            ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 152, 0, 0.12) 0%, rgba(255, 193, 7, 0.12) 100%)'
                          : piso === 1
                            ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 152, 0, 0.08) 0%, rgba(255, 193, 7, 0.08) 100%)',
                      border: '2px solid',
                      borderColor: piso === 1 ? 'primary.main' : 'warning.main',
                      borderRadius: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Badge badgeContent={totalSeats} color='success' max={999}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '12px',
                            background: piso === 1 ? 'primary.main' : 'warning.main',
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
                          Distribución de {totalSeats} asientos
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  <Paper elevation={2} sx={{ p: 3, borderRadius: 3, overflow: 'auto' }}>
                    <Box
                      sx={{
                        backgroundColor: piso === 1 ? 'primary.main' : 'warning.main',
                        color: 'white',
                        padding: '10px',
                        borderRadius: '12px 12px 0 0',
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: '13px',
                        mb: 2
                      }}
                    >
                      🚍 FRENTE
                    </Box>

                    <Box
                      sx={{
                        display: 'inline-block',
                        padding: 2,
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        border: '2px solid',
                        borderColor: 'divider'
                      }}
                    >
                      {layout?.map((row, rowIndex) => (
                        <Box key={rowIndex} sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                          <Box
                            sx={{
                              width: '30px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '11px',
                              color: piso === 1 ? 'primary.main' : 'warning.main',
                              mr: 0.5
                            }}
                          >
                            {rowIndex + 1}
                          </Box>
                          {row.map((cell, colIndex) => (
                            <Box key={colIndex}>{renderMiniCell(cell)}</Box>
                          ))}
                        </Box>
                      ))}
                    </Box>

                    <Box
                      sx={{
                        backgroundColor: 'grey.800',
                        color: 'white',
                        padding: '10px',
                        borderRadius: '0 0 12px 12px',
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: '13px',
                        mt: 2
                      }}
                    >
                      TRASERA 🔚
                    </Box>
                  </Paper>
                </Box>
              )
            })}

            <Paper sx={{ p: 2, mt: 3 }}>
              <Typography variant='subtitle2' fontWeight={700} gutterBottom>
                Leyenda
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                {[
                  { type: 'seat', label: 'Asiento', icon: '💺' },
                  { type: 'aisle', label: 'Pasillo', icon: '═' },
                  { type: 'driver', label: 'Conductor', icon: '🚗' },
                  { type: 'door', label: 'Puerta', icon: '🚪' },
                  { type: 'bathroom', label: 'Baño', icon: '🚻' }
                ].map(item => (
                  <Box key={item.type} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        backgroundColor: colors[item.type as CellType],
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Typography variant='caption'>{item.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        )}

        {currentView === 'stats' && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Card variant='outlined'>
                <CardContent>
                  <Typography
                    variant='h6'
                    fontWeight={700}
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <i className='tabler-chart-pie' />
                    Resumen de Elementos
                  </Typography>
                  <Divider sx={{ my: 2 }} />

                  <TableContainer>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <strong>Elemento</strong>
                          </TableCell>
                          <TableCell align='center'>
                            <strong>Piso 1</strong>
                          </TableCell>
                          {busData.tipoPiso === 'dos' && (
                            <TableCell align='center'>
                              <strong>Piso 2</strong>
                            </TableCell>
                          )}
                          <TableCell align='center'>
                            <strong>Total</strong>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span>💺</span> Asientos
                            </Box>
                          </TableCell>
                          <TableCell align='center'>
                            <Chip label={totalSeatsPiso1} size='small' color='success' />
                          </TableCell>
                          {busData.tipoPiso === 'dos' && (
                            <TableCell align='center'>
                              <Chip label={totalSeatsPiso2} size='small' color='success' />
                            </TableCell>
                          )}
                          <TableCell align='center'>
                            <Chip label={totalSeats} size='small' color='primary' />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span>═</span> Pasillos
                            </Box>
                          </TableCell>
                          <TableCell align='center'>{totalAislesPiso1}</TableCell>
                          {busData.tipoPiso === 'dos' && <TableCell align='center'>{totalAislesPiso2}</TableCell>}
                          <TableCell align='center'>
                            <strong>{totalAislesPiso1 + totalAislesPiso2}</strong>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span>🚪</span> Puertas
                            </Box>
                          </TableCell>
                          <TableCell align='center'>{totalDoorsPiso1}</TableCell>
                          {busData.tipoPiso === 'dos' && <TableCell align='center'>{totalDoorsPiso2}</TableCell>}
                          <TableCell align='center'>
                            <strong>{totalDoorsPiso1 + totalDoorsPiso2}</strong>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span>🚻</span> Baños
                            </Box>
                          </TableCell>
                          <TableCell align='center'>{totalBathroomsPiso1}</TableCell>
                          {busData.tipoPiso === 'dos' && <TableCell align='center'>{totalBathroomsPiso2}</TableCell>}
                          <TableCell align='center'>
                            <strong>{totalBathroomsPiso1 + totalBathroomsPiso2}</strong>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: 2
                }}
              >
                <i className='tabler-armchair' style={{ fontSize: '36px' }} />
                <Typography variant='h4' fontWeight={700} sx={{ mt: 1 }}>
                  {totalSeats}
                </Typography>
                <Typography variant='caption'>Total Asientos</Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  borderRadius: 2
                }}
              >
                <i className='tabler-building' style={{ fontSize: '36px' }} />
                <Typography variant='h4' fontWeight={700} sx={{ mt: 1 }}>
                  {busData.tipoPiso === 'dos' ? '2' : '1'}
                </Typography>
                <Typography variant='caption'>Pisos</Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  borderRadius: 2
                }}
              >
                <i className='tabler-layout-grid' style={{ fontSize: '36px' }} />
                <Typography variant='h4' fontWeight={700} sx={{ mt: 1 }}>
                  {(parseInt(busData.cantidadFilasPiso1) || 0) * (parseInt(busData.cantidadAsientosPiso1) || 0) +
                    (busData.tipoPiso === 'dos'
                      ? (parseInt(busData.cantidadFilasPiso2 || '0') || 0) *
                        (parseInt(busData.cantidadAsientosPiso2 || '0') || 0)
                      : 0)}
                </Typography>
                <Typography variant='caption'>Celdas Totales</Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  color: 'white',
                  borderRadius: 2
                }}
              >
                <i className='tabler-coin' style={{ fontSize: '36px' }} />
                <Typography variant='h4' fontWeight={700} sx={{ mt: 1 }}>
                  {busData.precioGlobal || '0'}
                </Typography>
                <Typography variant='caption'>Precio Bs</Typography>
              </Paper>
            </Grid>

            {busData.precioGlobal && (
              <Grid size={{ xs: 12 }}>
                <Card variant='outlined'>
                  <CardContent>
                    <Typography
                      variant='h6'
                      fontWeight={700}
                      gutterBottom
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <i className='tabler-cash' />
                      Proyección de Ingresos
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.lighter' }}>
                          <Typography variant='caption' color='text.secondary'>
                            Ingreso por Viaje (100%)
                          </Typography>
                          <Typography variant='h5' fontWeight={700} color='success.main'>
                            Bs {(totalSeats * parseFloat(busData.precioGlobal || '0')).toFixed(2)}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.lighter' }}>
                          <Typography variant='caption' color='text.secondary'>
                            Ingreso por Viaje (75%)
                          </Typography>
                          <Typography variant='h5' fontWeight={700} color='warning.main'>
                            Bs {(totalSeats * 0.75 * parseFloat(busData.precioGlobal || '0')).toFixed(2)}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.lighter' }}>
                          <Typography variant='caption' color='text.secondary'>
                            Ingreso por Viaje (50%)
                          </Typography>
                          <Typography variant='h5' fontWeight={700} color='info.main'>
                            Bs {(totalSeats * 0.5 * parseFloat(busData.precioGlobal || '0')).toFixed(2)}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>

      <Divider />
      <DialogActions sx={{ p: 3 }}>
        <Button variant='outlined' startIcon={<i className='tabler-printer' />} onClick={() => window.print()}>
          Imprimir
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button variant='outlined' onClick={onClose}>
          Cerrar
        </Button>
        <Button variant='contained' startIcon={<i className='tabler-check' />}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BusDetailModal
