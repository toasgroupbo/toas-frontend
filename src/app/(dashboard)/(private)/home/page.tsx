'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Components Imports
import CongratulationsJohn from '@views/Dashboard/Inicio/Congratulations'
import DashboardContent, { TravelsTodayCard, DepositsCard, useDashboard } from '@views/Dashboard/Inicio/DashboardContent'

const EcommerceDashboard = () => {
  const { data, isLoading } = useDashboard()

  return (
    <Grid container spacing={6}>
      {/* Welcome Card + Viajes Hoy + Depositos Row */}
      <Grid size={{ xs: 12, md: 6 }}>
        <CongratulationsJohn />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <TravelsTodayCard data={data?.travels_today} isLoading={isLoading} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <DepositsCard data={data?.depositos} isLoading={isLoading} />
      </Grid>

      {/* Dashboard Content */}
      <Grid size={{ xs: 12 }}>
        <DashboardContent />
      </Grid>
    </Grid>
  )
}

export default EcommerceDashboard
