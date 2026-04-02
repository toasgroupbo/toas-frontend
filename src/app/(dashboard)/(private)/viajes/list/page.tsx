// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import ViajesPageContent from '@/views/Dashboard/Viajes/ViajesPageContent'

const ViajesPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Gestión de Viajes
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Administra los <code>Viajes</code> del sistema.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ViajesPageContent />
      </Grid>
    </Grid>
  )
}

export default ViajesPage
