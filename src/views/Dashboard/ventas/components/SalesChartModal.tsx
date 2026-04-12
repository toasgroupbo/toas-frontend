'use client'

import dynamic from 'next/dynamic'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
import type { ApexOptions } from 'apexcharts'

import type { CompanySalesReport } from '@/types/api/companySales'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'), { ssr: false })

interface SalesChartModalProps {
  open: boolean
  onClose: () => void
  data: CompanySalesReport[]
}

const SalesChartModal = ({ open, onClose, data }: SalesChartModalProps) => {
  const theme = useTheme()

  // Preparar datos para el gráfico
  const companies = data.map(item => item.companyName)
  const ventasRealizadas = data.map(item => parseInt(item.ticketsCount) || 0)
  const comisiones = data.map(item => parseFloat(item.totalCommission) || 0)
  const ventasApp = data.map(item => parseInt(item.ticketsAppCount) || 0)
  const ventasCajeros = data.map(item => parseInt(item.ticketsOfficeCount) || 0)

  const series = [
    {
      name: 'Ventas App',
      data: ventasApp
    },
    {
      name: 'Ventas Cajeros',
      data: ventasCajeros
    },
    {
      name: 'Comisión (Bs)',
      data: comisiones
    }
  ]

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      parentHeightOffset: 0,
      toolbar: { show: true },
      zoom: { enabled: false }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 6,
        borderRadiusApplication: 'end'
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      fontSize: '13px',
      fontFamily: theme.typography.fontFamily,
      labels: { colors: 'var(--mui-palette-text-secondary)' },
      markers: {
        size: 10,
        strokeWidth: 0,
        offsetY: 1,
        offsetX: theme.direction === 'rtl' ? 7 : -4
      }
    },
    colors: [
      'var(--mui-palette-primary-main)',
      'var(--mui-palette-success-main)',
      'var(--mui-palette-warning-main)'
    ],
    xaxis: {
      categories: companies,
      axisTicks: { show: false },
      axisBorder: { show: false },
      labels: {
        style: {
          colors: 'var(--mui-palette-text-disabled)',
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.body2.fontSize as string
        },
        rotate: -45,
        rotateAlways: companies.length > 4
      }
    },
    yaxis: {
      title: {
        text: 'Cantidad / Monto',
        style: {
          color: 'var(--mui-palette-text-secondary)',
          fontFamily: theme.typography.fontFamily
        }
      },
      labels: {
        style: {
          colors: 'var(--mui-palette-text-disabled)',
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.body2.fontSize as string
        }
      }
    },
    grid: {
      borderColor: 'var(--mui-palette-divider)',
      padding: {
        bottom: 10
      }
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: (val, { seriesIndex }) => {
          if (seriesIndex === 2) {
            return `Bs ${val.toFixed(2)}`
          }

          return `${val} ventas`
        }
      },
      theme: theme.palette.mode
    }
  }

  // Calcular totales
  const totalVentas = ventasRealizadas.reduce((a, b) => a + b, 0)
  const totalComision = comisiones.reduce((a, b) => a + b, 0)
  const totalVentasApp = ventasApp.reduce((a, b) => a + b, 0)
  const totalVentasCajeros = ventasCajeros.reduce((a, b) => a + b, 0)

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Box display='flex' alignItems='center' gap={2}>
            <i className='tabler-chart-bar' style={{ fontSize: '24px' }} />
            <Typography variant='h5'>Estadísticas de Ventas por Empresa</Typography>
          </Box>
          <IconButton onClick={onClose} size='small'>
            <i className='tabler-x' />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {data.length === 0 ? (
          <Box display='flex' justifyContent='center' alignItems='center' minHeight='300px'>
            <Typography color='text.secondary'>No hay datos disponibles para mostrar</Typography>
          </Box>
        ) : (
          <>
            {/* Resumen de totales */}
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                mb: 4,
                p: 3,
                borderRadius: 2,
                bgcolor: 'action.hover'
              }}
            >
              <Box flex={1} textAlign='center'>
                <Typography variant='h4' color='primary.main'>
                  {totalVentas}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Total Ventas
                </Typography>
              </Box>
              <Box flex={1} textAlign='center'>
                <Typography variant='h4' color='success.main'>
                  {totalVentasApp}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Ventas App
                </Typography>
              </Box>
              <Box flex={1} textAlign='center'>
                <Typography variant='h4' color='info.main'>
                  {totalVentasCajeros}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Ventas Cajeros
                </Typography>
              </Box>
              <Box flex={1} textAlign='center'>
                <Typography variant='h4' color='warning.main'>
                  Bs {totalComision.toFixed(2)}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Total Comisión
                </Typography>
              </Box>
            </Box>

            {/* Gráfico */}
            <AppReactApexCharts type='bar' height={350} width='100%' series={series} options={options} />
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant='outlined' color='secondary'>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SalesChartModal
