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

// Hooks Imports
import { useGastronomia } from '@/hooks/useGastronomia'
import { useEntretenimiento } from '@/hooks/useEntretenimiento'
import { useHospedaje } from '@/hooks/useHospedaje'
import { useTuristico } from '@/hooks/useTuristico'
import { useServicio } from '@/hooks/useServicio'

type DataType = {
  icon: string
  stats: string
  title: string
  color: ThemeColor
  isLoading?: boolean
}

const StatisticsCard = () => {
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

  // Crear array dinámico con datos reales
  const data: DataType[] = [
    {
      stats: `${gastronomiaData?.items?.length || 0}`,
      title: 'Gastronomía',
      color: 'success',
      icon: 'tabler-tools-kitchen-2',
      isLoading: loadingGastronomia
    },
    {
      stats: `${entretenimientoData?.items?.length || 0}`,
      title: 'Entretenimiento',
      color: 'primary',
      icon: 'tabler-mask',
      isLoading: loadingEntretenimiento
    },
    {
      stats: `${hospedajeData?.items?.length || 0}`,
      title: 'Hospedajes',
      color: 'info',
      icon: 'tabler-bed',
      isLoading: loadingHospedaje
    },
    {
      stats: `${turisticoData?.items?.length || 0}`,
      title: 'Turístico',
      color: 'secondary',
      icon: 'tabler-map-pin',
      isLoading: loadingTuristico
    },
    {
      stats: `${servicioData?.items?.length || 0}`,
      title: 'Agencias de Viaje',
      color: 'warning',
      icon: 'tabler-plane',
      isLoading: loadingServicio
    }
  ]

  // Calcular total general
  const totalRegistros = data.reduce((sum, item) => sum + parseInt(item.stats), 0)
  const isLoadingAny = data.some(item => item.isLoading)

  return (
    <Card>
      <CardHeader
        title='Estadísticas de Lugares'
        action={
          <Typography variant='subtitle2' color='text.disabled'>
            {isLoadingAny ? 'Cargando...' : `Total: ${totalRegistros} lugares`}
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

export default StatisticsCard
