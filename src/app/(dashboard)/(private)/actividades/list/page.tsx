// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import ActividadesTable from '@/views/Dashboard/actividades/list/ActividadesTable'

const AgendaActividades = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Actividades
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Lista de <code>actividades</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ActividadesTable />
      </Grid>
    </Grid>
  )
}

export default AgendaActividades
