'use client'

import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import { BusEquipment, SeatType } from '@/types/api/buses'
import type { Owner, Seat, DeckType } from '@/types/api/buses'

interface DeckFormData {
  deck: number
  deckType: DeckType
  rows: number
  columns: number
  seats: Seat[]
}

interface StepResumenProps {
  name: string
  plaque: string
  brand: string
  model: string
  owner: string
  equipment: BusEquipment[]
  busTypeName: string
  decks: DeckFormData[]
  totalSeats: number
  owners?: Owner[]
}

const EQUIPMENT_OPTIONS: { value: BusEquipment; label: string; icon: string }[] = [
  { value: BusEquipment.WIFI, label: 'WiFi', icon: 'tabler-wifi' },
  { value: BusEquipment.USB_CHARGER, label: 'Cargador USB', icon: 'tabler-usb' },
  { value: BusEquipment.AIR_CONDITIONING, label: 'Aire Acondicionado', icon: 'tabler-air-conditioning' },
  { value: BusEquipment.BATHROOM, label: 'Baño', icon: 'tabler-bath' },
  { value: BusEquipment.TV, label: 'TV', icon: 'tabler-device-tv' }
]

const StepResumen = ({
  name,
  plaque,
  brand,
  model,
  owner,
  equipment,
  busTypeName,
  decks,
  totalSeats,
  owners
}: StepResumenProps) => {
  return (
    <Card className='mb-6'>
      <CardHeader
        avatar={
          <Box className='w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center text-white'>
            <i className='tabler-checklist text-2xl' />
          </Box>
        }
        title={
          <Typography variant='h6' className='font-semibold'>
            Resumen
          </Typography>
        }
        subheader='Revisa la información antes de guardar'
      />
      <CardContent>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper className='p-4 shadow-md rounded-xl' sx={{ border: '2px solid', borderColor: 'primary.main' }}>
              <div className='flex items-center gap-2 mb-3'>
                <i className='tabler-info-circle text-xl' style={{ color: 'var(--mui-palette-primary-main)' }} />
                <Typography variant='subtitle1' className='font-bold' color='primary'>
                  Información Básica
                </Typography>
              </div>
              <Divider className='mb-3' />
              <TableContainer>
                <Table size='small'>
                  <TableBody>
                    <TableRow>
                      <TableCell className='font-semibold'>Nombre:</TableCell>
                      <TableCell>{name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className='font-semibold'>Placa:</TableCell>
                      <TableCell>
                        <Chip label={plaque} color='primary' size='small' className='font-semibold' />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className='font-semibold'>Marca:</TableCell>
                      <TableCell>{brand}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className='font-semibold'>Modelo:</TableCell>
                      <TableCell>{model}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className='font-semibold'>Propietario:</TableCell>
                      <TableCell>{owners?.find(o => o.id === owner)?.name || '-'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper className='p-4 shadow-md rounded-xl' sx={{ border: '2px solid', borderColor: 'success.main' }}>
              <div className='flex items-center gap-2 mb-3'>
                <i className='tabler-tools text-xl' style={{ color: 'var(--mui-palette-success-main)' }} />
                <Typography variant='subtitle1' className='font-bold' color='success'>
                  Equipamiento
                </Typography>
              </div>
              <Divider className='mb-3' />
              <div className='flex flex-wrap gap-2'>
                {equipment.length > 0 ? (
                  equipment.map(eq => {
                    const option = EQUIPMENT_OPTIONS.find(o => o.value === eq)

                    return (
                      <Chip
                        key={eq}
                        label={option?.label}
                        icon={<i className={option?.icon} />}
                        color='primary'
                        size='small'
                        className='font-medium'
                      />
                    )
                  })
                ) : (
                  <Typography variant='body2' color='text.secondary'>
                    Sin equipamiento
                  </Typography>
                )}
              </div>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Paper className='p-4 shadow-md rounded-xl' sx={{ border: '2px solid', borderColor: 'secondary.main' }}>
              <div className='flex items-center gap-2 mb-3'>
                <i className='tabler-layout-grid text-xl' style={{ color: 'var(--mui-palette-secondary-main)' }} />
                <Typography variant='subtitle1' className='font-bold' color='secondary'>
                  Configuración de Pisos
                </Typography>
              </div>
              <Divider className='mb-3' />
              <div className='mb-3 flex items-center gap-2'>
                <Typography variant='body2' color='text.secondary'>
                  Tipo de Bus:
                </Typography>
                <Chip label={busTypeName} color='secondary' size='small' className='font-semibold' />
              </div>
              <TableContainer>
                <Table size='small' sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell className='font-bold'>Piso</TableCell>
                      <TableCell className='font-bold'>Tipo</TableCell>
                      <TableCell align='center' className='font-bold'>
                        Filas
                      </TableCell>
                      <TableCell align='center' className='font-bold'>
                        Columnas
                      </TableCell>
                      <TableCell align='center' className='font-bold'>
                        Asientos
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {decks.map((deck, index) => (
                      <TableRow key={index} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                        <TableCell>Piso {deck.deck}</TableCell>
                        <TableCell>
                          <Chip
                            label={deck.deckType}
                            color={index === 0 ? 'primary' : 'secondary'}
                            size='small'
                            className='font-medium'
                          />
                        </TableCell>
                        <TableCell align='center'>{deck.rows}</TableCell>
                        <TableCell align='center'>{deck.columns}</TableCell>
                        <TableCell align='center'>
                          <Chip
                            label={deck.seats.filter(s => s.type === SeatType.SEAT).length}
                            color='success'
                            size='small'
                            className='font-semibold'
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: 'primary.lighter' }}>
                      <TableCell colSpan={4} align='right' className='font-bold'>
                        <Typography variant='body2' className='font-bold' color='primary'>
                          Total de Asientos:
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <Chip label={totalSeats} color='primary' size='small' className='font-bold text-base' />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default StepResumen
