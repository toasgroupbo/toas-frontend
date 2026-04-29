'use client'

import { useState } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'

import CustomTextField from '@core/components/mui/TextField'
import type { Travel } from '@/types/api/travels'

interface CancelTravelDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (password: string) => void
  travel: Travel | null
  isLoading?: boolean
}

const CancelTravelDialog = ({ open, onClose, onConfirm, travel, isLoading = false }: CancelTravelDialogProps) => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleClose = () => {
    setPassword('')
    setShowPassword(false)
    onClose()
  }

  const handleConfirm = () => {
    onConfirm(password)
  }

  const formatDateTime = (dateString: string) => {
    const dateWithoutZ = dateString.replace('Z', '')
    const date = new Date(dateWithoutZ)

    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={open} onClose={isLoading ? undefined : handleClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className='flex items-center gap-2'>
          <i className='tabler-ban' style={{ fontSize: '24px', color: 'var(--mui-palette-warning-main)' }} />
          <span>Cancelar Viaje</span>
        </div>
        <IconButton onClick={handleClose} disabled={isLoading}>
          <i className='tabler-x' />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography variant='body1' sx={{ mb: 3 }}>
          ¿Está seguro que desea cancelar este viaje? Esta acción no se puede deshacer.
        </Typography>

        {travel && (
          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: 'action.hover',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              mb: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <i className='tabler-bus' style={{ fontSize: '20px', color: 'var(--mui-palette-primary-main)' }} />
              <div>
                <Typography variant='subtitle2' fontWeight='bold'>
                  {travel.bus.name}
                </Typography>
                <Chip label={travel.bus.plaque} size='small' variant='outlined' />
              </div>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className='tabler-flag' style={{ fontSize: '16px', color: 'var(--mui-palette-success-main)' }} />
              <Typography variant='body2'>{travel.route.officeOrigin.place?.name}</Typography>
              <i className='tabler-arrow-right' style={{ fontSize: '16px' }} />
              <i className='tabler-flag-filled' style={{ fontSize: '16px', color: 'var(--mui-palette-error-main)' }} />
              <Typography variant='body2'>{travel.route.officeDestination.place?.name}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className='tabler-clock' style={{ fontSize: '16px', color: 'var(--mui-palette-info-main)' }} />
              <Typography variant='body2'>Salida: {formatDateTime(travel.departure_time)}</Typography>
            </Box>
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
            Para confirmar, ingrese su contraseña:
          </Typography>
          <CustomTextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label='Contraseña'
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={isLoading}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowPassword(!showPassword)} edge='end' size='small'>
                  <i className={showPassword ? 'tabler-eye-off' : 'tabler-eye'} style={{ fontSize: '18px' }} />
                </IconButton>
              )
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} variant='outlined' color='secondary' disabled={isLoading}>
          No, mantener
        </Button>
        <Button
          onClick={handleConfirm}
          variant='contained'
          color='warning'
          disabled={isLoading || !password.trim()}
          startIcon={isLoading ? <CircularProgress size={20} /> : <i className='tabler-ban' />}
        >
          {isLoading ? 'Cancelando...' : 'Sí, cancelar viaje'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CancelTravelDialog
