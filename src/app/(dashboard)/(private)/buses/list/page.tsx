// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import BusesTable from '@/views/Dashboard/buses/list/BusesListTable'

const BusesPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Buses
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Lista de <code>Buses</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <BusesTable />
      </Grid>
    </Grid>
  )
}

export default BusesPage
