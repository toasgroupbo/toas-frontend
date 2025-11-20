'use client'

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
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'

import CustomTextField from '@core/components/mui/TextField'
import { BusEquipment } from '@/types/api/buses'
import type { Owner } from '@/types/api/buses'

interface StepDatosGeneralesProps {
  name: string
  setName: (value: string) => void
  plaque: string
  setPlaque: (value: string) => void
  brand: string
  setBrand: (value: string) => void
  model: string
  setModel: (value: string) => void
  owner: string
  setOwner: (value: string) => void
  equipment: BusEquipment[]
  toggleEquipment: (item: BusEquipment) => void
  interiorImagePreview: string
  exteriorImagePreview: string
  handleInteriorImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleExteriorImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleRemoveInteriorImage: () => void
  handleRemoveExteriorImage: () => void
  owners?: Owner[]
  ownersLoading: boolean
}

const EQUIPMENT_OPTIONS: { value: BusEquipment; label: string; icon: string }[] = [
  { value: BusEquipment.WIFI, label: 'WiFi', icon: 'tabler-wifi' },
  { value: BusEquipment.USB_CHARGER, label: 'Cargador USB', icon: 'tabler-usb' },
  { value: BusEquipment.AIR_CONDITIONING, label: 'Aire Acondicionado', icon: 'tabler-air-conditioning' },
  { value: BusEquipment.BATHROOM, label: 'Baño', icon: 'tabler-bath' },
  { value: BusEquipment.TV, label: 'TV', icon: 'tabler-device-tv' }
]

const StepDatosGenerales = ({
  name,
  setName,
  plaque,
  setPlaque,
  brand,
  setBrand,
  model,
  setModel,
  owner,
  setOwner,
  equipment,
  toggleEquipment,
  interiorImagePreview,
  exteriorImagePreview,
  handleInteriorImageChange,
  handleExteriorImageChange,
  handleRemoveInteriorImage,
  handleRemoveExteriorImage,
  owners,
  ownersLoading
}: StepDatosGeneralesProps) => {
  return (
    <Card className='mb-6'>
      <CardHeader
        avatar={
          <Box className='w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white'>
            <i className='tabler-info-circle text-2xl' />
          </Box>
        }
        title={<Typography variant='h6' className='font-semibold'>Información Básica</Typography>}
        subheader='Datos generales del bus'
      />
      <CardContent>
        <Grid container spacing={3}>
          {/* Información del vehículo */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              fullWidth
              label='Nombre del Bus'
              placeholder='Bus 1'
              value={name}
              onChange={e => setName(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <i className='tabler-bus' />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              fullWidth
              label='Placa'
              placeholder='ABC-1234'
              value={plaque}
              onChange={e => setPlaque(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <i className='tabler-license' />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              fullWidth
              label='Marca'
              placeholder='NISSAN'
              value={brand}
              onChange={e => setBrand(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <i className='tabler-brand-ford' />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              fullWidth
              label='Modelo'
              placeholder='2025'
              value={model}
              onChange={e => setModel(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <i className='tabler-calendar' />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CustomTextField
              select
              fullWidth
              label='Propietario'
              value={owner}
              onChange={e => setOwner(e.target.value)}
              required
              disabled={ownersLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <i className='tabler-user' />
                  </InputAdornment>
                )
              }}
            >
              {ownersLoading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} />
                </MenuItem>
              ) : owners && owners.length > 0 ? (
                owners.map(o => (
                  <MenuItem key={o.id} value={o.id}>
                    {o.name} - CI: {o.ci}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No hay propietarios disponibles</MenuItem>
              )}
            </CustomTextField>
          </Grid>

          {/* Imágenes */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant='subtitle2' className='mb-2 font-semibold'>
              Imagen Interior *
            </Typography>
            <Box
              sx={{
                position: 'relative',
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                minHeight: 150,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'action.hover',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.selected'
                }
              }}
            >
              {interiorImagePreview ? (
                <>
                  <img
                    src={interiorImagePreview}
                    alt='Interior preview'
                    className='max-w-full max-h-[120px] object-contain rounded-lg'
                  />
                  <IconButton
                    size='small'
                    onClick={handleRemoveInteriorImage}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'error.main',
                      color: 'error.contrastText',
                      '&:hover': { bgcolor: 'error.dark' }
                    }}
                  >
                    <i className='tabler-trash text-base' />
                  </IconButton>
                </>
              ) : (
                <>
                  <i className='tabler-upload text-5xl opacity-40 mb-2' />
                  <Typography variant='body2' color='text.secondary'>
                    Haga clic para seleccionar imagen
                  </Typography>
                </>
              )}
              <input
                type='file'
                accept='image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml'
                onChange={handleInteriorImageChange}
                className='absolute inset-0 opacity-0 cursor-pointer'
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant='subtitle2' className='mb-2 font-semibold'>
              Imagen Exterior *
            </Typography>
            <Box
              sx={{
                position: 'relative',
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                minHeight: 150,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'action.hover',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: 'success.main',
                  bgcolor: 'action.selected'
                }
              }}
            >
              {exteriorImagePreview ? (
                <>
                  <img
                    src={exteriorImagePreview}
                    alt='Exterior preview'
                    className='max-w-full max-h-[120px] object-contain rounded-lg'
                  />
                  <IconButton
                    size='small'
                    onClick={handleRemoveExteriorImage}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'error.main',
                      color: 'error.contrastText',
                      '&:hover': { bgcolor: 'error.dark' }
                    }}
                  >
                    <i className='tabler-trash text-base' />
                  </IconButton>
                </>
              ) : (
                <>
                  <i className='tabler-upload text-5xl opacity-40 mb-2' />
                  <Typography variant='body2' color='text.secondary'>
                    Haga clic para seleccionar imagen
                  </Typography>
                </>
              )}
              <input
                type='file'
                accept='image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml'
                onChange={handleExteriorImageChange}
                className='absolute inset-0 opacity-0 cursor-pointer'
              />
            </Box>
          </Grid>

          {/* Equipamiento */}
          <Grid size={{ xs: 12 }}>
            <Divider className='my-4' />
            <div className='flex items-center gap-2 mb-3'>
              <i className='tabler-tools text-xl' />
              <Typography variant='h6' className='font-semibold'>Equipamiento</Typography>
            </div>
            <div className='flex flex-wrap gap-2'>
              {EQUIPMENT_OPTIONS.map(option => (
                <Chip
                  key={option.value}
                  label={option.label}
                  icon={<i className={option.icon} />}
                  onClick={() => toggleEquipment(option.value)}
                  color={equipment.includes(option.value) ? 'primary' : 'default'}
                  variant={equipment.includes(option.value) ? 'filled' : 'outlined'}
                  clickable
                  className='transition-all hover:scale-105'
                />
              ))}
            </div>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default StepDatosGenerales
