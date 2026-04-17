'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import type { Travel } from '@/types/api/travels'
import { getImageUrl } from '../utils/dateFormatters'

interface BusImagesDialogProps {
  open: boolean
  onClose: () => void
  selectedTravel: Travel | undefined
}

const BusImagesDialog = ({ open, onClose, selectedTravel }: BusImagesDialogProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth fullScreen={isMobile}>
      <DialogTitle>
        <Box display='flex' alignItems='center' justifyContent='space-between' gap={1}>
          <Box display='flex' alignItems='center' gap={{ xs: 1, sm: 2 }} minWidth={0}>
            <i className='tabler-bus' style={{ fontSize: isMobile ? '20px' : '24px', color: 'var(--mui-palette-primary-main)', flexShrink: 0 }} />
            <Typography
              variant={isMobile ? 'body1' : 'h5'}
              fontWeight={600}
              noWrap
              sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {isMobile ? selectedTravel?.bus?.name || 'Bus' : `Imágenes del Bus - ${selectedTravel?.bus?.name || 'N/A'}`}
            </Typography>
          </Box>
          <Button onClick={onClose} color='secondary' size='small' sx={{ minWidth: 'auto', flexShrink: 0 }}>
            <i className='tabler-x' />
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box display='flex' flexDirection='column' gap={{ xs: 2, sm: 3 }}>
          <Box>
            <Typography variant={isMobile ? 'body2' : 'subtitle1'} fontWeight={600} sx={{ mb: 1 }}>
              Imagen Exterior
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: { xs: 180, sm: 250, md: 300 },
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {getImageUrl(selectedTravel?.bus?.exterior_image) ? (
                <img
                  src={getImageUrl(selectedTravel?.bus?.exterior_image) || ''}
                  alt={`${selectedTravel?.bus?.name} - Exterior`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <Box textAlign='center'>
                  <i
                    className='tabler-photo-off'
                    style={{ fontSize: '48px', color: 'var(--mui-palette-text-disabled)' }}
                  />
                  <Typography variant='body2' color='text.disabled' sx={{ mt: 1 }}>
                    No hay imagen exterior disponible
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Box>
            <Typography variant={isMobile ? 'body2' : 'subtitle1'} fontWeight={600} sx={{ mb: 1 }}>
              Imagen Interior
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: { xs: 180, sm: 250, md: 300 },
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {getImageUrl(selectedTravel?.bus?.interior_image) ? (
                <img
                  src={getImageUrl(selectedTravel?.bus?.interior_image) || ''}
                  alt={`${selectedTravel?.bus?.name} - Interior`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <Box textAlign='center'>
                  <i
                    className='tabler-photo-off'
                    style={{ fontSize: '48px', color: 'var(--mui-palette-text-disabled)' }}
                  />
                  <Typography variant='body2' color='text.disabled' sx={{ mt: 1 }}>
                    No hay imagen interior disponible
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant='contained' color='primary' fullWidth>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BusImagesDialog
