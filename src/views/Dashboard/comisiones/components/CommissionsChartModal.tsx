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
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import type { ApexOptions } from 'apexcharts'

import type { Commission } from '@/types/api/commissions'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'), { ssr: false })

interface CommissionsChartModalProps {
  open: boolean
  onClose: () => void
  data: Commission[]
  isCompanyAdmin?: boolean
}

const CommissionsChartModal = ({ open, onClose, data, isCompanyAdmin = false }: CommissionsChartModalProps) => {
  const theme = useTheme()

  // Group data by date for chart labels
  const labels = data.map(item => {
    const date = new Date(item.departure_time)

    return date.toLocaleDateString('es-BO', {
      day: 'numeric',
      month: 'short'
    })
  })

  const commissionApp = data.map(item => parseFloat(item.commission_app_total) || 0)
  const commissionPlatform = data.map(item => parseFloat(item.commission_company_total) || 0)

  const series = isCompanyAdmin
    ? [
        {
          name: 'Comisión Plataforma',
          data: commissionPlatform
        }
      ]
    : [
        {
          name: 'Comisión App',
          data: commissionApp
        },
        {
          name: 'Comisión Plataforma',
          data: commissionPlatform
        }
      ]

  const colors = isCompanyAdmin
    ? ['var(--mui-palette-primary-main)']
    : ['var(--mui-palette-primary-main)', 'var(--mui-palette-warning-main)']

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
    colors,
    xaxis: {
      categories: labels,
      axisTicks: { show: false },
      axisBorder: { show: false },
      labels: {
        style: {
          colors: 'var(--mui-palette-text-disabled)',
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.body2.fontSize as string
        },
        rotate: -45,
        rotateAlways: labels.length > 4
      }
    },
    yaxis: {
      title: {
        text: 'Monto (Bs.)',
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
        formatter: val => `Bs. ${val.toFixed(2)}`
      },
      theme: theme.palette.mode
    }
  }

  const totalCommissionApp = commissionApp.reduce((a, b) => a + b, 0)
  const totalCommissionPlatform = commissionPlatform.reduce((a, b) => a + b, 0)
  const totalSaldo = totalCommissionApp - totalCommissionPlatform
  const totalTicketsApp = data.reduce((sum, item) => sum + (item.tickets_app_count || 0), 0)

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Box display='flex' alignItems='center' gap={2}>
            <i className='tabler-chart-bar' style={{ fontSize: '24px' }} />
            <Typography variant='h5'>Reporte de Comisiones</Typography>
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
            {/* Summary Cards */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: isCompanyAdmin ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: 2,
                mb: 4
              }}
            >
              {!isCompanyAdmin && (
                <Card
                  sx={{
                    p: 2.5,
                    textAlign: 'center',
                    bgcolor: 'primary.lighter',
                    border: '1px solid',
                    borderColor: 'primary.main'
                  }}
                >
                  <Typography variant='h4' color='primary.main' fontWeight={700}>
                    Bs. {totalCommissionApp.toFixed(2)}
                  </Typography>
                  <Typography variant='body2' color='primary.dark' fontWeight={500}>
                    Total Comisión App
                  </Typography>
                </Card>
              )}

              <Card
                sx={{
                  p: 2.5,
                  textAlign: 'center',
                  bgcolor: 'warning.lighter',
                  border: '1px solid',
                  borderColor: 'warning.main'
                }}
              >
                <Typography variant='h4' color='warning.main' fontWeight={700}>
                  Bs. {totalCommissionPlatform.toFixed(2)}
                </Typography>
                <Typography variant='body2' color='warning.dark' fontWeight={500}>
                  Total Plataforma
                </Typography>
              </Card>

              {!isCompanyAdmin && (
                <Card
                  sx={{
                    p: 2.5,
                    textAlign: 'center',
                    bgcolor: 'success.lighter',
                    border: '1px solid',
                    borderColor: 'success.main'
                  }}
                >
                  <Typography variant='h4' color='success.main' fontWeight={700}>
                    Bs. {totalSaldo.toFixed(2)}
                  </Typography>
                  <Typography variant='body2' color='success.dark' fontWeight={500}>
                    Saldo Neto
                  </Typography>
                </Card>
              )}

              <Card
                sx={{
                  p: 2.5,
                  textAlign: 'center',
                  bgcolor: 'info.lighter',
                  border: '1px solid',
                  borderColor: 'info.main'
                }}
              >
                <Typography variant='h4' color='info.main' fontWeight={700}>
                  {totalTicketsApp}
                </Typography>
                <Typography variant='body2' color='info.dark' fontWeight={500}>
                  Ventas App
                </Typography>
              </Card>
            </Box>

            {/* Bar Chart */}
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

export default CommissionsChartModal
