import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import EditHospedaje from '@/views/Dashboard/hospedaje/add/AddHospedaje'

interface EditHospedajePageProps {
  params: Promise<{
    id: string
  }>
}

const EditHospedajePage = async ({ params }: EditHospedajePageProps) => {
  const { id } = await params
  const lugarHospedajeId = parseInt(id)

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Editar Lugar de Hospedaje
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Actualizar lugar <code>de hospedaje</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <EditHospedaje lugarHospedajeId={lugarHospedajeId} />
      </Grid>
    </Grid>
  )
}

export default EditHospedajePage
