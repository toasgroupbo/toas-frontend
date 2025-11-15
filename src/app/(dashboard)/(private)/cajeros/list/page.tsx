// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import CajerosTable from '@/views/Dashboard/Cajeros/list/CashiersTable.tsx'

const PageCajeros = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Gestión de Cajeros
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Administra los <code>cajeros del sistema</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CajerosTable />
      </Grid>
    </Grid>
  )
}

export default PageCajeros
