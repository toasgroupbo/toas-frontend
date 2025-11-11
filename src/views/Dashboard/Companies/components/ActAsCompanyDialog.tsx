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

interface ActAsCompanyDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  company: Company | null
  isLoading?: boolean
}

const ActAsCompanyDialog = ({ open, onClose, onConfirm, company, isLoading = false }: ActAsCompanyDialogProps) => {
  if (!company) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' gap={1}>
          <i className='tabler-switch-horizontal' style={{ fontSize: '24px', color: 'var(--mui-palette-warning-main)' }} />
          <span>Confirmar Cambio de Empresa</span>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity='warning' sx={{ mb: 3 }}>
          <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
            ¿Estás seguro de que deseas actuar como esta empresa?
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Todas las acciones que realices se verán reflejadas como si fueras esta empresa. Los datos y menús se
            ajustarán según los permisos de la empresa seleccionada.
          </Typography>
        </Alert>

        <Box
          sx={{
            p: 2,
            border: '2px solid',
            borderColor: 'warning.main',
            borderRadius: 2,
            backgroundColor: 'warning.lighter'
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
              <Typography variant='h6' color='warning.dark'>
                {company.name}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Administrador: {company.admin.fullName}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {company.admin.email}
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
          color='warning'
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <i className='tabler-check' />}
        >
          {isLoading ? 'Cambiando...' : 'Confirmar Cambio'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ActAsCompanyDialog
