'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import Skeleton from '@mui/material/Skeleton'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'

// Context Import
import { useAuth } from '@/contexts/AuthContext'
import { usePerfilNegocioActual } from '@/hooks/usePerfilesNegocio'

const WelcomeFleetCard = () => {
  const { user } = useAuth()
  const { data: perfilNegocio, isLoading: cargandoPerfil } = usePerfilNegocioActual()

  // Función para obtener el nombre del usuario (del login)
  const getDisplayName = () => {
    if (!user) return 'Usuario'

    if (user.usuario) {
      return user.usuario
    }

    if (user.correo) {
      return user.correo.split('@')[0]
    }

    return 'Usuario'
  }

  // Función para obtener la información principal a mostrar
  const getMainInfo = () => {
    if (perfilNegocio) {
      return {
        publicador: perfilNegocio.nombre_publicador,
        lugar: perfilNegocio.lugar.nombre_es
      }
    }

    return null
  }

  // Función para obtener el saludo según la hora
  const getGreeting = () => {
    const hour = new Date().getHours()

    if (hour < 12) return '¡Buenos días'
    if (hour < 19) return '¡Buenas tardes'

    return '¡Buenas noches'
  }

  const displayName = getDisplayName()
  const mainInfo = getMainInfo()
  const greeting = getGreeting()

  return (
    <Card>
      <Grid container>
        <Grid size={{ xs: 12, sm: 8 }}>
          <CardContent>
            <Typography variant='h5' className='mbe-4'>
              {greeting} {displayName}! 👋
            </Typography>

            {/* Mostrar información del perfil de negocio */}
            {cargandoPerfil ? (
              <>
                <Skeleton variant='text' width={180} height={32} className='mbe-1' />
                <Skeleton variant='text' width={220} height={24} className='mbe-2' />
              </>
            ) : mainInfo ? (
              <>
                <Typography variant='h4' color='primary.main' className='mbe-1'>
                  {mainInfo.publicador}
                </Typography>
                <Typography variant='h6' color='text.secondary' className='mbe-3'>
                  📍 {mainInfo.lugar}
                </Typography>
              </>
            ) : (
              <Typography variant='h4' color='primary.main' className='mbe-3'>
                {user?.usuario || 'Terminal de Buses'}
              </Typography>
            )}

            <Divider className='mbe-3' />

            {/* Información adicional en tiempo real */}
            <div className='flex flex-wrap gap-3 mbe-3'>
              <Chip label='5 Empresas Activas' color='primary' variant='tonal' size='small' />

              <Chip label='110 Buses Operando' color='info' variant='tonal' size='small' />
            </div>
          </CardContent>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <div className='relative bs-full is-full flex items-center justify-center'>
            <img
              alt={`Bienvenido ${displayName}`}
              src='/images/illustrations/characters/flota1.png'
              className='max-bs-[180px] max-sm:max-bs-[120px] block-end-0 max-is-full'
            />
          </div>
        </Grid>
      </Grid>
    </Card>
  )
}

export default WelcomeFleetCard
