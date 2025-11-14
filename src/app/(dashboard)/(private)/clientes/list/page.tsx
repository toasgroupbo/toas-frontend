// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import ClientsTable from '@/views/Dashboard/Clientes/list/ClientsTable'

const PageClients = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Gestión de Clientes
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Administra los clientes del sistema
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ClientsTable />
      </Grid>
    </Grid>
  )
}

export default PageClients
