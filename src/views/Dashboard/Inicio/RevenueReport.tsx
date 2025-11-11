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

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const FLEET_DATA = {
  empresas: [
    { nombre: 'Trans Cordillera', buses: 24, rutas: 8 },
    { nombre: 'Expreso del Sur', buses: 18, rutas: 5 },
    { nombre: 'Bolivia Express', buses: 31, rutas: 12 },
    { nombre: 'Copacabana Tours', buses: 15, rutas: 4 },
    { nombre: 'Turismo Imperial', buses: 22, rutas: 7 }
  ],
  actividadesRecientes: [
    { tipo: 'salida', empresa: 'Trans Cordillera', destino: 'Cochabamba', hora: '08:30', estado: 'A tiempo' },
    { tipo: 'llegada', empresa: 'Bolivia Express', origen: 'Santa Cruz', hora: '09:15', estado: 'Retrasado 15min' },
    { tipo: 'mantenimiento', empresa: 'Expreso del Sur', bus: 'Bus #12', hora: '10:00', estado: 'En proceso' },
    { tipo: 'salida', empresa: 'Copacabana Tours', destino: 'Copacabana', hora: '10:30', estado: 'A tiempo' },
    { tipo: 'llegada', empresa: 'Turismo Imperial', origen: 'Oruro', hora: '11:00', estado: 'A tiempo' }
  ]
}

// Vars
const periodOptions = ['Hoy', 'Esta Semana', 'Este Mes']

const FleetReport = () => {
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

  const empresasData = FLEET_DATA.empresas
  const busesCount = empresasData.map(emp => emp.buses)
  const rutasCount = empresasData.map(emp => emp.rutas)

  const totalBuses = busesCount.reduce((sum, count) => sum + count, 0)
  const totalRutas = rutasCount.reduce((sum, count) => sum + count, 0)
  const totalEmpresas = empresasData.length

  const empresaLider = empresasData.reduce(
    (max, current) => (current.buses > max.buses ? current : max),
    empresasData[0] || { buses: 0, nombre: '', rutas: 0 }
  )

  const barSeries = [
    {
      name: 'Buses',
      data: busesCount
    }
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
        formatter: val => `${val} buses`
      }
    },
    dataLabels: { enabled: false },
    stroke: {
      width: 6,
      colors: ['var(--mui-palette-background-paper)']
    },
    colors: [
      'var(--mui-palette-primary-main)',
      'var(--mui-palette-success-main)',
      'var(--mui-palette-info-main)',
      'var(--mui-palette-warning-main)',
      'var(--mui-palette-secondary-main)'
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
      categories: empresasData.map(emp => emp.nombre),
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

  const getEstadoColor = (estado: string) => {
    if (estado.includes('tiempo')) return 'success'
    if (estado.includes('Retrasado')) return 'warning'
    if (estado.includes('proceso')) return 'info'

    return 'default'
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'salida':
        return 'Salida'
      case 'llegada':
        return 'Llegada'
      case 'mantenimiento':
        return 'Mantenimiento'
      default:
        return 'Actividad'
    }
  }

  return (
    <Card>
      <Grid container>
        <Grid size={{ xs: 12, md: 8 }} className='border-be sm:border-be-0 sm:border-ie'>
          <CardHeader
            title='Flotas por Empresa'
            action={
              <>
                <Button
                  variant='text'
                  color='primary'
                  onClick={handleClick}
                  endIcon={<i className='tabler-chevron-down' />}
                >
                  {selectedPeriod}
                </Button>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => handleClose()}>
                  {periodOptions.map((period, index) => (
                    <MenuItem key={index} onClick={() => handleClose(period)}>
                      {period}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            }
          />
          <CardContent>
            <AppReactApexCharts type='bar' height={320} width='100%' series={barSeries} options={barOptions} />

            {/* Estadísticas resumidas */}
            <Grid container spacing={4} className='mbs-6'>
              <Grid size={{ xs: 4 }}>
                <div className='flex flex-col items-center'>
                  <Typography variant='h5' color='primary'>
                    {totalEmpresas}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Empresas
                  </Typography>
                </div>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <div className='flex flex-col items-center'>
                  <Typography variant='h5' color='success.main'>
                    {totalBuses}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Buses
                  </Typography>
                </div>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <div className='flex flex-col items-center'>
                  <Typography variant='h5' color='info.main'>
                    {totalRutas}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Rutas
                  </Typography>
                </div>
              </Grid>
            </Grid>
          </CardContent>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <CardContent className='flex flex-col justify-between min-bs-full'>
            {/* Actividades Recientes */}
            <div>
              <Typography variant='h6' className='mbe-4'>
                Actividades Recientes
              </Typography>
              <div className='flex flex-col gap-4'>
                {FLEET_DATA.actividadesRecientes.map((actividad, index) => (
                  <div key={index} className='flex items-start gap-3'>
                    <div className='flex flex-col items-center'>
                      <div className='is-2 bs-2 rounded-full bg-primary' />
                      {index < FLEET_DATA.actividadesRecientes.length - 1 && (
                        <div className='min-bs-[28px] is-px border-l border-dashed' />
                      )}
                    </div>
                    <div className='flex flex-col flex-1 gap-1'>
                      <div className='flex items-center justify-between gap-2'>
                        <Typography variant='body2' className='font-medium'>
                          {getTipoLabel(actividad.tipo)}
                        </Typography>
                        <Typography variant='caption' color='text.disabled'>
                          {actividad.hora}
                        </Typography>
                      </div>
                      <Typography variant='body2' color='text.secondary'>
                        {actividad.empresa}
                      </Typography>
                      <Typography variant='caption' color='text.disabled'>
                        {actividad.destino || actividad.origen || actividad.bus}
                      </Typography>
                      <Typography variant='caption' className={`font-medium text-${getEstadoColor(actividad.estado)}`}>
                        {actividad.estado}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Empresa Líder */}
            <div className='mbs-6'>
              <div className='flex flex-col gap-2 p-4 bg-primary rounded'>
                <Typography variant='body2' className='text-white opacity-80'>
                  Empresa Líder
                </Typography>
                <Typography variant='h6' className='text-white font-semibold'>
                  {empresaLider.nombre}
                </Typography>
                <Typography variant='body2' className='text-white opacity-90'>
                  {empresaLider.buses} buses • {empresaLider.rutas} rutas
                </Typography>
              </div>
            </div>
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  )
}

export default FleetReport
