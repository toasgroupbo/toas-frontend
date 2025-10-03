import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import AddTuristico from '@/views/Dashboard/turistico/add/AddTuristico'

interface EditTuristicoPageProps {
  params: Promise<{
    id: string
  }>
}

const EditTuristicoPage = async ({ params }: EditTuristicoPageProps) => {
  const { id } = await params
  const lugarTuristicoId = parseInt(id)

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Editar Lugar Turístico
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Actualizar lugar <code>turístico</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <AddTuristico lugarTuristicoId={lugarTuristicoId} />
      </Grid>
    </Grid>
  )
}

export default EditTuristicoPage
