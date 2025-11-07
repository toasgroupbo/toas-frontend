// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import RolesTable from '@/views/Dashboard/roles/list/RolesTable'

const PageRoles = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Roles
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Lista de <code>Roles</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <RolesTable />
      </Grid>
    </Grid>
  )
}

export default PageRoles
