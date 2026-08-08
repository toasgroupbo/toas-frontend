'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'

// Third Party Imports
import type { ApexOptions } from 'apexcharts'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Types
import type { Depositos } from '@/types/api/dashboard'

// Dynamic import for ApexCharts
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

interface DepositsCardProps {
  data?: Depositos
  isLoading?: boolean
}

const DepositsCard = ({ data, isLoading }: DepositsCardProps) => {
  const theme = useTheme()
  const pendingCount = data?.pendingDeposits ?? 0
  const amount = data?.amount_pending ?? 0

  // Calculate percentage for radial bar (max 100 for visual purposes)
  const percentage = Math.min(pendingCount * 10, 100)

  const chartOptions: ApexOptions = {
    chart: {
      sparkline: { enabled: true }
    },
    stroke: { lineCap: 'round' },
    colors: ['var(--mui-palette-warning-main)'],
    plotOptions: {
      radialBar: {
        hollow: { size: '55%' },
        track: {
          background: 'var(--mui-palette-customColors-trackBg)'
        },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 5,
            fontWeight: 600,
            fontSize: '1.25rem',
            fontFamily: theme.typography.fontFamily,
            color: 'var(--mui-palette-text-primary)',
            formatter: () => `${pendingCount}`
          }
        }
      }
    },
    states: {
      hover: { filter: { type: 'none' } },
      active: { filter: { type: 'none' } }
    }
  }

  return (
    <Card className='h-full'>
      <CardContent className='flex flex-col items-center gap-2 p-4'>
        <div className='flex items-center gap-2 w-full'>
          <CustomAvatar color='success' variant='rounded' size={40} skin='light'>
            <i className='tabler-cash' style={{ fontSize: '1.25rem' }} />
          </CustomAvatar>
          <Typography variant='subtitle1' className='font-semibold'>
            DEPÓSITOS
          </Typography>
        </div>

        {/* Radial Chart */}
        <div className='flex justify-center items-center w-full'>
          {isLoading ? (
            <Skeleton variant='circular' width={140} height={140} />
          ) : (
            <AppReactApexCharts
              key={`deposits-chart-${pendingCount}`}
              type='radialBar'
              height={150}
              width={150}
              series={[percentage]}
              options={chartOptions}
            />
          )}
        </div>

        {/* Info */}
        <div className='w-full flex flex-col gap-2'>
          <div className='flex justify-between items-center'>
            <Typography variant='body2' color='text.secondary'>
              Pendientes
            </Typography>
            {isLoading ? (
              <Skeleton variant='text' width={30} />
            ) : (
              <Typography variant='body2' color='warning.main' className='font-semibold'>
                {pendingCount}
              </Typography>
            )}
          </div>

          <div className='flex justify-between items-center pt-2 border-t border-divider'>
            <Typography variant='body2' className='font-bold'>
              Monto Total
            </Typography>
            {isLoading ? (
              <Skeleton variant='text' width={60} />
            ) : (
              <Typography variant='h6' color='success.main' className='font-bold'>
                Bs {amount.toLocaleString('es-BO')}
              </Typography>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default DepositsCard
