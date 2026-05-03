'use client'

import { useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Box from '@mui/material/Box'
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid'

// Types
import type { DashboardTravel } from '@/types/api/dashboard'

type StatusFilter = 'all' | 'active' | 'closed' | 'cancelled'

interface UpcomingDeparturesTableProps {
  data?: DashboardTravel[]
  isLoading?: boolean
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  }

  return date.toLocaleDateString('es-BO', options)
}

const formatTime = (dateString: string): string => {
  const date = new Date(dateString)

  return date.toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
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
      return { label: status.toUpperCase(), color: 'default' as const }
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

    const sorted = [...data].sort(
      (a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime()
    )

    if (statusFilter === 'all') return sorted

    return sorted.filter(travel => travel.travel_status === statusFilter)
  }, [data, statusFilter])

  const columns: GridColDef[] = [
    {
      field: 'departure_time',
      headerName: 'FECHA',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' className='whitespace-nowrap'>
          {formatDate(params.value as string)}
        </Typography>
      )
    },
    {
      field: 'time',
      headerName: 'HORA',
      width: 90,
      valueGetter: (_, row) => row.departure_time,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' className='whitespace-nowrap font-medium'>
          {formatTime(params.value as string)}
        </Typography>
      )
    },
    {
      field: 'company',
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
      field: 'route',
      headerName: 'RUTA',
      flex: 1,
      minWidth: 200,
      valueGetter: (_, row) =>
        row.route ? `${row.route.officeOrigin?.place?.name ?? ''} - ${row.route.officeDestination?.place?.name ?? ''}` : '',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' className='whitespace-nowrap'>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'lane',
      headerName: 'CARRIL',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value} size='small' variant='outlined' color='primary' />
      )
    },
    {
      field: 'bus',
      headerName: 'BUS',
      width: 100,
      valueGetter: (_, row) => row.bus?.name ?? '',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2'>{params.value}</Typography>
      )
    },
    {
      field: 'tickets_app_count',
      headerName: 'APP',
      width: 70,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' color='info.main' className='font-medium'>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'tickets_office_count',
      headerName: 'OFICINA',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' color='warning.main' className='font-medium'>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'tickets_count',
      headerName: 'TOTAL',
      width: 70,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' className='font-bold'>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'total',
      headerName: 'TOTAL BS',
      width: 110,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' color='success.main' className='font-bold'>
          Bs {parseFloat(params.value as string).toLocaleString('es-BO')}
        </Typography>
      )
    },
    {
      field: 'travel_status',
      headerName: 'ESTADO',
      width: 120,
      align: 'center',
      headerAlign: 'center',
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
