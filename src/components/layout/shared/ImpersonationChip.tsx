'use client'

import { useRouter } from 'next/navigation'

import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'

import { useAuth } from '@/contexts/AuthContext'

const ImpersonationChip = () => {
  const { isImpersonating, actingAsCompany, clearImpersonation } = useAuth()
  const router = useRouter()

  if (!isImpersonating || !actingAsCompany) return null

  const handleExitImpersonation = () => {
    clearImpersonation()
    router.push('/companies/list')
  }

  return (
    <Box display='flex' alignItems='center' gap={1}>
      <Tooltip title='Estás actuando como esta empresa. Todas las acciones se realizarán en su contexto.'>
        <Chip
          icon={<i className='tabler-switch-horizontal' />}
          label={'ESTAS ACTUANDO COMO ' + actingAsCompany.name}
          color='warning'
          size='small'
          variant='filled'
          sx={{
            fontWeight: 600,
            '& .MuiChip-icon': {
              fontSize: '16px'
            }
          }}
        />
      </Tooltip>
      <Tooltip title='Salir del modo empresa'>
        <IconButton
          size='small'
          onClick={handleExitImpersonation}
          sx={{
            color: 'warning.main',
            '&:hover': {
              backgroundColor: 'warning.lighter'
            }
          }}
        >
          <i className='tabler-x' style={{ fontSize: '18px' }} />
        </IconButton>
      </Tooltip>
    </Box>
  )
}

export default ImpersonationChip
