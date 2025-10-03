// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import AddEntretenimiento from '@/views/Dashboard/entretenimiento/add/AddEntretenimiento'

const AddEntretenimientoPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Entrenimiento
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Crear lugares<code> de Entretenimiento</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <AddEntretenimiento />
      </Grid>
    </Grid>
  )
}

export default AddEntretenimientoPage
