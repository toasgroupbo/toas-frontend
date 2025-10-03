import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import AddUsuario from '@/views/Dashboard/usuarios/add/AddUsuarios'

interface EditUsuarioPageProps {
  params: Promise<{
    id: string
  }>
}

const EditServicioPage = async ({ params }: EditUsuarioPageProps) => {
  const { id } = await params
  const lugarUsuarioId = parseInt(id)

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Editar Usuario
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Actualizar <code>Usuario</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <AddUsuario usuarioId={lugarUsuarioId} />
      </Grid>
    </Grid>
  )
}

export default EditServicioPage
