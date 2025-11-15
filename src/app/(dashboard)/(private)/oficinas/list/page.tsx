// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import OficinasTable from '@/views/Dashboard/Oficinas/list/OficinasListTable'

const OficinasPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Gestión de Oficinas
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Administra las <code>Oficinas</code> del sistema.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <OficinasTable />
      </Grid>
    </Grid>
  )
}

export default OficinasPage
