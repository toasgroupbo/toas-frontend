// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import RutasTable from '@/views/Dashboard/Rutas/list/RutasListTable'

const RutasPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Gestión de Rutas
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Administra las <code>Rutas</code> del sistema.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <RutasTable />
      </Grid>
    </Grid>
  )
}

export default RutasPage
