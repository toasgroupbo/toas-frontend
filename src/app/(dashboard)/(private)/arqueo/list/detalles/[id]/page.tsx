// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import DetalleArqueo from '@/views/Dashboard/arqueocaja/list/DetalleArqueoCaja'

const PageDetalleArqueo = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Detalle Arqueo de Caja
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Lista <code>de Detalle Arqueo de Caja</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <DetalleArqueo />
      </Grid>
    </Grid>
  )
}

export default PageDetalleArqueo
