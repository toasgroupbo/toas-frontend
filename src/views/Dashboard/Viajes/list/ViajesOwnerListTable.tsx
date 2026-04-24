'use client'

import { useEffect, useMemo, useState } from 'react'

import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import type { TextFieldProps } from '@mui/material/TextField'
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import { Pagination } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'
import { useTravelsForOwner, type TravelFilters } from '@/hooks/useTravels'
import { useOwnerRoutes } from '@/hooks/useCashierTravels'
import type { Travel } from '@/types/api/travels'

type DateRangePreset = 'today' | 'last_week' | 'this_month' | 'last_month' | 'custom'

const getDateRange = (preset: DateRangePreset): { startDate?: string; endDate?: string } => {
  const today = new Date()
  const formatDate = (date: Date) => date.toISOString().split('T')[0]

  switch (preset) {
    case 'today':
      return { startDate: formatDate(today) }

    case 'last_week': {
      const lastWeek = new Date(today)

      lastWeek.setDate(today.getDate() - 7)

      return { startDate: formatDate(lastWeek), endDate: formatDate(today) }
    }

    case 'this_month': {
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

      return { startDate: formatDate(firstDayOfMonth), endDate: formatDate(lastDayOfMonth) }
    }

    case 'last_month': {
      const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)

      return { startDate: formatDate(firstDayOfLastMonth), endDate: formatDate(lastDayOfLastMonth) }
    }

    case 'custom':
      return {}

    default:
      return { startDate: formatDate(today) }
  }
}

