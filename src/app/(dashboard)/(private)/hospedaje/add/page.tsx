// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import AddHospedaje from '@/views/Dashboard/hospedaje/add/AddHospedaje'

const AddHospedajePage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Hospedaje
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Crear lugares<code> de hospedaje</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <AddHospedaje />
      </Grid>
    </Grid>
  )
}

export default AddHospedajePage
