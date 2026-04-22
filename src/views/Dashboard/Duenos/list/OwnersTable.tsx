'use client'

import { useEffect, useMemo, useState } from 'react'

import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
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
import { useOwners, useCreateOwner, useUpdateOwner, useDeleteOwner } from '@/hooks/useOwners'
import type { Owner, CreateOwnerDto } from '@/types/api/owners'
import { BANCOS_OPTIONS } from '@/types/api/company'
import OwnerDialog from '@/views/Dashboard/Duenos/components/OwnerDialog'
import DeleteOwnerDialog from '@/views/Dashboard/Duenos/components/DeleteOwnerDialog'
import { useSnackbar } from '@/contexts/SnackbarContext'
import { usePermissions } from '@/hooks/usePermissions'

type OwnerWithActionsType = Owner & {
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

const columnHelper = createColumnHelper<OwnerWithActionsType>()

const OwnersTable = () => {
  const [rowSelection, setRowSelection] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null)

  const { data: owners, isLoading, error } = useOwners()
  const createMutation = useCreateOwner()
  const updateMutation = useUpdateOwner()
  const deleteMutation = useDeleteOwner()
  const { showSuccess, showError } = useSnackbar()
  const { canCreate, canUpdate, canDelete } = usePermissions().getCRUDPermissions('OWNER')

  const [data, setData] = useState<Owner[]>([])

  useEffect(() => {
    if (owners) {
      setData(owners)
    }
  }, [owners])

  const handleCreateOwner = async (data: CreateOwnerDto) => {
    try {
      await createMutation.mutateAsync(data)
      setCreateDialogOpen(false)
      showSuccess('Dueño creado correctamente')
    } catch (error: any) {
      console.error('Error al crear dueño:', error)
      console.error('📊 Error response data:', error?.response?.data)
      showError(error?.response?.data?.message || 'Error al crear dueño')
    }
  }

  const handleEditOwner = (owner: Owner) => {
    setSelectedOwner(owner)
    setUpdateDialogOpen(true)
  }

  const handleUpdateOwner = async (data: {
    name: string
    ci: string
    phone: string
    newPassword?: string
    bankAccount: any
  }) => {
    if (!selectedOwner) return

    try {
      await updateMutation.mutateAsync({
        id: selectedOwner.id,
        data: {
          name: data.name,
          ci: data.ci,
          phone: data.phone,
          bankAccount: data.bankAccount
        },
        userId: selectedOwner.users[0]?.id,
        newPassword: data.newPassword
      })

      setUpdateDialogOpen(false)
      setSelectedOwner(null)
      showSuccess(data.newPassword ? 'Dueño y contraseña actualizados correctamente' : 'Dueño actualizado correctamente')
    } catch (error: any) {
      console.error('Error al actualizar dueño:', error)
      showError(error?.response?.data?.message || 'Error al actualizar dueño')
    }
  }

  const handleDeleteOwner = (owner: Owner) => {
    setSelectedOwner(owner)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedOwner) return

    try {
      await deleteMutation.mutateAsync(selectedOwner.id)
      setDeleteDialogOpen(false)
      setSelectedOwner(null)
      showSuccess('Dueño eliminado correctamente')
    } catch (error: any) {
      console.error('Error al eliminar dueño:', error)
      showError(error?.response?.data?.message || 'Error al eliminar dueño')
    }
  }

  const columns = useMemo<ColumnDef<OwnerWithActionsType, any>[]>(
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
                  onClick={() => handleEditOwner(row.original)}
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
                  onClick={() => handleDeleteOwner(row.original)}
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
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-1'>
              <i className='tabler-user' style={{ fontSize: '16px', color: 'var(--mui-palette-text-secondary)' }} />
              <Typography className='font-medium' color='text.primary' variant='body2'>
                {row.original.name}
              </Typography>
            </div>
            <Typography variant='caption' color='text.secondary'>
              CI: {row.original.ci}
            </Typography>
          </div>
        )
      }),
      {
        id: 'phone',
        header: 'Teléfono',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <i className='tabler-phone' style={{ fontSize: '16px', color: 'var(--mui-palette-success-main)' }} />
            <Typography variant='body2'>{row.original.phone}</Typography>
          </div>
        )
      },
      {
        id: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <i className='tabler-mail' style={{ fontSize: '16px', color: 'var(--mui-palette-info-main)' }} />
            <Typography variant='body2'>{row.original.users[0]?.email || '-'}</Typography>
          </div>
        )
      },
      columnHelper.accessor('bankAccount', {
        header: 'Banco',
        cell: ({ row }) => {
          const banco = BANCOS_OPTIONS.find(b => b.value === row.original.bankAccount.bankCode)

          return (
            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-1'>
                <i
                  className='tabler-building-bank'
                  style={{ fontSize: '16px', color: 'var(--mui-palette-primary-main)' }}
                />
                <Typography variant='body2' color='text.primary'>
                  {banco?.label || row.original.bankAccount.bankCode}
                </Typography>
              </div>
              <Typography variant='caption' color='text.secondary'>
                {row.original.bankAccount.titularName}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Cta: {row.original.bankAccount.account}
              </Typography>
            </div>
          )
        }
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
    return <Alert severity='error'>Error al cargar los dueños. Por favor, intenta nuevamente.</Alert>
  }

  return (
    <Box>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <div className='flex flex-col gap-2'>
            <Typography variant='h4'>Lista de Dueños</Typography>
          </div>
          {canCreate && (
            <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
              <Button
                variant='contained'
                color='primary'
                onClick={() => setCreateDialogOpen(true)}
                startIcon={<i className='tabler-plus' />}
              >
                Nuevo Dueño
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
              placeholder='Buscar dueños...'
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
                    <Typography>No hay dueños disponibles</Typography>
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
                {`Mostrando ${(currentPage - 1) * pageSize + 1} a ${Math.min(currentPage * pageSize, totalRecords)} de ${totalRecords} dueños`}
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

      <OwnerDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateOwner}
        isLoading={createMutation.isPending}
      />

      <OwnerDialog
        open={updateDialogOpen}
        onClose={() => {
          setUpdateDialogOpen(false)
          setSelectedOwner(null)
        }}
        onSubmit={handleUpdateOwner}
        owner={selectedOwner}
        isLoading={updateMutation.isPending}
        isEdit
      />

      <DeleteOwnerDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setSelectedOwner(null)
        }}
        onConfirm={handleConfirmDelete}
        owner={selectedOwner}
        isLoading={deleteMutation.isPending}
      />
    </Box>
  )
}

export default OwnersTable
