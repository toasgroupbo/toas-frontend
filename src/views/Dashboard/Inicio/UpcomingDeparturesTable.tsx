'use client'

import { useState, useMemo } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid'

type StatusFilter = 'all' | 'active' | 'closed' | 'cancelled'

interface UpcomingDeparturesTableProps {
  data?: any[]
  isLoading?: boolean
}

const formatDateToBolivia = (dateString: string): string => {
  const date = new Date(dateString)

  const boliviaTime = new Date(date.toLocaleString('en-US', { timeZone: 'America/La_Paz' }))

  const weekdays = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

  const months = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre'
  ]

  const weekday = weekdays[boliviaTime.getDay()]
  const day = boliviaTime.getDate()
  const month = months[boliviaTime.getMonth()]

  return `${weekday} ${day} de ${month}`
}

const formatTimeToBolivia = (dateString: string): string => {
  const date = new Date(dateString)

  const boliviaTime = new Date(date.toLocaleString('en-US', { timeZone: 'America/La_Paz' }))

  return boliviaTime.toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/La_Paz'
  })
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'active':
      return { label: 'ACTIVO', color: 'success' as const }
    case 'closed':
      return { label: 'CERRADO', color: 'secondary' as const }
    case 'cancelled':
      return { label: 'CANCELADO', color: 'error' as const }
    default:
      return { label: status?.toUpperCase() || 'DESCONOCIDO', color: 'default' as const }
  }
}

const UpcomingDeparturesTable = ({ data, isLoading }: UpcomingDeparturesTableProps) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const handleFilterChange = (_: React.MouseEvent<HTMLElement>, newFilter: StatusFilter | null) => {
    if (newFilter !== null) {
      setStatusFilter(newFilter)
    }
  }

  const filteredData = useMemo(() => {
    if (!data) return []

    const sorted = [...data].sort((a, b) => {
      const dateA = new Date(a.departure_time)
      const dateB = new Date(b.departure_time)

      return dateA.getTime() - dateB.getTime()
    })

    if (statusFilter === 'all') return sorted

    return sorted.filter(travel => travel.travel_status === statusFilter)
  }, [data, statusFilter])

  const columns: GridColDef[] = [
    {
      field: 'fecha',
      headerName: 'FECHA',
      width: 180,
      valueGetter: (_, row) => row.departure_time,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2'>{formatDateToBolivia(params.value as string)}</Typography>
      )
    },
    {
      field: 'hora',
      headerName: 'HORA',
      width: 90,
      valueGetter: (_, row) => row.departure_time,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' className='font-medium'>
          {formatTimeToBolivia(params.value as string)}
        </Typography>
      )
    },
    {
      field: 'empresa',
      headerName: 'EMPRESA',
      width: 150,
      valueGetter: (_, row) => row.company?.name ?? '',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' className='font-medium'>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'ruta',
      headerName: 'RUTA',
      flex: 1,
      minWidth: 200,
      valueGetter: (_, row) =>
        row.route
          ? `${row.route.officeOrigin?.place?.name ?? ''} - ${row.route.officeDestination?.place?.name ?? ''}`
          : '',
      renderCell: (params: GridRenderCellParams) => <Typography variant='body2'>{params.value}</Typography>
    },
    {
      field: 'carril',
      headerName: 'CARRIL',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (_, row) => row.lane ?? '',
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value} size='small' variant='outlined' color='primary' />
      )
    },
    {
      field: 'bus',
      headerName: 'BUS',
      width: 120,
      valueGetter: (_, row) => row.bus?.name ?? '',
      renderCell: (params: GridRenderCellParams) => <Typography variant='body2'>{params.value}</Typography>
    },
    {
      field: 'asientos_libres',
      headerName: 'ASIENTOS LIBRES',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (_, row) => {
        const totalSeats = row.total_seats ?? row.bus?.capacity ?? null

        if (totalSeats === null) return 'N/D'

        const freeSeats = totalSeats - row.tickets_count

        return freeSeats >= 0 ? freeSeats : 0
      },
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title='Asientos disponibles'>
          <Typography variant='body2' color='primary.main' className='font-medium'>
            {params.value}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'vendidos_app',
      headerName: 'VENDIDOS APP',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (_, row) => row.tickets_app_count ?? 0,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title='Boletos vendidos por App'>
          <Typography variant='body2' color='info.main' className='font-medium'>
            {params.value}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'vendidos_qr',
      headerName: 'VENDIDOS QR',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title='Boletos vendidos por QR'>
          <Typography variant='body2' color='secondary.main' className='font-medium'>
            {params.value}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'vendidos_efectivo',
      headerName: 'VENDIDOS OFICINA EFECTIVO',
      width: 180,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (_, row) => row.tickets_office_cash_count ?? 0,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title='Boletos vendidos en efectivo'>
          <Typography variant='body2' color='warning.main' className='font-medium'>
            {params.value}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'total_vendidos',
      headerName: 'TOTAL VENDIDOS',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (_, row) => row.tickets_count ?? 0,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title='Total de boletos vendidos'>
          <Typography variant='body2' className='font-bold'>
            {params.value}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'estado',
      headerName: 'ESTADO',
      width: 110,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (_, row) => row.travel_status ?? '',
      renderCell: (params: GridRenderCellParams) => {
        const statusConfig = getStatusConfig(params.value as string)

        return <Chip label={statusConfig.label} color={statusConfig.color} size='small' variant='tonal' />
      }
    }
  ]

  return (
    <Card>
      <CardHeader
        title='PRÓXIMAS SALIDAS'
        action={
          <Box className='flex items-center gap-4'>
            <ToggleButtonGroup
              value={statusFilter}
              exclusive
              onChange={handleFilterChange}
              size='small'
              aria-label='filtro de estado'
            >
              <ToggleButton value='all'>TODAS</ToggleButton>
              <ToggleButton value='active'>ACTIVOS</ToggleButton>
              <ToggleButton value='closed'>CERRADOS</ToggleButton>
              <ToggleButton value='cancelled'>CANCELADOS</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        }
      />

      <Box sx={{ width: '100%' }}>
        <DataGrid
          rows={filteredData}
          columns={columns}
          loading={isLoading}
          autoHeight
          disableRowSelectionOnClick
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } }
          }}
          slotProps={{
            loadingOverlay: {
              variant: 'skeleton',
              noRowsVariant: 'skeleton'
            }
          }}
          localeText={{
            noRowsLabel: 'No hay viajes para mostrar',
            footerRowSelected: count => `${count} fila(s) seleccionada(s)`
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'action.hover',
              borderRadius: 0
            },
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center'
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover'
            }
          }}
        />
      </Box>
    </Card>
  )
}

export default UpcomingDeparturesTable
