// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import AddServicio from '@/views/Dashboard/servicios/add/AddServicio'

const AddServicioPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Servicio
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Crear <code> Servicio</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <AddServicio />
      </Grid>
    </Grid>
  )
}

export default AddServicioPage
