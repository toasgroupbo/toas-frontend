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
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useChangePassword } from '@/hooks/useUsers'
import type { User, CreateUserDto, UpdateUserDto } from '@/types/api/users'
import CreateUserDialog from '@/views/Dashboard/usuarios/components/CreateUserDialog'
import EditCompanyAdminDialog from '@/views/Dashboard/usuarios/components/EditCompanyAdminDialog'
import ChangePasswordDialog from '@/views/Dashboard/usuarios/components/ChangePasswordDialog'
import DeleteUserDialog from '@/views/Dashboard/usuarios/components/DeleteUserDialog'
import { useSnackbar } from '@/contexts/SnackbarContext'
import { usePermissions } from '@/hooks/usePermissions'

const getRoleDisplayName = (roleName: string): string => {
  const roleNames: Record<string, string> = {
    SUPER_ADMIN: 'Super Administrador',
    COMPANY_ADMIN: 'Administrador de Empresa',
    OFFICE_ADMIN: 'Administrador de Oficina',
    CASHIER: 'Cajero',
    CUSTOMER: 'Cliente'
  }

  return roleNames[roleName] || roleName
}

type UserWithActionsType = User & {
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

const columnHelper = createColumnHelper<UserWithActionsType>()

const UsersTable = () => {
  const [rowSelection, setRowSelection] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editCompanyAdminDialogOpen, setEditCompanyAdminDialogOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const { data: users, isLoading, error } = useUsers()
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const deleteMutation = useDeleteUser()
  const changePasswordMutation = useChangePassword()
  const { showSuccess, showError } = useSnackbar()
  const { canCreate, canUpdate, canDelete } = usePermissions().getCRUDPermissions('USER')

  const [data, setData] = useState<User[]>([])

  useEffect(() => {
    if (users) {
      setData(users)
    }
  }, [users])

  const handleCreateUser = async (data: CreateUserDto | UpdateUserDto) => {
    try {
      await createMutation.mutateAsync(data as CreateUserDto)
      setCreateDialogOpen(false)
      showSuccess('Usuario creado correctamente')
    } catch (error: any) {
      console.error('Error al crear usuario:', error)
      showError(error?.response?.data?.message || 'Error al crear usuario')
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)

    // If user is Company Admin, use dedicated dialog
    if (user.rol?.name === 'COMPANY_ADMIN') {
      setEditCompanyAdminDialogOpen(true)
    } else {
      setEditDialogOpen(true)
    }
  }

  const handleUpdateUser = async (data: CreateUserDto | UpdateUserDto) => {
    if (!selectedUser) return

    try {
      await updateMutation.mutateAsync({ id: selectedUser.id, data: data as UpdateUserDto })
      setEditDialogOpen(false)
      setSelectedUser(null)
      showSuccess('Usuario actualizado correctamente')
    } catch (error: any) {
      console.error('Error al actualizar usuario:', error)
      showError(error?.response?.data?.message || 'Error al actualizar usuario')
    }
  }

  const handleUpdateCompanyAdmin = async (data: UpdateUserDto) => {
    if (!selectedUser) return

    try {
      await updateMutation.mutateAsync({ id: selectedUser.id, data })
      setEditCompanyAdminDialogOpen(false)
      setSelectedUser(null)
      showSuccess('Admin de Empresa actualizado correctamente')
    } catch (error: any) {
      console.error('Error al actualizar admin de empresa:', error)
      showError(error?.response?.data?.message || 'Error al actualizar admin de empresa')
    }
  }

  const handleChangePassword = (user: User) => {
    setSelectedUser(user)
    setPasswordDialogOpen(true)
  }

  const handlePasswordSubmit = async (password: string) => {
    if (!selectedUser) return

    try {
      await changePasswordMutation.mutateAsync({ id: selectedUser.id, password })
      setPasswordDialogOpen(false)
      setSelectedUser(null)
      showSuccess('Contraseña cambiada correctamente')
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error)
      showError(error?.response?.data?.message || 'Error al cambiar contraseña')
    }
  }

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return

    try {
      await deleteMutation.mutateAsync(selectedUser.id)
      setDeleteDialogOpen(false)
      setSelectedUser(null)
      showSuccess('Usuario eliminado correctamente')
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error)
      showError(error?.response?.data?.message || 'Error al eliminar usuario')
    }
  }

  const columns = useMemo<ColumnDef<UserWithActionsType, any>[]>(
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
          const isSuperAdmin = row.original.rol?.name === 'SUPER_ADMIN'
          const isCompanyAdmin = row.original.rol?.name === 'COMPANY_ADMIN'
          const cannotDelete = isSuperAdmin || isCompanyAdmin
          const noActions = isSuperAdmin || isCompanyAdmin

          return (
            <div className='flex items-center gap-1'>
              {!noActions && canUpdate && (
                <Tooltip title='Editar'>
                  <IconButton size='small' onClick={() => handleEditUser(row.original)} color='primary'>
                    <i className='tabler-edit' />
                  </IconButton>
                </Tooltip>
              )}
              {!noActions && canUpdate && (
                <Tooltip title='Cambiar Contraseña'>
                  <IconButton size='small' onClick={() => handleChangePassword(row.original)} color='warning'>
                    <i className='tabler-key' />
                  </IconButton>
                </Tooltip>
              )}
              {!cannotDelete && canDelete && (
                <Tooltip title='Eliminar'>
                  <IconButton size='small' onClick={() => handleDeleteUser(row.original)} color='error'>
                    <i className='tabler-trash' />
                  </IconButton>
                </Tooltip>
              )}
              {noActions && (
                <Chip label='Sin acciones' size='small' variant='outlined' color='default' />
              )}
            </div>
          )
        },
        enableSorting: false
      }),
      columnHelper.accessor('fullName', {
        header: 'Usuario',
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
              {row.original.fullName.charAt(0).toUpperCase()}
            </Box>
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.fullName}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {row.original.email}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('ci', {
        header: 'CI',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <i className='tabler-id' style={{ fontSize: '16px', color: 'var(--mui-palette-text-secondary)' }} />
            <Typography variant='body2'>{row.original.ci}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('phone', {
        header: 'Teléfono',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <i className='tabler-phone' style={{ fontSize: '16px', color: 'var(--mui-palette-success-main)' }} />
            <Typography variant='body2'>{row.original.phone}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('rol', {
        header: 'Rol',
        cell: ({ row }) =>
          row.original.rol ? (
            <Chip
              label={getRoleDisplayName(row.original.rol.name)}
              color={row.original.rol.isStatic ? 'primary' : 'secondary'}
              variant='tonal'
              size='small'
              icon={<i className='tabler-shield' style={{ fontSize: '14px' }} />}
            />
          ) : (
            <Chip label='Sin Rol' color='default' variant='outlined' size='small' />
          )
      }),
      columnHelper.accessor('company', {
        header: 'Empresa',
        cell: ({ row }) =>
          row.original.company ? (
            <div className='flex items-center gap-2'>
              {row.original.company.logo && (
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <img
                    src={
                      row.original.company.logo.startsWith('http')
                        ? row.original.company.logo
                        : `${process.env.NEXT_PUBLIC_API_URL}${row.original.company.logo}`
                    }
                    alt={row.original.company.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
              )}
              <Typography variant='body2'>{row.original.company.name}</Typography>
            </div>
          ) : (
            <Chip label='Sin Empresa' color='default' variant='outlined' size='small' />
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
    return <Alert severity='error'>Error al cargar los usuarios. Por favor, intenta nuevamente.</Alert>
  }

  return (
    <Box>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <div className='flex flex-col gap-2'>
            <Typography variant='h4'>Gestión de Usuarios</Typography>
            <Typography variant='body2' color='text.secondary'>
              Administra los usuarios administradores del sistema
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
                Nuevo Usuario
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
              placeholder='Buscar usuarios...'
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
                    <Typography>No hay usuarios disponibles</Typography>
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
                {`Mostrando ${(currentPage - 1) * pageSize + 1} a ${Math.min(currentPage * pageSize, totalRecords)} de ${totalRecords} usuarios`}
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

      <CreateUserDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateUser}
        isLoading={createMutation.isPending}
        mode='create'
      />

      <CreateUserDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false)
          setSelectedUser(null)
        }}
        onSubmit={handleUpdateUser}
        isLoading={updateMutation.isPending}
        user={selectedUser}
        mode='edit'
      />

      <EditCompanyAdminDialog
        open={editCompanyAdminDialogOpen}
        onClose={() => {
          setEditCompanyAdminDialogOpen(false)
          setSelectedUser(null)
        }}
        onSubmit={handleUpdateCompanyAdmin}
        isLoading={updateMutation.isPending}
        user={selectedUser}
      />

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onClose={() => {
          setPasswordDialogOpen(false)
          setSelectedUser(null)
        }}
        onSubmit={handlePasswordSubmit}
        isLoading={changePasswordMutation.isPending}
        userName={selectedUser?.fullName}
      />

      <DeleteUserDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setSelectedUser(null)
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        user={selectedUser}
      />
    </Box>
  )
}

export default UsersTable
