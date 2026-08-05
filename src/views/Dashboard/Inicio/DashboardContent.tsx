'use client'

import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Alert from '@mui/material/Alert'

// Hooks
import { useDashboard, type TravelStatusFilter } from '@/hooks/useDashboard'

// Components
import SummaryCards from './SummaryCards'
import TravelsTodayCard from './TravelsTodayCard'
import DepositsCard from './DepositsCard'
import UpcomingDeparturesTable from './UpcomingDeparturesTable'

const DashboardContent = () => {
  const [statusFilter, setStatusFilter] = useState<TravelStatusFilter>('active')
  const { data, isLoading, error } = useDashboard(statusFilter)

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
        <SummaryCards data={data?.summary} isLoading={isLoading} isCompanyMode={data?.isCompanyMode} />
      </Grid>

      {/* Upcoming Departures Table */}
      <Grid size={{ xs: 12 }}>
        <UpcomingDeparturesTable
          data={data?.travels}
          isLoading={isLoading}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </Grid>
    </Grid>
  )
}

// Export individual cards for use in page layout
export { TravelsTodayCard, DepositsCard }
export { useDashboard, type TravelStatusFilter }

export default DashboardContent
