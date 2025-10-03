'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import type { ApexOptions } from 'apexcharts'

// Hooks Imports
import { useGastronomia } from '@/hooks/useGastronomia'
import { useEntretenimiento } from '@/hooks/useEntretenimiento'
import { useHospedaje } from '@/hooks/useHospedaje'
import { useTuristico } from '@/hooks/useTuristico'
import { useServicio } from '@/hooks/useServicio'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const TotalPlacesGrowth = () => {
  // Hooks
  const theme = useTheme()

  // Obtener datos de todos los hooks
  const { useGetLugaresGastronomia } = useGastronomia()
  const { useGetLugaresEntretenimiento } = useEntretenimiento()
  const { useGetLugaresHospedaje } = useHospedaje()
  const { useGetLugaresTuristico } = useTuristico()
  const { useGetLugaresServicio } = useServicio()

  // Ejecutar las queries
  const { data: gastronomiaData, isLoading: loadingGastronomia } = useGetLugaresGastronomia()
  const { data: entretenimientoData, isLoading: loadingEntretenimiento } = useGetLugaresEntretenimiento()
  const { data: hospedajeData, isLoading: loadingHospedaje } = useGetLugaresHospedaje()
  const { data: turisticoData, isLoading: loadingTuristico } = useGetLugaresTuristico()
  const { data: servicioData, isLoading: loadingServicio } = useGetLugaresServicio()

  // Calcular datos
  const gastronomiaCount = gastronomiaData?.items?.length || 0
  const entretenimientoCount = entretenimientoData?.items?.length || 0
  const hospedajeCount = hospedajeData?.items?.length || 0
  const turisticoCount = turisticoData?.items?.length || 0
  const servicioCount = servicioData?.items?.length || 0

  const totalLugares = gastronomiaCount + entretenimientoCount + hospedajeCount + turisticoCount + servicioCount

  const isLoadingAny =
    loadingGastronomia || loadingEntretenimiento || loadingHospedaje || loadingTuristico || loadingServicio

  const growthData = [
    Math.floor(totalLugares * 0.3),
    Math.floor(totalLugares * 0.45),
    Math.floor(totalLugares * 0.6),
    Math.floor(totalLugares * 0.75),
    Math.floor(totalLugares * 0.85),
    totalLugares
  ]

  const series = [{ data: growthData }]

  // Calcular porcentaje de crecimiento (simulado)
  const previousMonth = Math.floor(totalLugares * 0.85)
  const growthPercentage = previousMonth > 0 ? (((totalLugares - previousMonth) / previousMonth) * 100).toFixed(1) : '0'

  // Vars
  const primaryColor = 'var(--mui-palette-primary-main)'

  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: val => `${val} lugares`
      }
    },
    grid: {
      strokeDashArray: 6,
      borderColor: 'var(--mui-palette-divider)',
      xaxis: {
        lines: { show: true }
      },
      yaxis: {
        lines: { show: false }
      },
      padding: {
        top: -20,
        left: -5,
        right: 10,
        bottom: -10
      }
    },
    stroke: {
      width: 3,
      lineCap: 'butt',
      curve: 'smooth'
    },
    colors: [primaryColor],
    markers: {
      size: 4,
      strokeWidth: 3,
      colors: primaryColor,
      strokeColors: 'transparent',
      discrete: [
        {
          size: 5.5,
          seriesIndex: 0,
          strokeColor: primaryColor,
          fillColor: 'var(--mui-palette-background-paper)',
          dataPointIndex: series[0].data.length - 1
        }
      ]
    },
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: {
      labels: { show: false }
    },
    responsive: [
      {
        breakpoint: theme.breakpoints.values.lg,
        options: {
          chart: { height: 68 }
        }
      },
      {
        breakpoint: theme.breakpoints.values.md,
        options: {
          chart: { height: 98 }
        }
      },
      {
        breakpoint: 430,
        options: {
          chart: { height: 114 }
        }
      }
    ]
  }

  return (
    <Card>
      <CardHeader title='Total de Lugares' subheader='Crecimiento acumulado' className='pbe-0' />
      <CardContent className='flex flex-col gap-3 pbs-3'>
        {isLoadingAny ? (
          <Skeleton variant='rounded' width='100%' height={68} />
        ) : (
          <AppReactApexCharts type='line' height={68} width='100%' options={options} series={series} />
        )}

        <div className='flex items-center justify-between flex-wrap gap-x-4 gap-y-0.5'>
          {isLoadingAny ? (
            <>
              <Skeleton variant='text' width={80} height={40} />
              <Skeleton variant='text' width={60} height={24} />
            </>
          ) : (
            <>
              <Typography variant='h4' color='text.primary'>
                {totalLugares}
              </Typography>
              <Typography variant='body2' color={parseFloat(growthPercentage) > 0 ? 'success.main' : 'text.secondary'}>
                {parseFloat(growthPercentage) > 0 ? '+' : ''}
                {growthPercentage}%
              </Typography>
            </>
          )}
        </div>

        <Typography variant='body2' color='text.secondary'>
          Todas las categorías combinadas
        </Typography>
      </CardContent>
    </Card>
  )
}

export default TotalPlacesGrowth
