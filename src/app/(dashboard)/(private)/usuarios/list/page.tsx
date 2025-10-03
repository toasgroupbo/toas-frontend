// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import UsuariosTable from '@/views/Dashboard/usuarios/list/UsersTable'

const PageUsuarios = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Usuarios
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Lista de <code>Usuarios</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <UsuariosTable />
      </Grid>
    </Grid>
  )
}

export default PageUsuarios
