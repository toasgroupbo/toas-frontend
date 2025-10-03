// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import ServicioTable from '@/views/Dashboard/agenciaviaje/list/ServicioTable'

const PageAgenciaViaje = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Agencias de Viaje
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Lista <code>de Agencias de Viaje</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ServicioTable />
      </Grid>
    </Grid>
  )
}

export default PageAgenciaViaje
