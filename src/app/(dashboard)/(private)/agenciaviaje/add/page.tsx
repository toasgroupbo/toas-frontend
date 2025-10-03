// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import AddAgenciaViaje from '@/views/Dashboard/agenciaviaje/add/AddAgenciasViaje'

const AddAgenciaViajePage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Agencias de viaje
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Crear <code> Agencias de Viaje</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <AddAgenciaViaje />
      </Grid>
    </Grid>
  )
}

export default AddAgenciaViajePage
