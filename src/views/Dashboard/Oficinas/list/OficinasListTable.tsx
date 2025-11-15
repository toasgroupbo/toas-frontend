'use client'

import { useEffect, useMemo, useState } from 'react'

import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
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
import { useOffices, useCreateOffice, useUpdateOffice, useDeleteOffice } from '@/hooks/useOffices'
import type { Office, CreateOfficeDto, UpdateOfficeDto } from '@/types/api/offices'

import { useSnackbar } from '@/contexts/SnackbarContext'
import { usePermissions } from '@/hooks/usePermissions'
import OfficeFormDialog from '../components/OfficeFormDialog'
import DeleteOfficeDialog from '../components/DeleteOfficeDialog'

type OfficeWithActionsType = Office & {
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

const columnHelper = createColumnHelper<OfficeWithActionsType>()

const OfficesListTable = () => {
  const [rowSelection, setRowSelection] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const { data: offices, isLoading, error } = useOffices()
  const createMutation = useCreateOffice()
  const updateMutation = useUpdateOffice()
  const deleteMutation = useDeleteOffice()
  const { showSuccess, showError } = useSnackbar()
  const { canCreate, canUpdate, canDelete } = usePermissions().getCRUDPermissions('OFFICE')

  const [data, setData] = useState<Office[]>([])

  useEffect(() => {
    if (offices) {
      setData(offices)
    }
  }, [offices])

  const handleOpenCreateDialog = () => {
    setIsEditMode(false)
    setSelectedOffice(null)
    setFormDialogOpen(true)
  }

  const handleOpenEditDialog = (office: Office) => {
    setIsEditMode(true)
    setSelectedOffice(office)
    setFormDialogOpen(true)
  }

  const handleCloseFormDialog = () => {
    setFormDialogOpen(false)
    setSelectedOffice(null)
    setIsEditMode(false)
  }

  const handleSubmitForm = async (data: CreateOfficeDto | UpdateOfficeDto) => {
    try {
      if (isEditMode && selectedOffice) {
        await updateMutation.mutateAsync({
          id: selectedOffice.id,
          data: data as UpdateOfficeDto
        })
        showSuccess('Oficina actualizada correctamente')
      } else {
        await createMutation.mutateAsync(data as CreateOfficeDto)
        showSuccess('Oficina creada correctamente')
      }

      handleCloseFormDialog()
    } catch (error: any) {
      console.error('Error al guardar oficina:', error)
      showError(error?.response?.data?.message || 'Error al guardar la oficina')
    }
  }

  const handleOpenDeleteDialog = (office: Office) => {
    setSelectedOffice(office)
    setDeleteDialogOpen(true)
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setSelectedOffice(null)
  }

  const handleConfirmDelete = async () => {
    if (!selectedOffice) return

    try {
      await deleteMutation.mutateAsync(selectedOffice.id)
      showSuccess('Oficina eliminada correctamente')
      handleCloseDeleteDialog()
    } catch (error: any) {
      console.error('Error al eliminar oficina:', error)
      showError(error?.response?.data?.message || 'Error al eliminar la oficina')
    }
  }

  const columns = useMemo<ColumnDef<OfficeWithActionsType, any>[]>(
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
      columnHelper.accessor('name', {
        header: 'Nombre',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <i className='tabler-building' style={{ fontSize: '20px', color: 'var(--mui-palette-primary-main)' }} />
            <Typography className='font-medium' color='text.primary'>
              {row.original.name}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('place', {
        header: 'Ubicación',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <i className='tabler-map-pin' style={{ fontSize: '18px', color: 'var(--mui-palette-secondary-main)' }} />
            <Typography variant='body2' color='text.primary'>
              {row.original.place}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('createdAt', {
        header: 'Fecha de Creación',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <i className='tabler-calendar' style={{ fontSize: '16px', color: 'var(--mui-palette-text-secondary)' }} />
            <Typography variant='body2' color='text.secondary'>
              {row.original.createdAt
                ? new Date(row.original.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                : 'N/A'}
            </Typography>
          </div>
        )
      })
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
    return <Alert severity='error'>Error al cargar las oficinas. Por favor, intenta nuevamente.</Alert>
  }

  return (
    <Box>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <div className='flex flex-col gap-2'>
            <Typography variant='h4'>Lista de Oficinas</Typography>
          </div>

          {canCreate && (
            <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
              <Button
                variant='contained'
                color='primary'
                onClick={handleOpenCreateDialog}
                startIcon={<i className='tabler-plus' />}
              >
                Nueva Oficina
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
              placeholder='Buscar oficinas...'
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
                    <Typography>No hay oficinas disponibles</Typography>
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
                {`Mostrando ${(currentPage - 1) * pageSize + 1} a ${Math.min(currentPage * pageSize, totalRecords)} de ${totalRecords} oficinas`}
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

      <OfficeFormDialog
        open={formDialogOpen}
        onClose={handleCloseFormDialog}
        onSubmit={handleSubmitForm}
        office={selectedOffice}
        isEditMode={isEditMode}
        isLoading={isEditMode ? updateMutation.isPending : createMutation.isPending}
      />

      <DeleteOfficeDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        office={selectedOffice}
        isLoading={deleteMutation.isPending}
      />
    </Box>
  )
}

export default OfficesListTable
