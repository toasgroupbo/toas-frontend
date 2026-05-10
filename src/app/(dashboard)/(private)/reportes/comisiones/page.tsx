'use client'

// Component Imports
import dynamic from 'next/dynamic'

import Grid from '@mui/material/Grid2'
import { Typography, CircularProgress, Box } from '@mui/material'

const VentasTable = dynamic(() => import('@/views/Dashboard/comisiones/list/VentasTable'), {
  ssr: false,
  loading: () => (
    <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
      <CircularProgress />
    </Box>
  )
})

const PageVentas = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Reporte de Comisiones
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>Visualiza y analiza el reporte de ventas</Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <VentasTable />
      </Grid>
    </Grid>
  )
}

export default PageVentas
