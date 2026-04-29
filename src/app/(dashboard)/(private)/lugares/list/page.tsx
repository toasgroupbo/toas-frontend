// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import LugaresTable from '@/views/Dashboard/lugares/list/LugaresTable'

const PageLugares = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Lugares
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Lista de <code>Lugares</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <LugaresTable />
      </Grid>
    </Grid>
  )
}

export default PageLugares
