// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import AddGastronomia from '@/views/Dashboard/gastronomia/add/AddGastronomia'

const AddGastronomiaPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Gatronomia
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Crear lugares<code> gastronomicos</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <AddGastronomia />
      </Grid>
    </Grid>
  )
}

export default AddGastronomiaPage
