'use client'

import { useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

import { useAuth } from '@/contexts/AuthContext'

const ImpersonationBanner = () => {
  const { isImpersonating, actingAsCompany, clearImpersonation } = useAuth()
  const router = useRouter()

  if (!isImpersonating || !actingAsCompany) return null

  const handleExitImpersonation = () => {
    clearImpersonation()
    router.push('/companies/list')
  }

  return (
    <Alert
      severity='warning'
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1200,
        borderRadius: 0,
        mb: 2
      }}
      action={
        <Button color='inherit' size='small' onClick={handleExitImpersonation} variant='outlined'>
          Salir del Modo Empresa
        </Button>
      }
    >
      <Box display='flex' alignItems='center' gap={2}>
        <i className='tabler-switch-horizontal' style={{ fontSize: '24px' }} />
        <Box>
          <Box display='flex' alignItems='center' gap={1} mb={0.5}>
            <strong>Modo Impersonación Activo</strong>
            <Chip label={actingAsCompany.name} size='small' color='warning' />
          </Box>
          <span style={{ fontSize: '0.875rem' }}>
            Estás viendo el sistema como si fueras esta empresa. Todas las acciones se realizarán en su contexto.
          </span>
        </Box>
      </Box>
    </Alert>
  )
}

export default ImpersonationBanner
