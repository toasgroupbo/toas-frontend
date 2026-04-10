'use client'

import { useEffect, useMemo, useState } from 'react'

import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
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
import { useTravelsForCashier, useCreateTravelForCashier, useCancelTravelForCashier } from '@/hooks/useTravels'
import type { Travel } from '@/types/api/travels'
import CreateTravelDialog from '@/views/Dashboard/Viajes/components/CreateTravelDialog'
import CancelTravelDialog from '@/views/Dashboard/Viajes/components/CancelTravelDialog'
import { useSnackbar } from '@/contexts/SnackbarContext'
import { useAuth } from '@/contexts/AuthContext'

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

const ViajesCashierListTable = () => {
  const [rowSelection, setRowSelection] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedTravel, setSelectedTravel] = useState<Travel | null>(null)

  const { data: travels, isLoading, error } = useTravelsForCashier()
  const createMutation = useCreateTravelForCashier()
  const cancelMutation = useCancelTravelForCashier()
  const { showSuccess, showError } = useSnackbar()
  const { userRole } = useAuth()

  // Solo CASHIER y CASHIER_TRIPS pueden crear/cancelar viajes
  const canCreateTravel = userRole === 'CASHIER' || userRole === 'CASHIER_TRIPS'

  const filteredTravels = useMemo(() => {
    if (!travels) return []
    if (statusFilter === 'all') return travels

    return travels.filter(travel => travel.travel_status === statusFilter)
  }, [travels, statusFilter])

  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true)
  }

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false)
  }

  const handleSubmitCreate = async (data: any) => {
    try {
      await createMutation.mutateAsync(data)
      showSuccess('Viaje creado correctamente')
      handleCloseCreateDialog()
    } catch (error: any) {
      console.error('Error al crear viaje:', error)

      const errorMessage = error?.response?.data?.message || 'Error desconocido'

      const errorMessages: Record<string, string> = {
        'The bus is already assigned to an active travel':
          'El bus ya está asignado a un viaje activo. Por favor, seleccione otro bus o espere a que el viaje actual finalice.',
        'Bus not found': 'El bus seleccionado no existe.',
        'Route not found': 'La ruta seleccionada no existe.',
        'Invalid departure time': 'La fecha y hora de salida no es válida.',
        'Invalid arrival time': 'La fecha y hora de llegada no es válida.',
        'Arrival time must be after departure time': 'La hora de llegada debe ser posterior a la hora de salida.',
        Unauthorized: 'No tienes permiso para crear viajes.',
        Forbidden: 'Acceso denegado.',
        'The bus already has a travel scheduled that overlaps with the selected departure or arrival time':
          'El bus ya tiene un viaje para este horario. Por favor, seleccione otro horario o bus.'
      }

      const translatedMessage = errorMessages[errorMessage] || `Error al crear el viaje: ${errorMessage}`

      showError(translatedMessage)
    }
  }

  const handleOpenCancelDialog = (travel: Travel) => {
    setSelectedTravel(travel)
    setCancelDialogOpen(true)
  }

  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false)
    setSelectedTravel(null)
  }

  const handleConfirmCancel = async () => {
    if (!selectedTravel) return

    try {
      await cancelMutation.mutateAsync(selectedTravel.id)
      showSuccess('Viaje cancelado correctamente')
      handleCloseCancelDialog()
    } catch (error: any) {
      console.error('Error al cancelar viaje:', error)
      showError(error?.response?.data?.message || 'Error al cancelar el viaje')
    }
  }

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

  const columns = useMemo<ColumnDef<TravelWithActionsType, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      columnHelper.accessor('actions', {
        header: 'Acciones',
        cell: ({ row }) => {
          const isActive = row.original.travel_status === 'active'

          return (
            <div className='flex items-center gap-2'>
              {canCreateTravel && isActive && (
                <Tooltip title='Cancelar Viaje'>
                  <IconButton
                    size='small'
                    onClick={() => handleOpenCancelDialog(row.original)}
                    sx={{
                      color: 'warning.main',
                      '&:hover': { backgroundColor: 'warning.light', color: 'white' }
                    }}
                  >
                    <i className='tabler-ban' style={{ fontSize: '18px' }} />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          )
        },
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
        header: 'Ruta',
        cell: ({ row }) => {
          const originCity = row.original.route.officeOrigin.place?.name || 'N/A'
          const destinationCity = row.original.route.officeDestination.place?.name || 'N/A'

          return (
            <div className='flex items-center gap-2'>
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
            </div>
          )
        }
      }),
      columnHelper.accessor('departure_time', {
        header: 'Salida',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <i className='tabler-clock' style={{ fontSize: '16px', color: 'var(--mui-palette-info-main)' }} />
            <Typography variant='body2'>{formatDateTime(row.original.departure_time)}</Typography>
          </div>
        )
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
      columnHelper.accessor('price_deck_1', {
        header: 'Precio Piso 1',
        cell: ({ row }) => (
          <Chip
            label={`Bs. ${row.original.price_deck_1}`}
            color='success'
            variant='tonal'
            size='small'
            icon={<i className='tabler-currency-dollar' style={{ fontSize: '14px' }} />}
          />
        )
      }),
      columnHelper.accessor('price_deck_2', {
        header: 'Precio Piso 2',
        cell: ({ row }) => (
          <Chip
            label={`Bs. ${row.original.price_deck_2}`}
            color='info'
            variant='tonal'
            size='small'
            icon={<i className='tabler-currency-dollar' style={{ fontSize: '14px' }} />}
          />
        )
      }),
      columnHelper.accessor('travel_status', {
        header: 'Estado',
        cell: ({ row }) => (
          <Chip
            label={row.original.travel_status === 'active' ? 'Activo' : 'Inactivo'}
            color={row.original.travel_status === 'active' ? 'success' : 'default'}
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
      }),
      columnHelper.accessor('enabled', {
        header: 'Habilitado',
        cell: ({ row }) => (
          <Chip
            label={row.original.enabled ? 'Habilitado' : 'Deshabilitado'}
            color={row.original.enabled ? 'success' : 'error'}
            variant='tonal'
            size='small'
            icon={
              <i
                className={row.original.enabled ? 'tabler-toggle-right' : 'tabler-toggle-left'}
                style={{ fontSize: '14px' }}
              />
            }
          />
        )
      })
    ],
    [canCreateTravel]
  )

  const table = useReactTable({
    data: filteredTravels,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter: searchQuery
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
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
            <Typography variant='h4'>Mis Viajes</Typography>
          </div>

          {canCreateTravel && (
            <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
              <Button
                variant='contained'
                color='primary'
                onClick={handleOpenCreateDialog}
                startIcon={<i className='tabler-plus' />}
              >
                Nuevo Viaje
              </Button>
            </div>
          )}
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
            <CustomTextField
              select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value)
                table.setPageIndex(0)
              }}
              className='max-sm:is-full sm:is-[150px]'
            >
              <MenuItem value='all'>Todos</MenuItem>
              <MenuItem value='active'>Activo</MenuItem>
              <MenuItem value='closed'>Cerrado</MenuItem>
              <MenuItem value='cancelled'>Cancelado</MenuItem>
            </CustomTextField>
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
                      className={classnames({ selected: row.getIsSelected() })}
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

      {createDialogOpen && (
        <CreateTravelDialog
          open={createDialogOpen}
          onClose={handleCloseCreateDialog}
          onSubmit={handleSubmitCreate}
          isLoading={createMutation.isPending}
          isCashier={true}
        />
      )}

      <CancelTravelDialog
        open={cancelDialogOpen}
        onClose={handleCloseCancelDialog}
        onConfirm={handleConfirmCancel}
        travel={selectedTravel}
        isLoading={cancelMutation.isPending}
      />
    </Box>
  )
}

export default ViajesCashierListTable
