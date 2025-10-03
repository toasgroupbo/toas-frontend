// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import AddActividad from '@/views/Dashboard/actividades/add/AddActividad'

const AddActividades = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Actividades
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Agregar <code>actividad</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <AddActividad />
      </Grid>
    </Grid>
  )
}

export default AddActividades
