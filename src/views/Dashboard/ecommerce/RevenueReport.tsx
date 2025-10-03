'use client'

// React Imports
import { useState } from 'react'
import type { MouseEvent } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'

// Third Party Imports
import type { ApexOptions } from 'apexcharts'

// Hooks Imports
import { useGastronomia } from '@/hooks/useGastronomia'
import { useEntretenimiento } from '@/hooks/useEntretenimiento'
import { useHospedaje } from '@/hooks/useHospedaje'
import { useTuristico } from '@/hooks/useTuristico'
import { useServicio } from '@/hooks/useServicio'
import { useActividades } from '@/hooks/useActividades'

// Component Imports
import ActivitiesTimeline from '@/views/Dashboard/ecommerce/ActivitiesTimeline'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

// Vars
const periodOptions = ['Último Mes', 'Últimos 3 Meses', 'Último Año']

const PlacesAndActivitiesReport = () => {
  // States
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedPeriod, setSelectedPeriod] = useState(periodOptions[0])

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = (period?: string) => {
    setAnchorEl(null)

    if (period && period !== selectedPeriod) {
      setSelectedPeriod(period)
    }
  }

  // Hooks
  const theme = useTheme()

  const { useGetLugaresGastronomia } = useGastronomia()
  const { useGetLugaresEntretenimiento } = useEntretenimiento()
  const { useGetLugaresHospedaje } = useHospedaje()
  const { useGetLugaresTuristico } = useTuristico()
  const { useGetLugaresServicio } = useServicio()

  // Obtener datos de actividades
  const { actividades, total: totalActividades, isLoading: loadingActividades } = useActividades()

  // Ejecutar las queries de lugares
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
    loadingGastronomia ||
    loadingEntretenimiento ||
    loadingHospedaje ||
    loadingTuristico ||
    loadingServicio ||
    loadingActividades

  // Datos para el gráfico de barras
  const barSeries = [
    {
      name: 'Lugares Registrados',
      data: [gastronomiaCount, entretenimientoCount, hospedajeCount, turisticoCount, servicioCount]
    }
  ]

  // Encontrar la categoría líder
  const categories = [
    { name: 'Gastronomía', count: gastronomiaCount },
    { name: 'Entretenimiento', count: entretenimientoCount },
    { name: 'Hospedajes', count: hospedajeCount },
    { name: 'Turístico', count: turisticoCount },
    { name: 'Agencias', count: servicioCount }
  ]

  const leadingCategory = categories.reduce(
    (max, current) => (current.count > max.count ? current : max),
    categories[0] || { count: 0, name: '' }
  )

  // Datos para el gráfico de línea (tendencia simulada)
  const lineSeries = [
    { name: 'Lugares', data: [totalLugares * 0.85, totalLugares] },
    { name: 'Actividades', data: [totalActividades * 0.75, totalActividades] }
  ]

  // Vars
  const disabledText = 'var(--mui-palette-text-disabled)'

  const barOptions: ApexOptions = {
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
    dataLabels: { enabled: false },
    stroke: {
      width: 6,
      colors: ['var(--mui-palette-background-paper)']
    },
    colors: [
      'var(--mui-palette-success-main)',
      'var(--mui-palette-primary-main)',
      'var(--mui-palette-info-main)',
      'var(--mui-palette-secondary-main)',
      'var(--mui-palette-warning-main)'
    ],
    legend: {
      offsetY: -4,
      offsetX: -35,
      position: 'top',
      horizontalAlign: 'left',
      fontSize: '13px',
      fontFamily: theme.typography.fontFamily,
      labels: { colors: 'var(--mui-palette-text-secondary)' },
      itemMargin: { horizontal: 9 },
      markers: {
        size: 10,
        strokeWidth: 0,
        offsetY: 1,
        offsetX: theme.direction === 'rtl' ? 7 : -4
      }
    },
    states: {
      hover: { filter: { type: 'none' } },
      active: { filter: { type: 'none' } }
    },
    plotOptions: {
      bar: {
        borderRadius: 7,
        columnWidth: '40%',
        borderRadiusApplication: 'around'
      }
    },
    grid: {
      borderColor: 'var(--mui-palette-divider)',
      yaxis: { lines: { show: false } },
      padding: {
        left: -6,
        right: -11,
        bottom: -11
      }
    },
    xaxis: {
      axisTicks: { show: false },
      crosshairs: { opacity: 0 },
      axisBorder: { show: false },
      categories: ['Gastronomía', 'Entretenimiento', 'Hospedajes', 'Turístico', 'Agencias'],
      labels: {
        style: {
          colors: disabledText,
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.body2.fontSize as string
        }
      }
    },
    yaxis: {
      tickAmount: 5,
      labels: {
        offsetX: -14,
        style: {
          colors: disabledText,
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.body2.fontSize as string
        }
      }
    }
  }

  const lineOptions: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    stroke: {
      width: [2, 2],
      curve: 'smooth',
      dashArray: [0, 0]
    },
    colors: ['var(--mui-palette-primary-main)', 'var(--mui-palette-secondary-main)'],
    legend: { show: false },
    markers: {
      size: 4,
      strokeWidth: 2,
      strokeColors: ['var(--mui-palette-primary-main)', 'var(--mui-palette-secondary-main)'],
      fillOpacity: 1
    },
    grid: {
      padding: {
        top: -28,
        left: -11,
        right: 0,
        bottom: -15
      },
      yaxis: { lines: { show: false } }
    },
    xaxis: {
      categories: ['Anterior', 'Actual'],
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: {
      labels: { show: false }
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val, { seriesIndex }) => `${val} ${seriesIndex === 0 ? 'lugares' : 'actividades'}`
      }
    }
  }

  return (
    <Card>
      <Grid container>
        <Grid size={{ xs: 12, sm: 8 }} className='border-r'>
          <CardHeader title='Lugares por Categoría ' />
          <CardContent>
            {isLoadingAny ? (
              <Skeleton variant='rounded' width='100%' height={320} />
            ) : (
              <AppReactApexCharts type='bar' height={320} width='100%' series={barSeries} options={barOptions} />
            )}
          </CardContent>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CardContent className='flex flex-col justify-center min-bs-full'>
            {/* 🎯 Programación de actividades */}
            <ActivitiesTimeline />
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  )
}

export default PlacesAndActivitiesReport
