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

import { useAuth } from '@/contexts/AuthContext'

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
  const { isCompanyAdmin, isImpersonating } = useAuth()

  // Determinar si mostrar dueño en lugar de empresa
  const showOwnerInsteadOfCompany = isCompanyAdmin || isImpersonating

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
    ...(showOwnerInsteadOfCompany
      ? [
          {
            field: 'owner',
            headerName: 'DUEÑO',
            width: 200,
            valueGetter: (_: any, row: any) => row.bus?.owner?.name ?? '',
            renderCell: (params: GridRenderCellParams) => (
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 1 }}>
                <Typography variant='body2' className='font-medium' sx={{ lineHeight: 1.4 }}>
                  {params.row.bus?.owner?.name ?? 'N/A'}
                </Typography>
                <Typography variant='caption' color='text.secondary' sx={{ lineHeight: 1.2 }}>
                  CI: {params.row.bus?.owner?.ci ?? 'N/A'} | Tel: {params.row.bus?.owner?.phone ?? 'N/A'}
                </Typography>
              </Box>
            )
          }
        ]
      : [
          {
            field: 'empresa',
            headerName: 'EMPRESA',
            width: 150,
            valueGetter: (_: any, row: any) => row.company?.name ?? '',
            renderCell: (params: GridRenderCellParams) => (
              <Typography variant='body2' className='font-medium'>
                {params.value}
              </Typography>
            )
          }
        ]),
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
      valueGetter: (_, row) => row.seatsAvailable ?? 0,
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
      valueGetter: (_, row) => row.seatsApp ?? 0,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title='Boletos vendidos por App'>
          <Typography variant='body2' color='info.main' className='font-medium'>
            {params.value}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'vendidos_oficina',
      headerName: 'VENDIDOS OFICINA',
      width: 140,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (_, row) => row.seatsOffice ?? 0,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title='Boletos vendidos en oficina'>
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
      valueGetter: (_, row) => row.totalSoldSeats ?? 0,
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
        title='ULTIMAS 20 SALIDAS'
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
          rowHeight={showOwnerInsteadOfCompany ? 60 : 52}
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
