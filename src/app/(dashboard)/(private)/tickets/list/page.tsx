// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import TravelsForSale from '@/views/Dashboard/Tickets/sale/TravelsForSale'

const PageTickets = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Venta de Tickets
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Gestiona la <code>venta y estado de tickets</code> de viaje.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TravelsForSale />
      </Grid>
    </Grid>
  )
}

export default PageTickets
