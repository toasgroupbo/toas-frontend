// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import EmpresasTable from '@/views/Dashboard/Companies/list/EmpresasListTable'

const EmpresasPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Empresas
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Lista de <code>Empresas</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <EmpresasTable />
      </Grid>
    </Grid>
  )
}

export default EmpresasPage
