// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import ServicioTable from '@/views/Dashboard/servicios/list/ServicioTable'

const PageServicio = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Servicio
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Lista <code>Servicio</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ServicioTable />
      </Grid>
    </Grid>
  )
}

export default PageServicio
