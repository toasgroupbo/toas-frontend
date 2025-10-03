// Component Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import HospedajeTable from '@/views/Dashboard/hospedaje/list/HospedajeTable'

const PageHospedaje = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Hospedaje
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Lista de lugares<code>de hospedaje</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <HospedajeTable />
      </Grid>
    </Grid>
  )
}

export default PageHospedaje