type TravelWithActionsType = Travel & {
  actions?: string
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const columnHelper = createColumnHelper<TravelWithActionsType>()

const ViajesOwnerListTable = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [datePreset, setDatePreset] = useState<DateRangePreset>('custom')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')
  const [destinationPlaceId, setDestinationPlaceId] = useState<string>('')

  const { data: ownerRoutes } = useOwnerRoutes()

  const originPlaceName = useMemo(() => {
    if (!ownerRoutes || ownerRoutes.length === 0) return null

    return ownerRoutes[0].officeOrigin.place.name
  }, [ownerRoutes])

  const originPlaceId = useMemo(() => {
    if (!ownerRoutes || ownerRoutes.length === 0) return undefined

    return ownerRoutes[0].officeOrigin.place.id
  }, [ownerRoutes])

  const uniqueDestinations = useMemo(() => {
    if (!ownerRoutes || ownerRoutes.length === 0) return []
    const destinationsMap = new Map<number, { id: number; name: string }>()

    ownerRoutes.forEach((route: any) => {
      const place = route.officeDestination.place

      if (!destinationsMap.has(place.id)) {
        destinationsMap.set(place.id, { id: place.id, name: place.name })
      }
    })

    return Array.from(destinationsMap.values())
  }, [ownerRoutes])

  const apiFilters = useMemo((): TravelFilters => {
    const dateRange =
      datePreset === 'custom'
        ? { startDate: customStartDate || undefined, endDate: customEndDate || undefined }
        : getDateRange(datePreset)

    return {
      status: statusFilter !== 'all' ? (statusFilter as 'active' | 'closed') : undefined,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      origin_placeId: originPlaceId,
      destination_placeId: destinationPlaceId ? Number(destinationPlaceId) : undefined
    }
  }, [statusFilter, datePreset, customStartDate, customEndDate, originPlaceId, destinationPlaceId])

  const { data: travelsResponse, isLoading, error } = useTravelsForOwner(apiFilters)

  const travels = travelsResponse?.data || []
  const amounts = travelsResponse?.amounts || { office: 0, app: 0 }

  const filteredTravels = useMemo(() => {
    if (!travels) return []

    return travels
  }, [travels])

  const totalOfficeAmount = amounts.office || 0
  const totalAppAmount = amounts.app || 0
  const totalAmount = totalOfficeAmount + totalAppAmount

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)

    return date.toLocaleString('es-BO', {
      timeZone: 'America/La_Paz',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

    return `Bs. ${numAmount.toFixed(2)}`
  }

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString)

    return date.toLocaleDateString('es-BO', {
      timeZone: 'America/La_Paz',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const columns = useMemo<ColumnDef<TravelWithActionsType, any>[]>(
    () => [
      columnHelper.accessor('actions', {
        header: 'Acciones',
        cell: () => (
          <div className='flex items-center gap-2'>
            <i className='tabler-eye' style={{ fontSize: '18px', color: 'var(--mui-palette-info-main)' }} />
          </div>
        ),
        enableSorting: false
      }),
      columnHelper.accessor('bus', {
        header: 'Bus',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <i className='tabler-bus' style={{ fontSize: '20px', color: 'var(--mui-palette-primary-main)' }} />
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary' variant='body2'>
                {row.original.bus.name}
              </Typography>
              <Chip label={row.original.bus.plaque} size='small' variant='outlined' />
            </div>
          </div>
        )
      }),
      columnHelper.accessor('route', {
        header: 'Ruta / Salida',
        cell: ({ row }) => {
          const originCity = row.original.route.officeOrigin.place?.name || 'N/A'
          const destinationCity = row.original.route.officeDestination.place?.name || 'N/A'

          return (
            <div className='flex flex-col gap-1'>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'action.hover'
                }}
              >
                <div className='flex items-center gap-1'>
                  <i className='tabler-flag' style={{ fontSize: '16px', color: 'var(--mui-palette-success-main)' }} />
                  <Typography variant='caption' fontWeight='medium'>
                    {originCity}
                  </Typography>
                </div>
                <i className='tabler-arrow-right' style={{ fontSize: '16px' }} />
                <div className='flex items-center gap-1'>
                  <i
                    className='tabler-flag-filled'
                    style={{ fontSize: '16px', color: 'var(--mui-palette-error-main)' }}
                  />
                  <Typography variant='caption' fontWeight='medium'>
                    {destinationCity}
                  </Typography>
                </div>
              </Box>
              <div className='flex items-center gap-1'>
                <i className='tabler-clock' style={{ fontSize: '14px', color: 'var(--mui-palette-info-main)' }} />
                <Typography variant='caption'>{formatDateTime(row.original.departure_time)}</Typography>
              </div>
            </div>
          )
        }
      }),
      columnHelper.accessor('seatsApp', {
        header: 'Vendidos App',
        cell: ({ row }) => {
          const seatsApp = row.original.seatsApp || 0
          const appAmount = parseFloat(row.original.app_amount || '0')

          return (
            <div className='flex flex-col'>
              <Typography variant='body2' fontWeight='medium'>
                {seatsApp} asientos
              </Typography>
              <Typography variant='caption' color='success.main'>
                {formatCurrency(appAmount)}
              </Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('seatsOffice', {
        header: 'Vendidos Oficina',
        cell: ({ row }) => {
          const seatsOffice = row.original.seatsOffice || 0
          const officeAmount = parseFloat(row.original.cash_amount || '0') + parseFloat(row.original.qr_amount || '0')

          return (
            <div className='flex flex-col'>
              <Typography variant='body2' fontWeight='medium'>
                {seatsOffice} asientos
              </Typography>
              <Typography variant='caption' color='info.main'>
                {formatCurrency(officeAmount)}
              </Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('totalSoldSeats', {
        header: 'Vendido Total',
        cell: ({ row }) => {
          const totalSoldSeats = row.original.totalSoldSeats || 0
          const totalBusSeats = row.original.totalBusSeats || 0

          const totalSoldAmount =
            parseFloat(row.original.app_amount || '0') +
            parseFloat(row.original.cash_amount || '0') +
            parseFloat(row.original.qr_amount || '0')

          return (
            <div className='flex flex-col'>
              <Typography variant='body2' fontWeight='bold'>
                {totalSoldSeats} de {totalBusSeats} asientos
              </Typography>
              <Typography variant='caption' color='primary.main' fontWeight='medium'>
                {formatCurrency(totalSoldAmount)}
              </Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('type', {
        header: 'Tipo',
        cell: ({ row }) => (
          <Chip
            label={row.original.type === 'normal' ? 'Normal' : 'Habilitada'}
            color={row.original.type === 'habilitada' ? 'warning' : 'primary'}
            variant='tonal'
            size='small'
            icon={
              <i
                className={row.original.type === 'habilitada' ? 'tabler-star-filled' : 'tabler-circle-filled'}
                style={{ fontSize: '14px' }}
              />
            }
          />
        )
      }),
      columnHelper.accessor('travel_status', {
        header: 'Estado',
        cell: ({ row }) => {
          const statusMap: Record<string, { label: string; color: 'success' | 'default' | 'error' | 'warning' }> = {
            active: { label: 'Activo', color: 'success' },
            closed: { label: 'Cerrado', color: 'default' },
            cancelled: { label: 'Cancelado', color: 'error' }
          }

          const status = statusMap[row.original.travel_status] || {
            label: row.original.travel_status,
            color: 'default'
          }

          return (
            <Chip
              label={status.label}
              color={status.color}
              variant='tonal'
              size='small'
              icon={
                <i
                  className={row.original.travel_status === 'active' ? 'tabler-check' : 'tabler-x'}
                  style={{ fontSize: '14px' }}
                />
              }
            />
          )
        }
      }),
      columnHelper.accessor('closedAt', {
        header: 'Fecha Cierre',
        cell: ({ row }) => {
          if (!row.original.closedAt) return <Typography variant='caption'>-</Typography>

          return (
            <div className='flex flex-col'>
              <Typography variant='caption'>{formatDateOnly(row.original.closedAt)}</Typography>
            </div>
          )
        }
      })
    ],
    []
  )

  const table = useReactTable({
    data: filteredTravels,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      globalFilter: searchQuery
    },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setSearchQuery,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  })

  if (isLoading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity='error'>Error al cargar los viajes. Por favor, intenta nuevamente.</Alert>
  }

  const totalRows = table.getFilteredRowModel().rows.length
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize

  return (
    <Box>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <div className='flex flex-col gap-2'>
            <Typography variant='h4'>Viajes de mis Buses</Typography>
            <Typography variant='body2' color='text.secondary'>
              Vista de solo lectura de los viajes asignados a tus buses
            </Typography>
          </div>
        </div>

        <div className='flex justify-center px-6 pb-4'>
          <ToggleButtonGroup
            value={datePreset}
            exclusive
            onChange={(_, value) => value && setDatePreset(value)}
            size='small'
            sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <ToggleButton value='today'>Hoy</ToggleButton>
            <ToggleButton value='last_week'>Última Semana</ToggleButton>
            <ToggleButton value='this_month'>Este Mes</ToggleButton>
            <ToggleButton value='last_month'>Mes Anterior</ToggleButton>
            <ToggleButton value='custom'>Otro</ToggleButton>
          </ToggleButtonGroup>
        </div>

        <div className='flex flex-wrap gap-4 px-6 pb-4 items-center'>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              bgcolor: 'primary.lighter',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'primary.main'
            }}
          >
            <i className='tabler-map-pin' style={{ fontSize: '18px', color: 'var(--mui-palette-primary-main)' }} />
            <Box>
              <Typography variant='caption' color='text.secondary'>
                Origen
              </Typography>
              <Typography variant='body2' fontWeight='medium' color='primary.main'>
                {originPlaceName || 'Cargando...'}
              </Typography>
            </Box>
          </Box>

          <i className='tabler-arrow-right' style={{ fontSize: '20px', color: 'var(--mui-palette-text-secondary)' }} />

          <CustomTextField
            select
            label='Destino'
            value={destinationPlaceId}
            onChange={e => setDestinationPlaceId(e.target.value)}
            size='small'
            sx={{ minWidth: 150 }}
          >
            <MenuItem value=''>Todos</MenuItem>
            {uniqueDestinations.map(place => (
              <MenuItem key={place.id} value={place.id.toString()}>
                {place.name}
              </MenuItem>
            ))}
          </CustomTextField>

          {datePreset === 'custom' && (
            <>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <CustomTextField
                  type='date'
                  label='Fecha Inicio'
                  value={customStartDate}
                  onChange={e => setCustomStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size='small'
                  sx={{ width: '150px' }}
                />
                <Typography variant='body2' color='text.secondary'>
                  a
                </Typography>
                <CustomTextField
                  type='date'
                  label='Fecha Fin'
                  value={customEndDate}
                  onChange={e => setCustomEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size='small'
                  sx={{ width: '150px' }}
                />
              </Box>
            </>
          )}
          <CustomTextField
            select
            label='Estado'
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            size='small'
            sx={{ minWidth: 120 }}
          >
            <MenuItem value='all'>Todos</MenuItem>
            <MenuItem value='active'>Activo</MenuItem>
            <MenuItem value='closed'>Cerrado</MenuItem>
          </CustomTextField>
        </div>

        <div className='flex flex-wrap justify-between items-center gap-4 px-6 pb-4'>
          <Box
            sx={{
              bgcolor: 'info.lighter',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'info.main',
              minWidth: '180px',
              textAlign: 'center'
            }}
          >
            <Typography variant='caption' color='info.main' fontWeight='medium'>
              Total Ventas Oficina
            </Typography>
            <Typography variant='h6' color='info.dark' fontWeight='bold'>
              {formatCurrency(totalOfficeAmount)}
            </Typography>
          </Box>

          <Box
            sx={{
              bgcolor: 'success.lighter',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'success.main',
              minWidth: '180px',
              textAlign: 'center'
            }}
          >
            <Typography variant='caption' color='success.main' fontWeight='medium'>
              Total Ventas App
            </Typography>
            <Typography variant='h6' color='success.dark' fontWeight='bold'>
              {formatCurrency(totalAppAmount)}
            </Typography>
          </Box>

          <Box
            sx={{
              bgcolor: 'primary.lighter',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'primary.main',
              minWidth: '180px',
              textAlign: 'center'
            }}
          >
            <Typography variant='caption' color='primary.main' fontWeight='medium'>
              Total General
            </Typography>
            <Typography variant='h6' color='primary.dark' fontWeight='bold'>
              {formatCurrency(totalAmount)}
            </Typography>
          </Box>
        </div>

        <div className='flex flex-wrap justify-between gap-4 px-6 pb-6'>
          <div className='flex flex-wrap gap-4 items-center'>
            <DebouncedInput
              value={searchQuery}
              onChange={value => {
                setSearchQuery(String(value))
                table.setPageIndex(0)
              }}
              placeholder='Buscar viajes...'
              className='max-sm:is-full min-w-[300px] flex-1 max-w-md'
            />
          </div>

          <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
            <CustomTextField
              select
              value={pageSize}
              onChange={e => {
                table.setPageSize(Number(e.target.value))
              }}
              className='flex-auto max-sm:is-full sm:is-[70px]'
            >
              <MenuItem value='10'>10</MenuItem>
              <MenuItem value='15'>15</MenuItem>
              <MenuItem value='25'>25</MenuItem>
            </CustomTextField>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='tabler-chevron-up text-xl' />,
                            desc: <i className='tabler-chevron-down text-xl' />
                          }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            {table.getRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-8'>
                    <Typography>No hay viajes disponibles</Typography>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map(row => {
                  const isDisabled = !row.original.enabled

                  return (
                    <tr
                      key={row.id}
                      style={{
                        opacity: isDisabled ? 0.5 : 1,
                        backgroundColor: isDisabled ? 'var(--mui-palette-action-disabledBackground)' : undefined
                      }}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            )}
          </table>
        </div>

        <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
          <Typography color='text.disabled'>
            {totalRows > 0
              ? `Mostrando ${pageIndex * pageSize + 1} a ${Math.min((pageIndex + 1) * pageSize, totalRows)} de ${totalRows} viajes`
              : 'No hay viajes'}
          </Typography>
          <Pagination
            shape='rounded'
            color='primary'
            variant='tonal'
            count={table.getPageCount()}
            page={pageIndex + 1}
            onChange={(_, page) => table.setPageIndex(page - 1)}
            showFirstButton
            showLastButton
          />
        </div>
      </Card>
    </Box>
  )
}

export default ViajesOwnerListTable
