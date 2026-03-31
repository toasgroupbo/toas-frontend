'use client'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material'

import type { Company } from '@/types/api/company'

interface ExitImpersonationDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  company: Company | null
  isLoading?: boolean
}

const ExitImpersonationDialog = ({
  open,
  onClose,
  onConfirm,
  company,
  isLoading = false
}: ExitImpersonationDialogProps) => {
  if (!company) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' gap={1}>
          <i className='tabler-logout' style={{ fontSize: '24px', color: 'var(--mui-palette-info-main)' }} />
          <span>Salir del Modo Empresa</span>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity='info' sx={{ mb: 3 }}>
          <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
            ¿Estás seguro de que deseas salir del modo empresa?
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Volverás a tu perfil de administrador y ya no podrás realizar acciones en nombre de esta empresa hasta que
            vuelvas a seleccionarla.
          </Typography>
        </Alert>

        <Box
          sx={{
            p: 2,
            border: '2px solid',
            borderColor: 'info.main',
            borderRadius: 2,
            backgroundColor: 'info.lighter'
          }}
        >
          <Box display='flex' alignItems='center' gap={2}>
            {company.logo && (
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  flexShrink: 0
                }}
              >
                <img
                  src={company.logo.startsWith('http') ? company.logo : `${process.env.NEXT_PUBLIC_API_URL}${company.logo}`}
                  alt={company.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </Box>
            )}
            <Box flex={1}>
              <Typography variant='h6' color='info.dark'>
                {company.name}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Actualmente estás actuando como esta empresa
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant='outlined' color='secondary' disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant='contained'
          color='info'
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <i className='tabler-logout' />}
        >
          {isLoading ? 'Saliendo...' : 'Salir del Modo Empresa'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ExitImpersonationDialog
