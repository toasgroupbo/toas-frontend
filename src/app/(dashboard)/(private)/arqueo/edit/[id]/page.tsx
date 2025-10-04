import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import AddAgenciaViaje from '@/views/Dashboard/arqueocaja/add/AddAgenciasViaje'

interface EditAgenciaViajePageProps {
  params: Promise<{
    id: string
  }>
}

const EditAgenciaViajePage = async ({ params }: EditAgenciaViajePageProps) => {
  // Esperamos los parámetros ya que ahora son una Promise
  const { id } = await params
  const lugarAgenciaViajeId = parseInt(id)

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Editar Agencia de Viaje
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Actualizar <code>Agencia de Viaje</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <AddAgenciaViaje lugarServicioId={lugarAgenciaViajeId} />
      </Grid>
    </Grid>
  )
}

export default EditAgenciaViajePage
