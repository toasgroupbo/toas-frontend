'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import Skeleton from '@mui/material/Skeleton'

// Type Imports
import type { ThemeColor } from '@core/types'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

type DataType = {
  icon: string
  stats: string
  title: string
  color: ThemeColor
  isLoading?: boolean
}

const FleetStatisticsCard = () => {
  const data: DataType[] = [
    {
      stats: '5',
      title: 'Empresas Activas',
      color: 'primary',
      icon: 'tabler-building',
      isLoading: false
    },
    {
      stats: '110',
      title: 'Total de Buses',
      color: 'success',
      icon: 'tabler-bus',
      isLoading: false
    },
    {
      stats: '36',
      title: 'Rutas Disponibles',
      color: 'info',
      icon: 'tabler-route',
      isLoading: false
    },
    {
      stats: '8',
      title: 'Salidas Hoy',
      color: 'warning',
      icon: 'tabler-clock',
      isLoading: false
    },
    {
      stats: '95%',
      title: 'Puntualidad',
      color: 'secondary',
      icon: 'tabler-chart-line',
      isLoading: false
    }
  ]

  const totalBuses = 110
  const isLoadingAny = data.some(item => item.isLoading)

  return (
    <Card>
      <CardHeader
        title='Estadísticas de Generales'
        action={
          <Typography variant='subtitle2' color='text.disabled'>
            {isLoadingAny ? 'Cargando...' : `${totalBuses} buses en operación`}
          </Typography>
        }
      />
      <CardContent className='flex justify-between flex-wrap gap-4 md:pbs-10 max-md:pbe-6 max-[1060px]:pbe-[74px] max-[1200px]:pbe-[52px] max-[1320px]:pbe-[74px] max-[1501px]:pbe-[52px]'>
        <Grid container spacing={4} sx={{ inlineSize: '100%' }}>
          {data.map((item, index) => (
            <Grid key={index} size={{ xs: 6, sm: 3 }} className='flex items-center gap-4'>
              <CustomAvatar color={item.color} variant='rounded' size={40} skin='light'>
                <i className={item.icon}></i>
              </CustomAvatar>
              <div className='flex flex-col'>
                {item.isLoading ? (
                  <Skeleton variant='text' width={60} height={32} />
                ) : (
                  <Typography variant='h5'>{item.stats}</Typography>
                )}
                <Typography variant='body2'>{item.title}</Typography>
              </div>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default FleetStatisticsCard
