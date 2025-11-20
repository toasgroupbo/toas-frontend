import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import EditBuses from '@/views/Dashboard/buses/add/AddBuses'

const EditBusPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Buses
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Actualiza la <code>información del bus</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <EditBuses />
      </Grid>
    </Grid>
  )
}

export default EditBusPage
