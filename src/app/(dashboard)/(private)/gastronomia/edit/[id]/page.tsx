import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import EditGastronomia from '@/views/Dashboard/gastronomia/add/AddGastronomia'

interface EditGastronomiaPageProps {
  params: Promise<{
    id: string
  }>
}

const EditGastronomiaPage = async ({ params }: EditGastronomiaPageProps) => {
  const { id } = await params
  const lugarGastronomiaId = parseInt(id)

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Editar Lugar Gastronómico
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Actualizar lugar <code>gastronómico</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <EditGastronomia lugarGastronomiaId={lugarGastronomiaId} />
      </Grid>
    </Grid>
  )
}

export default EditGastronomiaPage
