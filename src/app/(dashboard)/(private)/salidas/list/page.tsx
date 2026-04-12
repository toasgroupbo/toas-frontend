// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import SalidasTable from '@/views/Dashboard/salidas/list/SalidasTable'

const PageSalidas = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Salidas
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>Visualiza y analiza el reporte de salidas</Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <SalidasTable />
      </Grid>
    </Grid>
  )
}

export default PageSalidas
