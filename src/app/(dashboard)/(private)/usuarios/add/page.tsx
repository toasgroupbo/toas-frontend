// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import AddUsuario from '@/views/Dashboard/usuarios/add/AddUsuario'

const AddUsuarioPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Usuarios
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Crear <code> Usuario</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <AddUsuario />
      </Grid>
    </Grid>
  )
}

export default AddUsuarioPage
