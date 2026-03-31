'use client'

import { useState } from 'react'

import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'

import { useAuth } from '@/contexts/AuthContext'
import ExitImpersonationDialog from './ExitImpersonationDialog'

const ImpersonationChip = () => {
  const { isImpersonating, actingAsCompany, clearImpersonation, isTransitioning } = useAuth()
  const [showExitDialog, setShowExitDialog] = useState(false)

  if (!isImpersonating || !actingAsCompany) return null

  const handleExitImpersonation = () => {
    clearImpersonation()
  }

  return (
    <>
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
            onClick={() => setShowExitDialog(true)}
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

      <ExitImpersonationDialog
        open={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        onConfirm={handleExitImpersonation}
        company={actingAsCompany}
        isLoading={isTransitioning}
      />
    </>
  )
}

export default ImpersonationChip
