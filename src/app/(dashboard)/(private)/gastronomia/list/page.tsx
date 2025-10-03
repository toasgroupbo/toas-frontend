// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import GastronomiaTable from '@/views/Dashboard/gastronomia/list/GatronomiaTable'

const PageGastronomia = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Gatronomia
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Lista de lugares<code>gastronomia</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <GastronomiaTable />
      </Grid>
    </Grid>
  )
}

export default PageGastronomia
