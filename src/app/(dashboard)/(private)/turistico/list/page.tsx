// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import TuristicoTable from '@/views/Dashboard/turistico/list/TuristicoTable'

const PageTuristico = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Turismo
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Lista de lugares<code>Turisticos</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TuristicoTable />
      </Grid>
    </Grid>
  )
}

export default PageTuristico
