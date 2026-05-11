import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import DepositosTable from '@/views/Dashboard/depositos/list/DepositosTable'

const PageDepositos = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Reporte de Depósitos
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Lista de empresas para procesar <code>depósitos</code> de viajes.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <DepositosTable />
      </Grid>
    </Grid>
  )
}

export default PageDepositos
