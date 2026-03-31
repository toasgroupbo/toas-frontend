import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import TerminosView from '@/views/Dashboard/Terminos/TerminosView'

const TerminosPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Términos y Políticas
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Gestiona los <code>Términos y Condiciones</code> y <code>Políticas de Privacidad</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TerminosView />
      </Grid>
    </Grid>
  )
}

export default TerminosPage
