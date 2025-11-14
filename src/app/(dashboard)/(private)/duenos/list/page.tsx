// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import OwnersTable from '@/views/Dashboard/Duenos/list/OwnersTable'

const PageOwners = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Gestión de Dueños
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Administra los <code>dueños de buses</code>
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <OwnersTable />
      </Grid>
    </Grid>
  )
}

export default PageOwners
