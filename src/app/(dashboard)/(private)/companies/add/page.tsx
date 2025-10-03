// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import AddEmpresas from '@/views/Dashboard/Companies/add/AddEmpresas'

const AddEmpresasPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Empresas
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Agregar <code>Empresas</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <AddEmpresas />
      </Grid>
    </Grid>
  )
}

export default AddEmpresasPage
