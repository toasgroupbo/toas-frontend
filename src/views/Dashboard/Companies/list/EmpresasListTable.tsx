'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'

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
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from '@/hooks/useCompanies'
import type { Company, CreateCompanyDto, UpdateCompanyDto } from '@/types/api/company'
import CreateCompanyDialog from '@/views/Dashboard/Companies/components/CreateCompanyDialog'
import UpdateCompanyDialog from '@/views/Dashboard/Companies/components/UpdateCompanyDialog'
import DeleteCompanyDialog from '@/views/Dashboard/Companies/components/DeleteCompanyDialog'
import ActAsCompanyDialog from '@/views/Dashboard/Companies/components/ActAsCompanyDialog'
import { useSnackbar } from '@/contexts/SnackbarContext'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'

type CompanyWithActionsType = Company & {
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

const columnHelper = createColumnHelper<CompanyWithActionsType>()

const EmpresaListTable = () => {
  const [rowSelection, setRowSelection] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [actAsDialogOpen, setActAsDialogOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  const { data: companies, isLoading, error } = useCompanies()
  const createMutation = useCreateCompany()
  const updateMutation = useUpdateCompany()
  const deleteMutation = useDeleteCompany()
  const { showSuccess, showError } = useSnackbar()
  const { canImpersonate, setActingAsCompany } = useAuth()
  const { canCreate, canUpdate, canDelete } = usePermissions().getCRUDPermissions('COMPANY')

  const [data, setData] = useState<Company[]>([])

  useEffect(() => {
    if (companies) {
      setData(companies)
    }
  }, [companies])

  const handleCreateCompany = async (data: CreateCompanyDto) => {
    try {
      await createMutation.mutateAsync(data)
      setCreateDialogOpen(false)
      showSuccess('Empresa creada correctamente')
    } catch (error: any) {
      console.error('Error al crear empresa:', error)
      showError(error?.response?.data?.message || 'Error al crear empresa')
    }
  }

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company)
    setUpdateDialogOpen(true)
  }

  const handleUpdateCompany = async (id: string, data: UpdateCompanyDto) => {
    try {
      await updateMutation.mutateAsync({ id, data })
      setUpdateDialogOpen(false)
      setSelectedCompany(null)
      showSuccess('Empresa actualizada correctamente')
    } catch (error: any) {
      console.error('Error al actualizar empresa:', error)
      showError(error?.response?.data?.message || 'Error al actualizar empresa')
    }
  }

  const handleDeleteCompany = (company: Company) => {
    setSelectedCompany(company)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedCompany) return

    try {
      await deleteMutation.mutateAsync(selectedCompany.id)
      setDeleteDialogOpen(false)
      setSelectedCompany(null)
      showSuccess('Empresa eliminada correctamente')
    } catch (error: any) {
      console.error('Error al eliminar empresa:', error)
      showError(error?.response?.data?.message || 'Error al eliminar empresa')
    }
  }

  const handleActAsCompany = useCallback((company: Company) => {
    setSelectedCompany(company)
    setActAsDialogOpen(true)
  }, [])

  const handleConfirmActAs = useCallback(() => {
    if (!selectedCompany) return

    setActingAsCompany(selectedCompany)
    setActAsDialogOpen(false)
    setSelectedCompany(null)
    showSuccess(`Ahora estás actuando como: ${selectedCompany.name}`)
  }, [selectedCompany, setActingAsCompany, showSuccess])

  const columns = useMemo<ColumnDef<CompanyWithActionsType, any>[]>(
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
            {canImpersonate && (
              <Tooltip title='Actuar como empresa'>
                <IconButton
                  size='small'
                  onClick={() => handleActAsCompany(row.original)}
                  sx={{
                    color: 'warning.main',
                    '&:hover': { backgroundColor: 'warning.light', color: 'white' }
                  }}
                >
                  <i className='tabler-switch-horizontal' />
                </IconButton>
              </Tooltip>
            )}
            {canUpdate && (
              <Tooltip title='Editar'>
                <IconButton
                  size='small'
                  onClick={() => handleEditCompany(row.original)}
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
                  onClick={() => handleDeleteCompany(row.original)}
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
      columnHelper.accessor('logo', {
        header: 'Logo',
        cell: ({ row }) => {
          const logoUrl = row.original.logo.startsWith('http')
            ? row.original.logo
            : `${process.env.NEXT_PUBLIC_API_URL}${row.original.logo}`

          return (
            <Box
              sx={{
                width: 60,
                height: 40,
                borderRadius: 1,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <img
                src={logoUrl}
                alt={row.original.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={e => {
                  e.currentTarget.src = '/images/placeholder-empresa.jpg'
                }}
              />
            </Box>
          )
        },
        size: 80
      }),
      columnHelper.accessor('name', {
        header: 'Empresa',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.name}
          </Typography>
        )
      }),
      columnHelper.accessor('bankAccount', {
        header: 'Banco',
        cell: ({ row }) => (
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-1'>
              <i
                className='tabler-building-bank'
                style={{ fontSize: '16px', color: 'var(--mui-palette-primary-main)' }}
              />
              <Typography variant='body2' color='text.primary'>
                {row.original.bankAccount.bank}
              </Typography>
            </div>
            <Typography variant='caption' color='text.secondary'>
              {row.original.bankAccount.typeAccount === 'caja_ahorro' ? 'Caja de Ahorro' : 'Cuenta Corriente'}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Cta: {row.original.bankAccount.account}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('hours_before_closing', {
        header: 'Horas Cancelar',
        cell: ({ row }) => (
          <Chip
            label={`${row.original.hours_before_closing}h`}
            color='error'
            variant='tonal'
            size='small'
            icon={<i className='tabler-clock' style={{ fontSize: '14px' }} />}
          />
        ),
        size: 100
      }),
      columnHelper.accessor('commission', {
        header: 'Comisión',
        cell: ({ row }) => <Chip label={`${row.original.commission}%`} color='success' variant='tonal' size='small' />,
        size: 80
      }),
      columnHelper.accessor('admin', {
        header: 'Administrador',
        cell: ({ row }) => (
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-1'>
              <i className='tabler-user' style={{ fontSize: '16px', color: 'var(--mui-palette-text-secondary)' }} />
              <Typography className='font-medium' color='text.primary' variant='body2'>
                {row.original.admin.fullName}
              </Typography>
            </div>
            <Typography variant='caption' color='text.secondary'>
              CI: {row.original.admin.ci}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {row.original.admin.email}
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
            <Typography variant='body2'>{row.original.admin.phone}</Typography>
          </div>
        )
      }
    ],
    [canImpersonate, canUpdate, canDelete, handleActAsCompany]
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
    return <Alert severity='error'>Error al cargar las empresas. Por favor, intenta nuevamente.</Alert>
  }

  return (
    <Box>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <div className='flex flex-col gap-2'>
            <Typography variant='h4'>Gestión de Empresas</Typography>
            <Typography variant='body2' color='text.secondary'>
              Administra las empresas del sistema
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
                Nueva Empresa
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
              placeholder='Buscar empresas...'
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
                    <Typography>No hay empresas disponibles</Typography>
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
                {`Mostrando ${(currentPage - 1) * pageSize + 1} a ${Math.min(currentPage * pageSize, totalRecords)} de ${totalRecords} empresas`}
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

      <CreateCompanyDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateCompany}
        isLoading={createMutation.isPending}
      />

      <UpdateCompanyDialog
        open={updateDialogOpen}
        onClose={() => {
          setUpdateDialogOpen(false)
          setSelectedCompany(null)
        }}
        onSubmit={handleUpdateCompany}
        company={selectedCompany}
        isLoading={updateMutation.isPending}
      />

      <DeleteCompanyDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setSelectedCompany(null)
        }}
        onConfirm={handleConfirmDelete}
        company={selectedCompany}
        isLoading={deleteMutation.isPending}
      />

      <ActAsCompanyDialog
        open={actAsDialogOpen}
        onClose={() => {
          setActAsDialogOpen(false)
          setSelectedCompany(null)
        }}
        onConfirm={handleConfirmActAs}
        company={selectedCompany}
      />
    </Box>
  )
}

export default EmpresaListTable
