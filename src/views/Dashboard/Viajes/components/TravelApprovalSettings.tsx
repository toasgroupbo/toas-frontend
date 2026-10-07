'use client'

import { useEffect } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Skeleton from '@mui/material/Skeleton'

import { useApprovalSettings, useUpdateApprovalSettings } from '@/hooks/useTravelApproval'
import { useSnackbar } from '@/contexts/SnackbarContext'

const TravelApprovalSettings = () => {
  const { data, isLoading, error } = useApprovalSettings()
  const updateMutation = useUpdateApprovalSettings()
  const { showSuccess, showError } = useSnackbar()

  const handleToggle = async (enabled: boolean) => {
    try {
      await updateMutation.mutateAsync({ enabled })
      showSuccess(enabled ? 'Aprobación de viajes activada' : 'Aprobación de viajes desactivada')
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Error al actualizar configuración')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader title={<Skeleton width={200} />} />
        <CardContent>
          <Skeleton width='100%' height={60} />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity='error'>Error al cargar configuración</Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title='Aprobación de Viajes'
        subheader='Configura si los viajes creados por cajeros requieren aprobación'
        avatar={<i className='tabler-checkbox' style={{ fontSize: 24 }} />}
      />
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            p: 2,
            bgcolor: 'action.hover',
            borderRadius: 1
          }}
        >
          <Box>
            <Typography variant='subtitle1' fontWeight={600}>
              Requerir aprobación de viajes
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Los viajes que creen los cajeros no estarán a la venta hasta que los apruebes.
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={data?.require_travel_approval || false}
                onChange={e => handleToggle(e.target.checked)}
                disabled={updateMutation.isPending}
              />
            }
            label={updateMutation.isPending ? <CircularProgress size={20} /> : ''}
            labelPlacement='start'
          />
        </Box>

        {data?.require_travel_approval && (
          <Alert severity='info' sx={{ mt: 2 }}>
            <Typography variant='body2'>
              Los viajes pendientes existentes seguirán esperando tu revisión aunque desactives esta opción.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

export default TravelApprovalSettings
