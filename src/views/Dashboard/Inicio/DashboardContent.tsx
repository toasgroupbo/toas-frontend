'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Alert from '@mui/material/Alert'

// Hooks
import { useDashboard } from '@/hooks/useDashboard'

// Components
import SummaryCards from './SummaryCards'
import TravelsTodayCard from './TravelsTodayCard'
import DepositsCard from './DepositsCard'
import UpcomingDeparturesTable from './UpcomingDeparturesTable'

const DashboardContent = () => {
  const { data, isLoading, error } = useDashboard()

  if (error) {
    return (
      <Alert severity='error' className='mb-4'>
        Error al cargar los datos del dashboard. Por favor, intente nuevamente.
      </Alert>
    )
  }

  return (
    <Grid container spacing={4}>
      {/* Summary Cards Row */}
      <Grid size={{ xs: 12 }}>
        <SummaryCards data={data?.summary} isLoading={isLoading} />
      </Grid>

      {/* Upcoming Departures Table */}
      <Grid size={{ xs: 12 }}>
        <UpcomingDeparturesTable data={data?.travels} isLoading={isLoading} />
      </Grid>
    </Grid>
  )
}

// Export individual cards for use in page layout
export { TravelsTodayCard, DepositsCard }
export { useDashboard }

export default DashboardContent
