'use client'

import { useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'

// Type Imports
import type { ThemeColor } from '@core/types'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Types
import type { DashboardSummary } from '@/types/api/dashboard'

type StatItem = {
  key: keyof DashboardSummary
  icon: string
  title: string
  color: ThemeColor
}

const allStatItems: StatItem[] = [
  {
    key: 'companies',
    title: 'Empresas',
    color: 'primary',
    icon: 'tabler-building'
  },
  {
    key: 'owners',
    title: 'Dueños',
    color: 'info',
    icon: 'tabler-user-circle'
  },
  {
    key: 'buses',
    title: 'Buses',
    color: 'success',
    icon: 'tabler-bus'
  },
  {
    key: 'offices',
    title: 'Oficinas',
    color: 'warning',
    icon: 'tabler-building-store'
  },
  {
    key: 'routes',
    title: 'Rutas',
    color: 'error',
    icon: 'tabler-route'
  },
  {
    key: 'cashiers',
    title: 'Cajeros',
    color: 'secondary',
    icon: 'tabler-users'
  }
]

interface SummaryCardsProps {
  data?: DashboardSummary
  isLoading?: boolean
  isCompanyMode?: boolean
}

const SummaryCards = ({ data, isLoading, isCompanyMode = false }: SummaryCardsProps) => {
  // Filter out 'companies' stat when in company mode
  const statItems = useMemo(() => {
    if (isCompanyMode) {
      return allStatItems.filter(item => item.key !== 'companies')
    }

    return allStatItems
  }, [isCompanyMode])

  // Calculate grid size based on number of items
  // 6 items: xs:6 sm:4 md:2 (fits 6 in a row on md)
  // 5 items: xs:6 sm:4 md:2.4 (fits 5 in a row on md)
  const gridSize = isCompanyMode
    ? { xs: 6, sm: 4, md: 2.4 }
    : { xs: 6, sm: 4, md: 2 }

  return (
    <Grid container spacing={4}>
      {statItems.map(item => (
        <Grid key={item.key} size={gridSize}>
          <Card
            sx={{
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme => theme.shadows[8]
              }
            }}
          >
            <CardContent className='flex flex-col items-center gap-3 p-4'>
              <Box
                sx={{
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: -4,
                    borderRadius: '12px',
                    background: theme => `${theme.palette[item.color].main}15`,
                    zIndex: 0
                  }
                }}
              >
                <CustomAvatar
                  color={item.color}
                  variant='rounded'
                  size={52}
                  skin='light'
                  sx={{ position: 'relative', zIndex: 1 }}
                >
                  <i className={item.icon} style={{ fontSize: '1.75rem' }} />
                </CustomAvatar>
              </Box>
              {isLoading ? (
                <Skeleton variant='text' width={50} height={44} />
              ) : (
                <Typography
                  variant='h4'
                  className='font-bold'
                  sx={{
                    background: theme =>
                      `linear-gradient(135deg, ${theme.palette[item.color].main} 0%, ${theme.palette[item.color].dark} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {data?.[item.key] ?? 0}
                </Typography>
              )}
              <Typography variant='body2' color='text.secondary' className='text-center font-medium'>
                {item.title}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default SummaryCards
