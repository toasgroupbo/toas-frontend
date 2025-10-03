// MUI Imports
import Grid from '@mui/material/Grid2'

// Components Imports
import CongratulationsJohn from '@views/Dashboard/ecommerce/Congratulations'
import StatisticsCard from '@views/Dashboard/ecommerce/StatisticsCard'
import LineChartProfit from '@views/Dashboard/ecommerce/LineChartProfit'
import RadialBarChart from '@views/Dashboard/ecommerce/RadialBarChart'
import DonutChartGeneratedLeads from '@views/Dashboard/ecommerce/DonutChartGeneratedLeads'
import RevenueReport from '@views/Dashboard/ecommerce/RevenueReport'
import EarningReports from '@views/Dashboard/ecommerce/EarningReports'
import PopularProducts from '@views/Dashboard/ecommerce/PopularProducts'
import Orders from '@views/Dashboard/ecommerce/Orders'
import Transactions from '@views/Dashboard/ecommerce/Transactions'
import InvoiceListTable from '@views/Dashboard/ecommerce/InvoiceListTable'

// Data Imports
import { getInvoiceData } from '@/app/server/actions'

/**
 * ! If you need data using an API call, uncomment the below API code, update the `process.env.API_URL` variable in the
 * ! `.env` file found at root of your project and also update the API endpoints like `/apps/invoice` in below example.
 * ! Also, remove the above server action import and the action itself from the `src/app/server/actions.ts` file to clean up unused code
 * ! because we've used the server action for getting our static data.
 */

/* const getInvoiceData = async () => {
  // Vars
  const res = await fetch(`${process.env.API_URL}/apps/invoice`)

  if (!res.ok) {
    throw new Error('Failed to fetch invoice data')
  }

  return res.json()
}
 */

const EcommerceDashboard = async () => {
  // Vars
  const invoiceData = await getInvoiceData()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 4 }}>
        <CongratulationsJohn />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <StatisticsCard />
      </Grid>

      <Grid size={{ xs: 12, xl: 8 }}>
        <RevenueReport />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
        <EarningReports />
      </Grid>
    </Grid>
  )
}

export default EcommerceDashboard
