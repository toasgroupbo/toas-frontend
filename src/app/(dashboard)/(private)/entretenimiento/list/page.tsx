// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import EntretenimientoTable from '@/views/Dashboard/entretenimiento/list/EntretenimientoTable'

const PageEntretenimiento = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Entretenimiento
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Lista de lugares<code>de entretenimiento</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <EntretenimientoTable />
      </Grid>
    </Grid>
  )
}

export default PageEntretenimiento
