import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import AddServicio from '@/views/Dashboard/servicios/add/AddServicio'

interface EditServicioPageProps {
  params: Promise<{
    id: string
  }>
}

const EditServicioPage = async ({ params }: EditServicioPageProps) => {
  const { id } = await params
  const lugarServicioId = parseInt(id)

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Editar Servicio
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Actualizar <code>Servicio</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <AddServicio lugarServicioId={lugarServicioId} />
      </Grid>
    </Grid>
  )
}

export default EditServicioPage
