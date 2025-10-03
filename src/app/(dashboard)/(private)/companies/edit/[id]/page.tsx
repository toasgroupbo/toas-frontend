'use client'

// Component Imports
import { useParams } from 'next/navigation'

import Grid from '@mui/material/Grid2'

import { Typography } from '@mui/material'

import AddActividad from '@/views/Dashboard/Companies/add/AddEmpresas'

const EditActividades = () => {
  const params = useParams()
  const actividadId = params.id ? parseInt(params.id as string) : undefined

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Actividades
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Editar <code>actividad</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <AddActividad actividadId={actividadId} />
      </Grid>
    </Grid>
  )
}

export default EditActividades
