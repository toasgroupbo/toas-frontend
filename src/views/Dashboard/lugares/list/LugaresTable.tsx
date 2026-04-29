'use client'

import { useEffect, useMemo, useState } from 'react'

import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
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
import { usePlaces, useCreatePlace, useUpdatePlace } from '@/hooks/useLugares'
import type { Place, CreatePlaceDto, UpdatePlaceDto } from '@/types/api/lugares'
import { useSnackbar } from '@/contexts/SnackbarContext'
import { usePermissions } from '@/hooks/usePermissions'

type PlaceWithActionsType = Place & {
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

const columnHelper = createColumnHelper<PlaceWithActionsType>()

const PlacesTable = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [formName, setFormName] = useState('')
  const [formError, setFormError] = useState('')

  const { data: places, isLoading, error } = usePlaces()
  const createMutation = useCreatePlace()
  const updateMutation = useUpdatePlace()
  const { showSuccess, showError } = useSnackbar()
  const { canCreate, canUpdate } = usePermissions().getCRUDPermissions('PLACE')

  const [data, setData] = useState<Place[]>([])

  useEffect(() => {
    if (places) {
      setData(places)
    }
  }, [places])

  const resetForm = () => {
    setFormName('')
    setFormError('')
  }

  const handleOpenCreateDialog = () => {
    resetForm()
    setCreateDialogOpen(true)
  }

  const handleOpenEditDialog = (place: Place) => {
    setSelectedPlace(place)
    setFormName(place.name)
    setFormError('')
    setEditDialogOpen(true)
  }

  const handleCreatePlace = async () => {
    if (!formName.trim()) {
      setFormError('El nombre del lugar es requerido')

      return
    }

    try {
      await createMutation.mutateAsync({ name: formName.trim() })
      setCreateDialogOpen(false)
      resetForm()
      showSuccess('Lugar creado correctamente')
    } catch (error: any) {
      console.error('Error al crear lugar:', error)
      showError(error?.response?.data?.message || 'Error al crear lugar')
    }
  }

  const handleUpdatePlace = async () => {
    if (!selectedPlace) return

    if (!formName.trim()) {
      setFormError('El nombre del lugar es requerido')

      return
    }

    try {
      await updateMutation.mutateAsync({ id: selectedPlace.id, data: { name: formName.trim() } })
      setEditDialogOpen(false)
      setSelectedPlace(null)
      resetForm()
      showSuccess('Lugar actualizado correctamente')
    } catch (error: any) {
      console.error('Error al actualizar lugar:', error)
      showError(error?.response?.data?.message || 'Error al actualizar lugar')
    }
  }

  const columns = useMemo<ColumnDef<PlaceWithActionsType, any>[]>(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: ({ row }) => (
          <Typography variant='body2' className='font-medium'>
            {row.original.id}
          </Typography>
        )
      }),
      columnHelper.accessor('name', {
        header: 'Nombre del Lugar',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              {row.original.name.charAt(0).toUpperCase()}
            </Box>
            <Typography className='font-medium' color='text.primary'>
              {row.original.name}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('createdAt', {
        header: 'Fecha de Creación',
        cell: ({ row }) => (
          <Chip
            label={new Date(row.original.createdAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
            variant='tonal'
            size='small'
            icon={<i className='tabler-calendar' style={{ fontSize: '14px' }} />}
          />
        )
      }),
      columnHelper.accessor('actions', {
        header: 'Acciones',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            {canUpdate && (
              <Tooltip title='Editar'>
                <IconButton size='small' onClick={() => handleOpenEditDialog(row.original)} color='primary'>
                  <i className='tabler-edit' />
                </IconButton>
              </Tooltip>
            )}
          </div>
        ),
        enableSorting: false
      })
    ],
    [canUpdate]
  )

  const table = useReactTable({
    data: data,
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
    return <Alert severity='error'>Error al cargar los lugares. Por favor, intenta nuevamente.</Alert>
  }

  return (
    <Box>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <div className='flex flex-col gap-2'>
            <Typography variant='h4'>Gestión de Lugares</Typography>
            <Typography variant='body2' color='text.secondary'>
              Administra los lugares disponibles en el sistema
            </Typography>
          </div>

          {canCreate && (
            <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
              <Button
                variant='contained'
                color='primary'
                onClick={handleOpenCreateDialog}
                startIcon={<i className='tabler-plus' />}
              >
                Nuevo Lugar
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
              placeholder='Buscar lugares...'
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
                    <Typography>No hay lugares disponibles</Typography>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table
                  .getRowModel()
                  .rows.slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map(row => (
                    <tr key={row.id}>
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
                {`Mostrando ${(currentPage - 1) * pageSize + 1} a ${Math.min(currentPage * pageSize, totalRecords)} de ${totalRecords} lugares`}
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

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>
          <div className='flex justify-between items-center'>
            <Typography variant='h5'>Crear Nuevo Lugar</Typography>
            <IconButton onClick={() => setCreateDialogOpen(false)} disabled={createMutation.isPending}>
              <i className='tabler-x' />
            </IconButton>
          </div>
        </DialogTitle>

        <DialogContent>
          <div className='flex flex-col gap-4 mt-2'>
            <TextField
              autoFocus
              label='Nombre del Lugar'
              placeholder='Ej: Santa Cruz de la Sierra'
              value={formName}
              onChange={e => {
                setFormName(e.target.value)
                if (formError) setFormError('')
              }}
              disabled={createMutation.isPending}
              error={!!formError}
              helperText={formError}
              fullWidth
              required
            />
          </div>
        </DialogContent>

        <DialogActions className='p-4 pt-0'>
          <Button
            onClick={() => setCreateDialogOpen(false)}
            disabled={createMutation.isPending}
            variant='tonal'
            color='secondary'
          >
            Cancelar
          </Button>
          <Button onClick={handleCreatePlace} disabled={createMutation.isPending} variant='contained' color='primary'>
            {createMutation.isPending ? <CircularProgress size={24} /> : 'Crear Lugar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>
          <div className='flex justify-between items-center'>
            <Typography variant='h5'>Editar Lugar</Typography>
            <IconButton onClick={() => setEditDialogOpen(false)} disabled={updateMutation.isPending}>
              <i className='tabler-x' />
            </IconButton>
          </div>
        </DialogTitle>

        <DialogContent>
          <div className='flex flex-col gap-4 mt-2'>
            <TextField
              autoFocus
              label='Nombre del Lugar'
              placeholder='Ej: Santa Cruz de la Sierra'
              value={formName}
              onChange={e => {
                setFormName(e.target.value)
                if (formError) setFormError('')
              }}
              disabled={updateMutation.isPending}
              error={!!formError}
              helperText={formError}
              fullWidth
              required
            />
          </div>
        </DialogContent>

        <DialogActions className='p-4 pt-0'>
          <Button
            onClick={() => setEditDialogOpen(false)}
            disabled={updateMutation.isPending}
            variant='tonal'
            color='secondary'
          >
            Cancelar
          </Button>
          <Button onClick={handleUpdatePlace} disabled={updateMutation.isPending} variant='contained' color='primary'>
            {updateMutation.isPending ? <CircularProgress size={24} /> : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default PlacesTable
