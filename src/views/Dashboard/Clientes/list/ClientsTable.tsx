'use client'

import { useState, useMemo, useEffect } from 'react'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import { Pagination } from '@mui/material'
import Checkbox from '@mui/material/Checkbox'
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'
import type { TextFieldProps } from '@mui/material/TextField'

import { useCustomers } from '@/hooks/useCustomers'
import type { Customer } from '@/types/api/customers'
import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'
import RechargeModal from '@/views/Dashboard/Clientes/components/RechargeModal'
import QRPaymentModal from '@/views/Dashboard/Clientes/components/QRPaymentModal'

type CustomerWithActionsType = Customer & {
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

const columnHelper = createColumnHelper<CustomerWithActionsType>()

// Helper to validate complete date format (YYYY-MM-DD = 10 chars)
const isValidDateInput = (date: string) => date === '' || date.length === 10

const ClientsTable = () => {
  const [rowSelection, setRowSelection] = useState({})
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(new Set())
  const [selectedCustomersMap, setSelectedCustomersMap] = useState<Map<string, Customer>>(new Map())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [verificationFilter, setVerificationFilter] = useState<boolean | 'all'>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [startDateInput, setStartDateInput] = useState<string>('')
  const [endDateInput, setEndDateInput] = useState<string>('')
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false)

  // Debounce effect for start date
  useEffect(() => {
    if (!isValidDateInput(startDateInput)) return

    const timeout = setTimeout(() => {
      setStartDate(startDateInput)
      setCurrentPage(1)
    }, 800)

    return () => clearTimeout(timeout)
  }, [startDateInput])

  // Debounce effect for end date
  useEffect(() => {
    if (!isValidDateInput(endDateInput)) return

    const timeout = setTimeout(() => {
      setEndDate(endDateInput)
      setCurrentPage(1)
    }, 800)

    return () => clearTimeout(timeout)
  }, [endDateInput])
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [selectedCustomersForRecharge, setSelectedCustomersForRecharge] = useState<any[]>([])
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: pageSize,
      search: searchQuery,
      is_verified: verificationFilter,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    }),
    [currentPage, pageSize, searchQuery, verificationFilter, startDate, endDate]
  )

  const {
    data: customersResponse,
    isLoading,
    error,
    refetch,
    generateRechargeQR,
    isGeneratingQR,
    qrData,
    qrError,
    verifyPayment,
    isVerifying
  } = useCustomers(queryParams)

  const customers = customersResponse?.data || []
  const meta = customersResponse?.meta

  useEffect(() => {
    if (customers.length > 0) {
      const newRowSelection: Record<string, boolean> = {}

      customers.forEach((customer, index) => {
        if (selectedCustomerIds.has(customer.id)) {
          newRowSelection[index] = true
        }
      })

      setRowSelection(newRowSelection)
    }
  }, [customers, selectedCustomerIds])

  // Limpiar alerta después de 3 segundos
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(null), 3000)

      return () => clearTimeout(timer)
    }
  }, [alertMessage])

  const columns = useMemo<ColumnDef<CustomerWithActionsType, any>[]>(
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
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => (
          <Button
            size='small'
            variant='outlined'
            color='primary'
            onClick={() => {
              setSelectedCustomersForRecharge([row.original])
              setRechargeModalOpen(true)
            }}
          >
            Recargar
          </Button>
        )
      },
      columnHelper.accessor('name', {
        header: 'Nombre',
        cell: ({ row }) => (
          <Box display='flex' alignItems='center' gap={2}>
            <Typography className='font-medium' color='text.primary'>
              {row.original.name}
            </Typography>
          </Box>
        )
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.secondary'>
            {row.original.email}
          </Typography>
        )
      }),
      columnHelper.accessor('ci', {
        header: 'CI',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.secondary'>
            {row.original.ci || '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('phone', {
        header: 'Teléfono',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.secondary'>
            {row.original.phone || '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('birthDate', {
        header: 'Fecha de Nacimiento',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.secondary'>
            {row.original.birthDate
              ? new Date(row.original.birthDate).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })
              : '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('ticketsBought', {
        header: 'Tickets Comprados',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.secondary'>
            {row.original.ticketsBought || 0}
          </Typography>
        )
      }),
      columnHelper.accessor('availableBalance', {
        header: 'Saldo Disponible',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.secondary'>
            Bs {row.original.availableBalance || 0}
          </Typography>
        )
      }),
      columnHelper.accessor('is_verified', {
        header: 'Verificado',
        cell: ({ row }) => (
          <Chip
            label={row.original.is_verified ? 'Verificado' : 'No verificado'}
            size='small'
            color={row.original.is_verified ? 'success' : 'warning'}
            variant='tonal'
          />
        )
      })
    ],
    []
  )

  const table = useReactTable<CustomerWithActionsType>({
    data: customers,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection
    },
    enableRowSelection: true,
    onRowSelectionChange: updater => {
      setRowSelection(prev => {
        const newValue = typeof updater === 'function' ? updater(prev) : updater

        // Actualizar el Set de IDs seleccionados y el Map de objetos completos
        const newSelectedIds = new Set(selectedCustomerIds)
        const newSelectedCustomersMap = new Map(selectedCustomersMap)

        Object.keys(newValue).forEach(index => {
          const rowIndex = parseInt(index)
          const customer = customers[rowIndex]

          if (customer && newValue[index]) {
            newSelectedIds.add(customer.id)
            newSelectedCustomersMap.set(customer.id, customer)
          }
        })

        customers.forEach(customer => {
          const customerIndex = customers.indexOf(customer)

          if (!newValue[customerIndex]) {
            newSelectedIds.delete(customer.id)
            newSelectedCustomersMap.delete(customer.id)
          }
        })

        setSelectedCustomerIds(newSelectedIds)
        setSelectedCustomersMap(newSelectedCustomersMap)

        return newValue
      })
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  const handleOpenRechargeModal = () => {
    if (selectedCustomerIds.size === 0) {
      setAlertMessage({ type: 'error', text: 'Por favor, selecciona al menos un cliente para recargar' })

      return
    }

    // Obtener los objetos completos de los clientes seleccionados desde el Map
    const selectedCustomers = Array.from(selectedCustomersMap.values())

    setSelectedCustomersForRecharge(selectedCustomers)
    setRechargeModalOpen(true)
  }

  const handleRecharge = async (customerIds: number[], amount: number) => {
    try {
      const result = await generateRechargeQR({
        customerIds,
        amountPerCustomer: amount
      })

      if (result) {
        setRechargeModalOpen(false)
        setQrModalOpen(true)

        setSelectedCustomersForRecharge([])
        setRowSelection({})
        setSelectedCustomerIds(new Set())
        setSelectedCustomersMap(new Map())
      }
    } catch (error) {
      setAlertMessage({
        type: 'error',
        text: 'Error al generar el código QR. Por favor, intenta nuevamente.'
      })
    }
  }

  const handlePaymentSuccess = () => {
    setAlertMessage({ type: 'success', text: '¡Pago confirmado! El crédito ha sido recargado.' })
    setQrModalOpen(false)

    refetch()
  }

  if (isLoading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity='error'>Error al cargar los clientes. Por favor, intenta nuevamente.</Alert>
  }

  const selectedCount = selectedCustomerIds.size

  return (
    <Box>
      {alertMessage && (
        <Alert severity={alertMessage.type} sx={{ mb: 2 }}>
          {alertMessage.text}
        </Alert>
      )}

      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <div className='flex flex-wrap gap-4 items-center'>
            <DebouncedInput
              value={searchQuery}
              onChange={value => {
                const newValue = String(value)

                // Only reset page if search value actually changed
                if (newValue !== searchQuery) {
                  setSearchQuery(newValue)
                  setCurrentPage(1)
                }
              }}
              placeholder='Buscar clientes...'
              className='max-sm:is-full min-w-[300px] flex-1 max-w-md'
            />

            <CustomTextField
              select
              value={verificationFilter}
              onChange={e => {
                const value = e.target.value

                setVerificationFilter(value === 'all' ? 'all' : value === 'true')
                setCurrentPage(1)
              }}
              className='min-w-[180px]'
              label='Estado de verificación'
            >
              <MenuItem value='all'>Todos</MenuItem>
              <MenuItem value='true'>Verificados</MenuItem>
              <MenuItem value='false'>No verificados</MenuItem>
            </CustomTextField>

            <CustomTextField
              type='date'
              label='Fecha Inicio'
              value={startDateInput}
              onChange={e => setStartDateInput(e.target.value)}
              InputLabelProps={{ shrink: true }}
              className='min-w-[150px]'
            />

            <CustomTextField
              type='date'
              label='Fecha Fin'
              value={endDateInput}
              onChange={e => setEndDateInput(e.target.value)}
              InputLabelProps={{ shrink: true }}
              className='min-w-[150px]'
            />
          </div>

          <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
            {selectedCount > 0 && (
              <Button
                variant='contained'
                color='primary'
                startIcon={<i className='tabler-wallet' />}
                onClick={handleOpenRechargeModal}
                disabled={isGeneratingQR}
              >
                Recargar Crédito ({selectedCount})
              </Button>
            )}

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
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, px: 2 }}>
          <Card
            variant='outlined'
            sx={{
              borderColor: 'primary.main',
              bgcolor: 'transparent',
              minWidth: '200px'
            }}
          >
            <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
              <Typography variant='body2' color='text.secondary'>
                Balance Total:
              </Typography>
              <Typography variant='h6' sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Bs {customersResponse?.totalBalance?.toLocaleString() || 0}
              </Typography>
            </Box>
          </Card>
        </Box>
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

            {customers.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-8'>
                    <Typography>No hay clientes disponibles</Typography>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map(row => (
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
                {meta
                  ? `Mostrando ${meta.offset + 1} a ${Math.min(meta.offset + meta.limit, meta.total)} de ${meta.total} clientes`
                  : 'Cargando...'}
              </Typography>
              {meta && (
                <Pagination
                  shape='rounded'
                  color='primary'
                  variant='tonal'
                  count={meta.lastPage}
                  page={currentPage}
                  onChange={(_, page) => setCurrentPage(page)}
                  showFirstButton
                  showLastButton
                />
              )}
            </div>
          )}
          count={meta?.total || 0}
          rowsPerPage={pageSize}
          page={currentPage - 1}
          onPageChange={() => {}}
        />
      </Card>

      <RechargeModal
        open={rechargeModalOpen}
        onClose={() => setRechargeModalOpen(false)}
        selectedCustomers={selectedCustomersForRecharge}
        onRecharge={handleRecharge}
        isRecharging={isGeneratingQR}
      />

      <QRPaymentModal
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        qrData={qrData}
        isLoading={isGeneratingQR}
        error={qrError}
        verifyPayment={verifyPayment}
      />
    </Box>
  )
}

export default ClientsTable
