import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import AddEntretenimiento from '@/views/Dashboard/entretenimiento/add/AddEntretenimiento'

interface EditEntretenimientoPageProps {
  params: Promise<{
    id: string
  }>
}

const EditEntretenimientoPage = async ({ params }: EditEntretenimientoPageProps) => {
  const { id } = await params
  const lugarEntretenimientoId = parseInt(id)

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Editar Lugar Entretenimiento
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Actualizar lugar <code>de Entretenimiento</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <AddEntretenimiento lugarEntretenimientoId={lugarEntretenimientoId} />
      </Grid>
    </Grid>
  )
}

export default EditEntretenimientoPage
