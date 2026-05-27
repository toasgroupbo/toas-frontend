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
import type { TravelsToday } from '@/types/api/dashboard'

// Dynamic import for ApexCharts
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

interface TravelsTodayCardProps {
  data?: TravelsToday
  isLoading?: boolean
}

const TravelsTodayCard = ({ data, isLoading }: TravelsTodayCardProps) => {
  const theme = useTheme()

  const chartSeries = [data?.actives ?? 0, data?.closed ?? 0]
  const hasData = chartSeries.some(v => v > 0)

  const chartOptions: ApexOptions = {
    chart: {
      sparkline: { enabled: true }
    },
    colors: [
      'var(--mui-palette-success-main)',
      'var(--mui-palette-secondary-main)'
    ],
    stroke: { width: 0 },
    legend: { show: false },
    dataLabels: { enabled: false },
    labels: ['Activos', 'Cerrados'],
    states: {
      hover: { filter: { type: 'none' } },
      active: { filter: { type: 'none' } }
    },
    plotOptions: {
      pie: {
        customScale: 0.9,
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              offsetY: 20,
              fontSize: '0.75rem',
              fontFamily: theme.typography.fontFamily,
              color: 'var(--mui-palette-text-secondary)'
            },
            value: {
              offsetY: -15,
              fontWeight: 500,
              fontSize: '1.5rem',
              formatter: val => `${val}`,
              fontFamily: theme.typography.fontFamily,
              color: 'var(--mui-palette-text-primary)'
            },
            total: {
              show: true,
              fontSize: '0.75rem',
              label: 'Total',
              fontFamily: theme.typography.fontFamily,
              color: 'var(--mui-palette-text-secondary)',
              formatter: () => `${data?.total ?? 0}`
            }
          }
        }
      }
    },
    tooltip: {
      y: {
        formatter: val => `${val} viajes`
      }
    }
  }

  const items = [
    { label: 'Activos', value: data?.actives ?? 0, color: 'success' as const },
    { label: 'Cerrados', value: data?.closed ?? 0, color: 'secondary' as const }
  ]

  return (
    <Card className='h-full'>
      <CardContent className='flex flex-col items-center gap-2 p-4'>
        <div className='flex items-center gap-2 w-full'>
          <CustomAvatar color='info' variant='rounded' size={40} skin='light'>
            <i className='tabler-bus' style={{ fontSize: '1.25rem' }} />
          </CustomAvatar>
          <Typography variant='subtitle1' className='font-semibold'>
            VIAJES HOY
          </Typography>
        </div>

        {/* Donut Chart */}
        <div className='flex justify-center items-center w-full'>
          {isLoading ? (
            <Skeleton variant='circular' width={140} height={140} />
          ) : hasData ? (
            <AppReactApexCharts type='donut' height={150} width={150} series={chartSeries} options={chartOptions} />
          ) : (
            <div className='flex flex-col items-center justify-center h-[150px]'>
              <Typography variant='h3' className='font-bold'>
                0
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Sin viajes
              </Typography>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className='w-full flex flex-col gap-1'>
          {items.map(item => (
            <div key={item.label} className='flex justify-between items-center'>
              <div className='flex items-center gap-2'>
                <span
                  className='inline-block w-2 h-2 rounded-full'
                  style={{ backgroundColor: `var(--mui-palette-${item.color}-main)` }}
                />
                <Typography variant='body2' color='text.secondary'>
                  {item.label}
                </Typography>
              </div>
              {isLoading ? (
                <Skeleton variant='text' width={20} />
              ) : (
                <Typography variant='body2' color={`${item.color}.main`} className='font-semibold'>
                  {item.value}
                </Typography>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default TravelsTodayCard
