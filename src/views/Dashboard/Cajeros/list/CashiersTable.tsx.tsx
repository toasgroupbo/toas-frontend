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
import {
  useCashiers,
  useCreateCashier,
  useUpdateCashier,
  useDeleteCashier,
  useChangePasswordCashier
} from '@/hooks/useCashiers'
import type { Cashier, CreateCashierDto, UpdateCashierDto } from '@/types/api/cashiers'
import CreateCashierDialog from '@/views/Dashboard/Cajeros/components/CreateCashierDialog'
import ChangePasswordDialog from '@/views/Dashboard/Cajeros/components/ChangePasswordDialog'
import DeleteCashierDialog from '@/views/Dashboard/Cajeros/components/DeleteCashierDialog'
import { useSnackbar } from '@/contexts/SnackbarContext'
import { usePermissions } from '@/hooks/usePermissions'

type CashierWithActionsType = Cashier & {
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

const columnHelper = createColumnHelper<CashierWithActionsType>()

const CashiersTable = () => {
  const [rowSelection, setRowSelection] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCashier, setSelectedCashier] = useState<Cashier | null>(null)

  const { data: cashiers, isLoading, error } = useCashiers()
  const createMutation = useCreateCashier()
  const updateMutation = useUpdateCashier()
  const deleteMutation = useDeleteCashier()
  const changePasswordMutation = useChangePasswordCashier()
  const { showSuccess, showError } = useSnackbar()
  const { canCreate, canUpdate, canDelete } = usePermissions().getCRUDPermissions('CASHIER')

  const [data, setData] = useState<Cashier[]>([])

  useEffect(() => {
    if (cashiers) {
      setData(cashiers)
    }
  }, [cashiers])

  const handleCreateCashier = async (data: CreateCashierDto | UpdateCashierDto, officeId: string) => {
    try {
      await createMutation.mutateAsync(data as CreateCashierDto)
      setCreateDialogOpen(false)
      showSuccess('Cajero creado correctamente')
    } catch (error: any) {
      console.error('Error al crear cajero:', error)
      showError(error?.response?.data?.message || 'Error al crear cajero')
    }
  }

  const handleEditCashier = (cashier: Cashier) => {
    setSelectedCashier(cashier)
    setEditDialogOpen(true)
  }

  const handleUpdateCashier = async (data: CreateCashierDto | UpdateCashierDto, officeId: string) => {
    if (!selectedCashier) return

    try {
      await updateMutation.mutateAsync({
        cashierId: selectedCashier.id,
        cashierData: data as UpdateCashierDto,
        officeData: officeId,
        originalOffice: selectedCashier.office?.id
      })
      setEditDialogOpen(false)
      setSelectedCashier(null)
      showSuccess('Cajero actualizado correctamente')
    } catch (error: any) {
      console.error('Error al actualizar cajero:', error)
      showError(error?.response?.data?.message || 'Error al actualizar cajero')
    }
  }

  const handleChangePassword = (cashier: Cashier) => {
    setSelectedCashier(cashier)
    setPasswordDialogOpen(true)
  }

  const handlePasswordSubmit = async (password: string) => {
    if (!selectedCashier) return

    try {
      await changePasswordMutation.mutateAsync({ id: selectedCashier.id, password })
      setPasswordDialogOpen(false)
      setSelectedCashier(null)
      showSuccess('Contraseña cambiada correctamente')
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error)
      showError(error?.response?.data?.message || 'Error al cambiar contraseña')
    }
  }

  const handleDeleteCashier = (cashier: Cashier) => {
    setSelectedCashier(cashier)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedCashier) return

    try {
      await deleteMutation.mutateAsync(selectedCashier.id)
      setDeleteDialogOpen(false)
      setSelectedCashier(null)
      showSuccess('Cajero eliminado correctamente')
    } catch (error: any) {
      console.error('Error al eliminar cajero:', error)
      showError(error?.response?.data?.message || 'Error al eliminar cajero')
    }
  }

  const columns = useMemo<ColumnDef<CashierWithActionsType, any>[]>(
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
          <div className='flex items-center gap-1'>
            {canUpdate && (
              <Tooltip title='Editar'>
                <IconButton size='small' onClick={() => handleEditCashier(row.original)} color='primary'>
                  <i className='tabler-edit' />
                </IconButton>
              </Tooltip>
            )}
            {canUpdate && (
              <Tooltip title='Cambiar Contraseña'>
                <IconButton size='small' onClick={() => handleChangePassword(row.original)} color='warning'>
                  <i className='tabler-key' />
                </IconButton>
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title='Eliminar'>
                <IconButton size='small' onClick={() => handleDeleteCashier(row.original)} color='error'>
                  <i className='tabler-trash' />
                </IconButton>
              </Tooltip>
            )}
          </div>
        ),
        enableSorting: false
      }),
      columnHelper.accessor('fullName', {
        header: 'Cajero',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'success.main',
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
      columnHelper.accessor('office', {
        header: 'Oficina',
        cell: ({ row }) =>
          row.original.office ? (
            <div className='flex items-center gap-2'>
              <i className='tabler-building' style={{ fontSize: '18px', color: 'var(--mui-palette-primary-main)' }} />
              <div className='flex flex-col'>
                <Typography variant='body2' fontWeight='medium'>
                  {row.original.office.name}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {row.original.office.place}
                </Typography>
              </div>
            </div>
          ) : (
            <Chip label='Sin Oficina' color='default' variant='outlined' size='small' />
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
    return <Alert severity='error'>Error al cargar los cajeros. Por favor, intenta nuevamente.</Alert>
  }

  return (
    <Box>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <div className='flex flex-col gap-2'>
            <Typography variant='h4'>Lista de Cajeros</Typography>
          </div>

          {canCreate && (
            <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
              <Button
                variant='contained'
                color='primary'
                onClick={() => setCreateDialogOpen(true)}
                startIcon={<i className='tabler-plus' />}
              >
                Nuevo Cajero
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
              placeholder='Buscar cajeros...'
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
                    <Typography>No hay cajeros disponibles</Typography>
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
                {`Mostrando ${(currentPage - 1) * pageSize + 1} a ${Math.min(currentPage * pageSize, totalRecords)} de ${totalRecords} cajeros`}
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

      <CreateCashierDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateCashier}
        isLoading={createMutation.isPending}
        mode='create'
      />

      <CreateCashierDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false)
          setSelectedCashier(null)
        }}
        onSubmit={handleUpdateCashier}
        isLoading={updateMutation.isPending}
        cashier={selectedCashier}
        mode='edit'
      />

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onClose={() => {
          setPasswordDialogOpen(false)
          setSelectedCashier(null)
        }}
        onSubmit={handlePasswordSubmit}
        isLoading={changePasswordMutation.isPending}
        userName={selectedCashier?.fullName}
      />

      <DeleteCashierDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setSelectedCashier(null)
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        cashier={selectedCashier}
      />
    </Box>
  )
}

export default CashiersTable
