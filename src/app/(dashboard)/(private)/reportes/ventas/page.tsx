// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import VentasTable from '@/views/Dashboard/ventas/list/VentasTable'

const PageVentas = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Reporte de Ventas
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>Visualiza y analiza el reporte de ventas</Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <VentasTable />
      </Grid>
    </Grid>
  )
}

export default PageVentas
