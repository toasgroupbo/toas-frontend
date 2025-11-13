'use client'

import { useState, useMemo, useEffect } from 'react'

import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import { Pagination } from '@mui/material'
import Checkbox from '@mui/material/Checkbox'
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
import type { TextFieldProps } from '@mui/material/TextField'

import { useRoles, useCreateRole, useDeleteRole, useUpdateRole } from '@/hooks/useRoles'
import type { Role, CreateRoleDto } from '@/types/api/roles'
import DeleteRoleDialog from '@/views/Dashboard/roles/components/DeleteRoleDialog'
import { useSnackbar } from '@/contexts/SnackbarContext'
import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'
import { usePermissions } from '@/hooks/usePermissions'
import RoleDialog from '../components/RolesDialog'

type RoleWithActionsType = Role & {
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

const columnHelper = createColumnHelper<RoleWithActionsType>()

const RolesPage = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [rowSelection, setRowSelection] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: roles, isLoading, error } = useRoles()
  const createMutation = useCreateRole()
  const updateMutation = useUpdateRole()
  const deleteMutation = useDeleteRole()
  const { showSuccess, showError } = useSnackbar()
  const { canCreate, canUpdate, canDelete } = usePermissions().getCRUDPermissions('ROL')

  const [data, setData] = useState<Role[]>([])

  useEffect(() => {
    if (roles) {
      setData(roles)
    }
  }, [roles])

  const handleCreateOrUpdateRole = async (roleData: CreateRoleDto, id?: number) => {
    try {
      if (id) {
        // Modo edición
        await updateMutation.mutateAsync({ id, data: roleData })
        setUpdateDialogOpen(false)
        setSelectedRole(null)
        showSuccess('Rol actualizado correctamente')
      } else {
        // Modo creación
        await createMutation.mutateAsync(roleData)
        setCreateDialogOpen(false)
        showSuccess('Rol creado correctamente')
      }
    } catch (error: any) {
      console.error('Error al guardar rol:', error)
      showError(error?.response?.data?.message || 'Error al guardar rol')
    }
  }

  const handleEditRole = (role: Role) => {
    setSelectedRole(role)
    setUpdateDialogOpen(true)
  }

  const handleDeleteRole = (role: Role) => {
    setSelectedRole(role)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedRole) return

    try {
      await deleteMutation.mutateAsync(selectedRole.id)
      setDeleteDialogOpen(false)
      setSelectedRole(null)
      showSuccess('Rol eliminado correctamente')
    } catch (error: any) {
      console.error('Error al eliminar rol:', error)
      showError(error?.response?.data?.message || 'Error al eliminar rol')
    }
  }

  const columns = useMemo<ColumnDef<RoleWithActionsType, any>[]>(
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
            {!row.original.isStatic && (
              <>
                {canUpdate && (
                  <Tooltip title='Editar'>
                    <IconButton
                      size='small'
                      onClick={() => handleEditRole(row.original)}
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
                      onClick={() => handleDeleteRole(row.original)}
                      sx={{
                        color: 'error.main',
                        '&:hover': { backgroundColor: 'error.light', color: 'white' }
                      }}
                    >
                      <i className='tabler-trash' style={{ fontSize: '18px' }} />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            )}
          </div>
        ),
        enableSorting: false
      }),
      columnHelper.accessor('name', {
        header: 'Nombre',
        cell: ({ row }) => (
          <Box display='flex' alignItems='center' gap={2}>
            <Typography className='font-medium' color='text.primary'>
              {row.original.name}
            </Typography>
            {row.original.isStatic && <Chip label='Estático' size='small' color='primary' variant='tonal' />}
          </Box>
        )
      }),
      columnHelper.accessor('permissions', {
        header: 'Recursos',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.secondary'>
            {row.original.permissions.length} recursos
          </Typography>
        )
      }),
      {
        id: 'totalPermissions',
        header: 'Permisos',
        cell: ({ row }) => {
          const total = row.original.permissions.reduce((acc, p) => acc + p.permissions.length, 0)

          return (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              {total}
            </Box>
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
    return <Alert severity='error'>Error al cargar los roles. Por favor, intenta nuevamente.</Alert>
  }

  return (
    <Box>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <div className='flex flex-col gap-2'>
            <Typography variant='h4'>Gestión de Roles</Typography>
            <Typography variant='body2' color='text.secondary'>
              Administra los roles y permisos del sistema
            </Typography>
          </div>

          {canCreate && (
            <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
              <Button
                variant='contained'
                color='primary'
                onClick={() => setCreateDialogOpen(true)}
                startIcon={<i className='tabler-plus' />}
              >
                Crear Rol
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
              placeholder='Buscar roles...'
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
                    <Typography>No hay roles disponibles</Typography>
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
                {`Mostrando ${(currentPage - 1) * pageSize + 1} a ${Math.min(currentPage * pageSize, totalRecords)} de ${totalRecords} roles`}
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

      {/* Diálogo para CREAR */}
      <RoleDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateOrUpdateRole}
        existingRoles={roles || []}
        isLoading={createMutation.isPending}
      />

      {/* Diálogo para EDITAR */}
      <RoleDialog
        open={updateDialogOpen}
        onClose={() => {
          setUpdateDialogOpen(false)
          setSelectedRole(null)
        }}
        onSubmit={handleCreateOrUpdateRole}
        existingRoles={roles || []}
        role={selectedRole}
        isLoading={updateMutation.isPending}
      />

      {/* Diálogo para ELIMINAR */}
      <DeleteRoleDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setSelectedRole(null)
        }}
        onConfirm={handleConfirmDelete}
        role={selectedRole}
        isLoading={deleteMutation.isPending}
      />
    </Box>
  )
}

export default RolesPage
