'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import Skeleton from '@mui/material/Skeleton'

// Context Import
import { useAuth } from '@/contexts/AuthContext'
import { usePerfilNegocioActual } from '@/hooks/usePerfilesNegocio'

const CongratulationsUser = () => {
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

  const displayName = getDisplayName()
  const mainInfo = getMainInfo()

  return (
    <Card>
      <Grid container>
        <Grid size={{ xs: 8 }}>
          <CardContent>
            <Typography variant='h5' className='mbe-2'>
              ¡Hola {displayName}! 👋
              <br></br> <br></br> <br></br>
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
                <Typography variant='h6' color='text.secondary' className='mbe-2'>
                  📍 {mainInfo.lugar}
                </Typography>
              </>
            ) : (
              <Typography variant='h4' color='primary.main' className='mbe-1'>
                {user?.usuario || 'Usuario'}
              </Typography>
            )}
          </CardContent>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <div className='relative bs-full is-full'>
            <img
              alt={`Bienvenido ${displayName}`}
              src='/images/illustrations/characters/bienvenida.png'
              className='max-bs-[150px] absolute block-end-0 inline-end-6 max-is-full'
            />
          </div>
        </Grid>
      </Grid>
    </Card>
  )
}

export default CongratulationsUser
