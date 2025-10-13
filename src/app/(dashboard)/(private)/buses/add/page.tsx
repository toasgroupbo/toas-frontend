// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import AddBuses from '@/views/Dashboard/buses/add/AddBuses'

const AddBusesPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Buses
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Agregar <code>Buses</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <AddBuses />
      </Grid>
    </Grid>
  )
}

export default AddBusesPage
