'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import Skeleton from '@mui/material/Skeleton'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'

// Context
import { useAuth } from '@/contexts/AuthContext'

const WelcomeFleetCard = () => {
  const { user, isLoading, userRole, actingAsCompany } = useAuth()

  const getGreeting = () => {
    const hour = new Date().getHours()

    if (hour < 12) return '¡Buenos días'
    if (hour < 19) return '¡Buenas tardes'

    return '¡Buenas noches'
  }

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      SUPER_ADMIN: 'Super Administrador',
      COMPANY_ADMIN: 'Administrador de Empresa',
      CASHIER: 'Cajero',
      CASHIER_TRIPS: 'Cajero de Viajes',
      CASHIER_SELLER: 'Cajero Vendedor'
    }

    return roleLabels[role] || role
  }

  const greeting = getGreeting()
  const userName = user?.fullName || 'Invitado'
  const companyName = actingAsCompany?.name || user?.company?.name
  const officeName = user?.office?.place?.name

  return (
    <Card>
      <Grid container>
        <Grid size={{ xs: 12, sm: 8 }}>
          <CardContent>
            <Typography variant='h5' className='mbe-4'>
              {greeting} {userName}!
            </Typography>

            {isLoading ? (
              <>
                <Skeleton variant='text' width={180} height={32} className='mbe-1' />
                <Skeleton variant='text' width={220} height={24} className='mbe-2' />
              </>
            ) : (
              <>
                {companyName && (
                  <Typography variant='h4' color='primary.main' className='mbe-1'>
                    {companyName}
                  </Typography>
                )}
                {officeName && (
                  <Typography variant='h6' color='text.secondary' className='mbe-3'>
                    {officeName}
                  </Typography>
                )}
                {!companyName && !officeName && (
                  <Typography variant='h4' color='primary.main' className='mbe-3'>
                    Panel de Administración
                  </Typography>
                )}
              </>
            )}

            <Divider className='mbe-3' />

            <div className='flex flex-wrap gap-3 mbe-3'>
              {userRole && <Chip label={getRoleLabel(userRole)} color='primary' variant='tonal' size='small' />}
              {user?.email && <Chip label={user.email} color='default' variant='tonal' size='small' />}
            </div>
          </CardContent>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <div className='relative bs-full is-full flex items-center justify-center'>
            <img
              alt='Bienvenido a la flota'
              src='/images/illustrations/characters/toast.png'
              className='max-bs-[180px] max-sm:max-bs-[120px] block-end-0 max-is-full'
            />
          </div>
        </Grid>
      </Grid>
    </Card>
  )
}

export default WelcomeFleetCard
