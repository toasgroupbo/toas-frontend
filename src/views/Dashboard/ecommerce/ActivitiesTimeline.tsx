'use client'

import { useMemo } from 'react'

import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import LinearProgress from '@mui/material/LinearProgress'
import Divider from '@mui/material/Divider'

import { useActividades } from '@/hooks/useActividades'

const ActivitiesTimeline = () => {
  const { actividades, total: totalActividades, isLoading: loadingActividades } = useActividades()

  const extractDateFromUTC = (utcDateString: string): string => {
    return utcDateString.split('T')[0]
  }

  const getBolivianDate = (date: Date): Date => {
    return new Date(date.toLocaleString('en-US', { timeZone: 'America/La_Paz' }))
  }

  const timelineStats = useMemo(() => {
    if (!actividades || actividades.length === 0) {
      return { today: 0, thisWeek: 0, thisMonth: 0, upcoming: [] }
    }

    const now = new Date()
    const todayBolivia = getBolivianDate(now)
    const today = new Date(todayBolivia.getFullYear(), todayBolivia.getMonth(), todayBolivia.getDate())
    const weekStart = new Date(today)
    const weekEnd = new Date(today)

    weekStart.setDate(today.getDate() - today.getDay())
    weekEnd.setDate(today.getDate() - today.getDay() + 6)
    const monthStart = new Date(todayBolivia.getFullYear(), todayBolivia.getMonth(), 1)
    const monthEnd = new Date(todayBolivia.getFullYear(), todayBolivia.getMonth() + 1, 0)

    let todayCount = 0
    let thisWeekCount = 0
    let thisMonthCount = 0
    const upcomingEvents: { date: string; count: number }[] = []

    const eventsByDate = actividades.reduce(
      (acc, actividad) => {
        if (!actividad.evento || !actividad.evento.fecha) {
          return acc
        }

        const dateStr = extractDateFromUTC(actividad.evento.fecha)

        if (!acc[dateStr]) {
          acc[dateStr] = []
        }

        acc[dateStr].push(actividad)

        return acc
      },
      {} as Record<string, typeof actividades>
    )

    Object.entries(eventsByDate).forEach(([dateStr, activities]) => {
      const eventDate = new Date(dateStr + 'T12:00:00')
      const count = activities.length

      const eventYear = eventDate.getFullYear()
      const eventMonth = eventDate.getMonth()
      const eventDay = eventDate.getDate()

      const todayYear = todayBolivia.getFullYear()
      const todayMonth = todayBolivia.getMonth()
      const todayDay = todayBolivia.getDate()

      if (eventYear === todayYear && eventMonth === todayMonth && eventDay === todayDay) {
        todayCount += count
      }

      const normalizedEventDate = new Date(eventYear, eventMonth, eventDay)

      if (normalizedEventDate >= weekStart) {
        thisWeekCount += count
      }

      if (normalizedEventDate >= monthStart) {
        thisMonthCount += count
      }

      if (normalizedEventDate >= today) {
        upcomingEvents.push({
          date: dateStr,
          count
        })
      }
    })

    upcomingEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return {
      today: todayCount,
      thisWeek: thisWeekCount,
      thisMonth: thisMonthCount,
      upcoming: upcomingEvents.slice(0, 4)
    }
  }, [actividades])

  if (loadingActividades) {
    return (
      <Box className='flex flex-col gap-4 h-full'>
        <Skeleton variant='rectangular' width='100%' height={60} sx={{ borderRadius: 2 }} />
        <Skeleton variant='rectangular' width='100%' height={120} sx={{ borderRadius: 2 }} />
        <Skeleton variant='rectangular' width='100%' height={100} sx={{ borderRadius: 2 }} />
      </Box>
    )
  }

  if (totalActividades === 0) {
    return (
      <Box className='flex flex-col items-center justify-center h-full gap-4 text-center'>
        <Box className='text-6xl'>📅</Box>
        <Typography variant='h6' color='text.secondary'>
          Sin actividades programadas
        </Typography>
        <Typography variant='body2' color='text.disabled'>
          Cuando se programen actividades aparecerán aquí
        </Typography>
      </Box>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00')

    return {
      day: date.toLocaleDateString('es-ES', { day: 'numeric', timeZone: 'America/La_Paz' }),
      month: date.toLocaleDateString('es-ES', { month: 'short', timeZone: 'America/La_Paz' }),
      weekday: date.toLocaleDateString('es-ES', { weekday: 'short', timeZone: 'America/La_Paz' })
    }
  }

  const maxCount = Math.max(timelineStats.today, timelineStats.thisWeek, timelineStats.thisMonth)

  return (
    <Box className='flex flex-col gap-4 h-full'>
      <Box className='text-center'>
        <Typography variant='h5' className='font-bold' color='primary.main'>
          📅 Actividades Programadas
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Cronograma de eventos próximos
        </Typography>
      </Box>

      <Card
        variant='outlined'
        sx={{ background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.02) 100%)' }}
      >
        <CardContent className='py-3'>
          <Box className='grid grid-cols-3 gap-2'>
            <Box className='text-center'>
              <Typography variant='h4' color='primary.main' className='font-bold'>
                {timelineStats.today}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Hoy
              </Typography>
              <LinearProgress
                variant='determinate'
                value={maxCount > 0 ? (timelineStats.today / maxCount) * 100 : 0}
                sx={{ mt: 1, height: 4, borderRadius: 2 }}
                color='primary'
              />
            </Box>

            <Box className='text-center'>
              <Typography variant='h4' color='info.main' className='font-bold'>
                {timelineStats.thisWeek}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Semana
              </Typography>
              <LinearProgress
                variant='determinate'
                value={maxCount > 0 ? (timelineStats.thisWeek / maxCount) * 100 : 0}
                sx={{ mt: 1, height: 4, borderRadius: 2 }}
                color='info'
              />
            </Box>

            <Box className='text-center'>
              <Typography variant='h4' color='success.main' className='font-bold'>
                {timelineStats.thisMonth}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Mes
              </Typography>
              <LinearProgress
                variant='determinate'
                value={maxCount > 0 ? (timelineStats.thisMonth / maxCount) * 100 : 0}
                sx={{ mt: 1, height: 4, borderRadius: 2 }}
                color='success'
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {timelineStats.upcoming.length > 0 && (
        <Card variant='outlined'>
          <CardContent className='py-3'>
            <Typography variant='h6' className='mb-3 font-medium' color='text.primary'>
              🗓️ Próximas Fechas
            </Typography>
            <Box className='flex flex-col gap-2'>
              {timelineStats.upcoming.map((event, index) => {
                const dateInfo = formatDate(event.date)

                return (
                  <Box
                    key={index}
                    className='flex items-center justify-between p-2 rounded-lg hover:bg-action-hover transition-colors'
                  >
                    <Box className='flex items-center gap-3'>
                      <Box className='text-center min-w-[45px]'>
                        <Typography variant='h6' className='font-bold leading-none' color='primary.main'>
                          {dateInfo.day}
                        </Typography>
                        <Typography variant='caption' color='text.secondary' className='uppercase'>
                          {dateInfo.month}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant='body2' className='font-medium'>
                          {dateInfo.weekday}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {event.count} actividad{event.count !== 1 ? 'es' : ''}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip label={event.count} size='small' color='primary' variant='filled' />
                  </Box>
                )
              })}
            </Box>
          </CardContent>
        </Card>
      )}

      <Box className='mt-auto'>
        <Divider className='mb-3' />
        <Box className='flex items-center justify-between'>
          <Box>
            <Typography variant='body2' color='text.secondary'>
              Total de actividades
            </Typography>
            <Typography variant='h6' className='font-bold' color='primary.main'>
              {totalActividades} registradas
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default ActivitiesTimeline
