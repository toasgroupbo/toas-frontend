'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import type { Travel } from '@/types/api/travels'
import { formatDate, formatTime } from '../utils/dateFormatters'

interface CloseTravelDialogProps {
  open: boolean
  onClose: () => void
  selectedTravel: Travel | undefined
  onConfirmClose: () => void
  isLoading: boolean
}

const CloseTravelDialog = ({
  open,
  onClose,
  selectedTravel,
  onConfirmClose,
  isLoading
}: CloseTravelDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' gap={2}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              bgcolor: 'error.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <i className='tabler-lock' style={{ fontSize: '28px', color: 'white' }} />
          </Box>
          <Typography variant='h5' fontWeight={600}>
            Cerrar Viaje
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
          ¿Estás seguro de que deseas cerrar este viaje?
        </Typography>
        <Box
          sx={{
            bgcolor: 'warning.lighter',
            p: 2,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'warning.main',
            mb: 2
          }}
        >
          <Typography variant='body2' fontWeight={600} color='warning.main'>
            Esta acción cerrará el viaje y no se podrán vender más tickets.
          </Typography>
        </Box>
        {selectedTravel && (
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
              <strong>Ruta:</strong> {selectedTravel.route.officeOrigin.place?.name || 'N/A'} →{' '}
              {selectedTravel.route.officeDestination.place?.name || 'N/A'}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
              <strong>Fecha:</strong> {formatDate(selectedTravel.departure_time)} -{' '}
              {formatTime(selectedTravel.departure_time)}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              <strong>Bus:</strong> {selectedTravel.bus?.name || 'N/A'} ({selectedTravel.bus?.plaque || 'N/A'})
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          variant='outlined'
          color='secondary'
          fullWidth
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          onClick={onConfirmClose}
          variant='contained'
          color='error'
          fullWidth
          startIcon={<i className='tabler-lock' />}
          disabled={isLoading}
        >
          {isLoading ? 'Cerrando...' : 'Cerrar Viaje'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CloseTravelDialog
