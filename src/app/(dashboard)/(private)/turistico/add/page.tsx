// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import AddTuristico from '@/views/Dashboard/turistico/add/AddTuristico'

const AddTuristicoPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Turistico
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Crear lugares<code> turisticos</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <AddTuristico />
      </Grid>
    </Grid>
  )
}

export default AddTuristicoPage
