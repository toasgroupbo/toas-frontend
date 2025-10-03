'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'

// Third Party Imports
import type { ApexOptions } from 'apexcharts'
import classnames from 'classnames'

// Types Imports
import type { ThemeColor } from '@core/types'

// Components Imports
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

// Hooks Imports
import { useGastronomia } from '@/hooks/useGastronomia'
import { useEntretenimiento } from '@/hooks/useEntretenimiento'
import { useHospedaje } from '@/hooks/useHospedaje'
import { useTuristico } from '@/hooks/useTuristico'
import { useServicio } from '@/hooks/useServicio'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

type CategoryDataType = {
  title: string
  subtitle: string
  amount: string
  trendNumber: number
  avatarIcon: string
  avatarColor: ThemeColor
  trend?: 'positive' | 'negative'
  isLoading: boolean
}

const TopCategoriesReport = () => {
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

  // Calcular totales y porcentajes
  const gastronomiaCount = gastronomiaData?.items?.length || 0
  const entretenimientoCount = entretenimientoData?.items?.length || 0
  const hospedajeCount = hospedajeData?.items?.length || 0
  const turisticoCount = turisticoData?.items?.length || 0
  const servicioCount = servicioData?.items?.length || 0

  const totalLugares = gastronomiaCount + entretenimientoCount + hospedajeCount + turisticoCount + servicioCount

  // Crear array dinámico con los top 3
  const allCategories = [
    {
      name: 'Gastronomía',
      count: gastronomiaCount,
      icon: 'tabler-tools-kitchen-2',
      color: 'success' as const,
      loading: loadingGastronomia
    },
    {
      name: 'Entretenimiento',
      count: entretenimientoCount,
      icon: 'tabler-mask',
      color: 'primary' as const,
      loading: loadingEntretenimiento
    },
    {
      name: 'Hospedajes',
      count: hospedajeCount,
      icon: 'tabler-bed',
      color: 'info' as const,
      loading: loadingHospedaje
    },
    {
      name: 'Turístico',
      count: turisticoCount,
      icon: 'tabler-map-pin',
      color: 'secondary' as const,
      loading: loadingTuristico
    },
    {
      name: 'Agencias',
      count: servicioCount,
      icon: 'tabler-plane',
      color: 'warning' as const,
      loading: loadingServicio
    }
  ]

  // Ordenar por cantidad y tomar top 3
  const topCategories = allCategories.sort((a, b) => b.count - a.count).slice(0, 3)

  const data: CategoryDataType[] = topCategories.map((category, index) => {
    const percentage = totalLugares > 0 ? (category.count / totalLugares) * 100 : 0
    const position = index + 1

    return {
      title: category.name,
      subtitle: `#${position} en registros`,
      amount: `${category.count}`,
      trendNumber: parseFloat(percentage.toFixed(1)),
      avatarIcon: category.icon,
      avatarColor: category.color,
      trend: percentage > 20 ? 'positive' : undefined,
      isLoading: category.loading
    }
  })

  // Datos para el gráfico (últimos 7 días simulados)
  const series = [{ data: topCategories.map(cat => cat.count) }]
  const primaryColorWithOpacity = 'var(--mui-palette-primary-lightOpacity)'

  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    tooltip: { enabled: false },
    grid: {
      show: false,
      padding: {
        top: -16,
        left: -18,
        right: -17,
        bottom: -11
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        distributed: true,
        columnWidth: '60%'
      }
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    colors: ['var(--mui-palette-success-main)', 'var(--mui-palette-primary-main)', 'var(--mui-palette-info-main)'],
    states: {
      hover: { filter: { type: 'none' } },
      active: { filter: { type: 'none' } }
    },
    xaxis: {
      categories: topCategories.map(cat => cat.name.slice(0, 3)),
      axisTicks: { show: false },
      axisBorder: { show: false },
      tickPlacement: 'on',
      labels: {
        style: {
          fontSize: '13px',
          colors: 'var(--mui-palette-text-disabled)'
        }
      }
    },
    yaxis: { show: false }
  }

  const isLoadingAny = data.some(item => item.isLoading)

  return (
    <Card>
      <CardHeader
        title='Top Categorías'
        subheader='Lugares más registrados'
        action={<OptionMenu options={['Actualizar', 'Exportar', 'Compartir']} />}
      />
      <CardContent className='flex flex-col gap-5'>
        {data.map((item, index) => (
          <div key={index} className='flex items-center gap-4'>
            <CustomAvatar skin='light' variant='rounded' color={item.avatarColor} size={34}>
              <i className={classnames(item.avatarIcon, 'text-[22px]')} />
            </CustomAvatar>
            <div className='flex flex-wrap justify-between items-center gap-x-4 gap-y-1 is-full'>
              <div className='flex flex-col'>
                <Typography className='font-medium' color='text.primary'>
                  {item.title}
                </Typography>
                <Typography variant='body2'>{item.subtitle}</Typography>
              </div>
              <div className='flex items-center gap-4'>
                {item.isLoading ? (
                  <Skeleton variant='text' width={40} height={24} />
                ) : (
                  <Typography>{item.amount}</Typography>
                )}
                <div className='flex items-center gap-1'>
                  <i
                    className={classnames(
                      item.trend === 'positive' ? 'tabler-chevron-up text-success' : 'tabler-minus text-textSecondary',
                      'text-xl'
                    )}
                  />
                  {item.isLoading ? (
                    <Skeleton variant='text' width={30} height={16} />
                  ) : (
                    <Typography variant='body2' className='text-textDisabled'>{`${item.trendNumber}%`}</Typography>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {!isLoadingAny && (
          <div className='pbs-[60px]'>
            <AppReactApexCharts type='bar' height={158} width='100%' series={series} options={options} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TopCategoriesReport
