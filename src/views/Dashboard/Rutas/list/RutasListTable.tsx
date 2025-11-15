'use client'

import { useEffect, useMemo, useState } from 'react'

import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import TablePagination from '@mui/material/TablePagination'
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
import { useRoutes, useCreateRoute, useUpdateRoute, useDeleteRoute } from '@/hooks/useRoutes'
import type { Route } from '@/types/api/rutas'
import RouteFormDialog from '@/views/Dashboard/Rutas/components/RouteFormDialog'
import DeleteRouteDialog from '@/views/Dashboard/Rutas/components/DeleteRouteDialog'
import { useSnackbar } from '@/contexts/SnackbarContext'
import { usePermissions } from '@/hooks/usePermissions'
import { useOffices } from '@/hooks/useOffices'

type RouteWithActionsType = Route & {
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

const columnHelper = createColumnHelper<RouteWithActionsType>()

const RoutesTable = () => {
  const [rowSelection, setRowSelection] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const { data: routes, isLoading, error } = useRoutes()

  const createMutation = useCreateRoute()

  const updateMutation = useUpdateRoute()
  const deleteMutation = useDeleteRoute()
  const { showSuccess, showError } = useSnackbar()
  const { canCreate, canUpdate, canDelete } = usePermissions().getCRUDPermissions('ROUTE')

  const [data, setData] = useState<Route[]>([])

  useEffect(() => {
    if (routes) {
      setData(routes)
    }
  }, [routes])

  const handleOpenCreateDialog = () => {
    setIsEditMode(false)
    setSelectedRoute(null)
    setFormDialogOpen(true)
  }

  const handleOpenEditDialog = (route: Route) => {
    setIsEditMode(true)
    setSelectedRoute(route)
    setFormDialogOpen(true)
  }

  const handleCloseFormDialog = () => {
    setFormDialogOpen(false)
    setSelectedRoute(null)
    setIsEditMode(false)
  }

  const handleSubmitForm = async (data: any) => {
    try {
      if (isEditMode && selectedRoute) {
        await updateMutation.mutateAsync({
          id: selectedRoute.id,
          data
        })
        showSuccess('Ruta actualizada correctamente')
      } else {
        await createMutation.mutateAsync(data)
        showSuccess('Ruta creada correctamente')
      }

      handleCloseFormDialog()
    } catch (error: any) {
      console.error('Error al guardar ruta:', error)
      showError(error?.response?.data?.message || 'Error al guardar la ruta')
    }
  }

  const handleOpenDeleteDialog = (route: Route) => {
    setSelectedRoute(route)
    setDeleteDialogOpen(true)
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setSelectedRoute(null)
  }

  const handleConfirmDelete = async () => {
    if (!selectedRoute) return

    try {
      await deleteMutation.mutateAsync(selectedRoute.id)
      showSuccess('Ruta eliminada correctamente')
      handleCloseDeleteDialog()
    } catch (error: any) {
      console.error('Error al eliminar ruta:', error)
      showError(error?.response?.data?.message || 'Error al eliminar la ruta')
    }
  }

  const columns = useMemo<ColumnDef<RouteWithActionsType, any>[]>(
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
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            {canUpdate && (
              <Tooltip title='Editar'>
                <IconButton
                  size='small'
                  onClick={() => handleOpenEditDialog(row.original)}
                  sx={{
                    color: 'primary.main',
                    '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                  }}
                >
                  <i className='tabler-edit' style={{ fontSize: '18px' }} />
                </IconButton>
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title='Eliminar'>
                <IconButton
                  size='small'
                  onClick={() => handleOpenDeleteDialog(row.original)}
                  sx={{
                    color: 'error.main',
                    '&:hover': { backgroundColor: 'error.light', color: 'white' }
                  }}
                >
                  <i className='tabler-trash' style={{ fontSize: '18px' }} />
                </IconButton>
              </Tooltip>
            )}
          </div>
        ),
        enableSorting: false
      }),
      columnHelper.accessor('officeOrigin', {
        header: 'Origen',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: 'success.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              <i className='tabler-flag' style={{ fontSize: '18px' }} />
            </Box>
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary' variant='body2'>
                {row.original.officeOrigin.name}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {row.original.officeOrigin.place}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('officeDestination', {
        header: 'Destino',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: 'error.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              <i className='tabler-flag-filled' style={{ fontSize: '18px' }} />
            </Box>
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary' variant='body2'>
                {row.original.officeDestination.name}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {row.original.officeDestination.place}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('isActive', {
        header: 'Estado',
        cell: ({ row }) => (
          <Chip
            label={row.original.isActive ? 'Activa' : 'Inactiva'}
            color={row.original.isActive ? 'success' : 'default'}
            variant='tonal'
            size='small'
            icon={<i className={row.original.isActive ? 'tabler-check' : 'tabler-x'} style={{ fontSize: '14px' }} />}
          />
        )
      }),
      columnHelper.accessor('pass_by', {
        header: 'Trayecto',
        cell: ({ row }) => (
          <div className='flex flex-wrap gap-1'>
            {row.original.pass_by && row.original.pass_by.length > 0 ? (
              row.original.pass_by.map((location, index) => (
                <Chip
                  key={index}
                  label={location}
                  size='small'
                  variant='outlined'
                  color='info'
                  icon={<i className='tabler-map-pin' style={{ fontSize: '14px' }} />}
                />
              ))
            ) : (
              <Chip label='Sin trayecto definido' size='small' variant='outlined' color='default' />
            )}
          </div>
        )
      }),
      {
        id: 'routeInfo',
        header: 'Puntos',
        cell: ({ row }) => {
          const totalPoints = row.original.pass_by?.length || 0

          return (
            <Chip
              label={`${totalPoints} punto${totalPoints !== 1 ? 's' : ''}`}
              size='small'
              color='primary'
              variant='tonal'
              icon={<i className='tabler-route' style={{ fontSize: '14px' }} />}
            />
          )
        }
      }
    ],
    [canUpdate, canDelete]
  )

  const table = useReactTable({
    data: data,
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
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const totalRecords = table.getFilteredRowModel().rows.length

  if (isLoading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity='error'>Error al cargar las rutas. Por favor, intenta nuevamente.</Alert>
  }

  return (
    <Box>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <div className='flex flex-col gap-2'>
            <Typography variant='h4'>Lista de Rutas</Typography>
          </div>

          {canCreate && (
            <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
              <Button
                variant='contained'
                color='primary'
                onClick={handleOpenCreateDialog}
                startIcon={<i className='tabler-plus' />}
              >
                Nueva Ruta
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
                setCurrentPage(1)
              }}
              placeholder='Buscar rutas...'
              className='max-sm:is-full min-w-[300px] flex-1 max-w-md'
            />
          </div>

          <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
            <CustomTextField
              select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
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

            {table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-8'>
                    <Typography>No hay rutas disponibles</Typography>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table
                  .getRowModel()
                  .rows.slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map(row => (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            )}
          </table>
        </div>

        <TablePagination
          component={() => (
            <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
              <Typography color='text.disabled'>
                {`Mostrando ${(currentPage - 1) * pageSize + 1} a ${Math.min(currentPage * pageSize, totalRecords)} de ${totalRecords} rutas`}
              </Typography>
              <Pagination
                shape='rounded'
                color='primary'
                variant='tonal'
                count={Math.ceil(totalRecords / pageSize)}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                showFirstButton
                showLastButton
              />
            </div>
          )}
          count={totalRecords}
          rowsPerPage={pageSize}
          page={currentPage - 1}
          onPageChange={() => {}}
        />
      </Card>

      <RouteFormDialog
        open={formDialogOpen}
        onClose={handleCloseFormDialog}
        onSubmit={handleSubmitForm}
        route={selectedRoute}
        isEditMode={isEditMode}
        isLoading={isEditMode ? updateMutation.isPending : createMutation.isPending}
      />

      <DeleteRouteDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        route={selectedRoute}
        isLoading={deleteMutation.isPending}
      />
    </Box>
  )
}

export default RoutesTable
