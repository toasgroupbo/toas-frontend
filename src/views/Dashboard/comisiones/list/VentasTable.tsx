'use client'

import { useState, useMemo, useEffect } from 'react'

import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import Pagination from '@mui/material/Pagination'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getPaginationRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'

import { useCommissions } from '@/hooks/useCommissions'
import type { Commission } from '@/types/api/commissions'
import CustomTextField from '@core/components/mui/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import tableStyles from '@core/styles/table.module.css'
import UpdateCommissionDialog from '@/views/Dashboard/comisiones/components/UpdateCommissionDialog'
import CommissionsChartModal from '@/views/Dashboard/comisiones/components/CommissionsChartModal'
import ViewVoucherModal from '@/views/Dashboard/comisiones/components/ViewVoucherModal'

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const columnHelper = createColumnHelper<Commission>()

const formatCurrency = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value

  return `Bs. ${num.toFixed(2)}`
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const VentasTable = () => {
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [isPaidFilter, setIsPaidFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // State for dialog
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [chartModalOpen, setChartModalOpen] = useState(false)
  const [voucherModalOpen, setVoucherModalOpen] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState<{ url: string; companyName: string } | null>(null)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Build filters
  const filters = useMemo(() => {
    return {
      isPaid: isPaidFilter === 'all' ? undefined : isPaidFilter === 'paid',
      startDate: startDate ? startDate.toISOString().split('T')[0] : undefined,
      endDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
      search: debouncedSearch || undefined
    }
  }, [isPaidFilter, startDate, endDate, debouncedSearch])

  const { data: commissions, isLoading, error } = useCommissions(filters)

  // Handle actions
  const handleUpdateClick = (commission: Commission) => {
    setSelectedCommission(commission)
    setDialogOpen(true)
  }

  const handleViewVoucher = (commission: Commission) => {
    if (commission.voucher) {
      setSelectedVoucher({
        url: commission.voucher,
        companyName: commission.company.name
      })
      setVoucherModalOpen(true)
    }
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedCommission(null)
  }

  const columns = useMemo<ColumnDef<Commission, any>[]>(
    () => [
      columnHelper.display({
        id: 'nro',
        header: 'NRO',
        cell: ({ row }) => (
          <Typography variant='body2' fontWeight={500}>
            {(currentPage - 1) * pageSize + row.index + 1}
          </Typography>
        )
      }),
      columnHelper.accessor('period_key', {
        header: 'CUOTA CORRESPONDIENTE',
        cell: ({ row }) => (
          <Typography variant='body2' fontWeight={500}>
            {row.original.period_key}
          </Typography>
        )
      }),
      columnHelper.display({
        id: 'logo',
        header: 'LOGO',
        cell: ({ row }) => (
          <Avatar
            src={row.original.company.logo}
            alt={row.original.company.name}
            sx={{ width: 38, height: 38 }}
          >
            {row.original.company.name.charAt(0)}
          </Avatar>
        )
      }),
      columnHelper.accessor('company.name', {
        header: 'EMPRESA',
        cell: ({ row }) => (
          <Typography fontWeight={500} color='text.primary'>
            {row.original.company.name}
          </Typography>
        )
      }),
      columnHelper.accessor('tickets_app_count_total', {
        header: 'CANT. VENTAS APP',
        cell: ({ row }) => (
          <Typography variant='body2' align='center'>
            {row.original.tickets_app_count_total}
          </Typography>
        )
      }),
      columnHelper.accessor('commission_app_total', {
        header: 'COMISION APP',
        cell: ({ row }) => (
          <Typography variant='body2' align='right'>
            {formatCurrency(row.original.commission_app_total)}
          </Typography>
        )
      }),
      columnHelper.accessor('commission_company', {
        header: 'COMISION EMPRESA',
        cell: ({ row }) => (
          <Typography variant='body2' fontWeight={600} color='primary' align='right'>
            {formatCurrency(row.original.commission_company)}
          </Typography>
        )
      }),
      columnHelper.accessor('date_to_pay', {
        header: 'FECHA PAGO',
        cell: ({ row }) => (
          <Typography variant='body2' align='center'>
            {formatDate(row.original.date_to_pay)}
          </Typography>
        )
      }),
      columnHelper.accessor('paid', {
        header: 'PAGADO',
        cell: ({ row }) => {
          const isPaid = row.original.paid === 'paid'

          return (
            <Box display='flex' justifyContent='center'>
              <Chip
                label={isPaid ? 'Pagado' : 'En Proceso'}
                color={isPaid ? 'success' : 'warning'}
                size='small'
                variant='tonal'
              />
            </Box>
          )
        }
      }),
      columnHelper.display({
        id: 'actions',
        header: 'COMPROBANTE',
        cell: ({ row }) => {
          const hasVoucher = !!row.original.voucher

          return (
            <Box display='flex' gap={1} justifyContent='center'>
              {hasVoucher ? (
                <>
                  <Tooltip title='Ver'>
                    <Button
                      size='small'
                      color='info'
                      variant='text'
                      onClick={() => handleViewVoucher(row.original)}
                    >
                      Ver
                    </Button>
                  </Tooltip>
                  <Tooltip title='Editar'>
                    <Button
                      size='small'
                      color='primary'
                      variant='text'
                      onClick={() => handleUpdateClick(row.original)}
                    >
                      Editar
                    </Button>
                  </Tooltip>
                </>
              ) : (
                <Tooltip title='Insertar Comprobante'>
                  <Button
                    size='small'
                    color='primary'
                    variant='text'
                    onClick={() => handleUpdateClick(row.original)}
                  >
                    Insertar
                  </Button>
                </Tooltip>
              )}
            </Box>
          )
        }
      })
    ],
    [currentPage, pageSize]
  )

  const table = useReactTable<Commission>({
    data: commissions,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: pageSize
      }
    }
  })

  const totalRecords = commissions.length
  const totalPages = Math.ceil(totalRecords / pageSize)

  // Obtener datos paginados manualmente
  const paginatedData = commissions.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  if (isLoading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity='error'>Error al cargar el reporte de comisiones. Por favor, intenta nuevamente.</Alert>
  }

  return (
    <>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <div className='flex flex-wrap gap-4 items-center'>
            <CustomTextField
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder='Buscar empresa...'
              className='min-w-[200px]'
              InputProps={{
                startAdornment: <i className='tabler-search' style={{ marginRight: 8 }} />
              }}
            />

            <CustomTextField
              select
              value={isPaidFilter}
              onChange={e => setIsPaidFilter(e.target.value)}
              label='Pagado'
              className='min-w-[150px]'
            >
              <MenuItem value='all'>Todos</MenuItem>
              <MenuItem value='paid'>Pagado</MenuItem>
              <MenuItem value='pending'>Pendiente</MenuItem>
            </CustomTextField>

            <AppReactDatepicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              placeholderText='Mes Inicio'
              customInput={<CustomTextField label='Mes Inicio' fullWidth className='min-w-[180px]' />}
              dateFormat='MM/yyyy'
              showMonthYearPicker
              isClearable
            />

            <AppReactDatepicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              placeholderText='Mes Fin'
              customInput={<CustomTextField label='Mes Fin' fullWidth className='min-w-[180px]' />}
              dateFormat='MM/yyyy'
              showMonthYearPicker
              minDate={startDate || undefined}
              isClearable
            />
          </div>

          <div className='flex items-center gap-4'>
            <Button
              variant='contained'
              color='primary'
              startIcon={<i className='tabler-chart-bar' />}
              disabled={commissions.length === 0}
              onClick={() => setChartModalOpen(true)}
            >
              Gráfico
            </Button>

            <CustomTextField
              select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className='flex-auto is-[70px]'
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
              <tr style={{ backgroundColor: 'var(--mui-palette-success-lightOpacity)' }}>
                <th colSpan={10} style={{ textAlign: 'center', padding: '12px' }}>
                  <Typography variant='subtitle1' fontWeight={600}>
                    COMISION EMPRESA BS. 15
                  </Typography>
                </th>
              </tr>

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

            {paginatedData.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={10} className='text-center py-8'>
                    <Typography>No hay datos de comisiones disponibles</Typography>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {paginatedData.map((row, index) => (
                  <tr key={row.id}>
                    <td>
                      <Typography variant='body2' fontWeight={500}>
                        {(currentPage - 1) * pageSize + index + 1}
                      </Typography>
                    </td>
                    <td>
                      <Typography variant='body2' fontWeight={500}>
                        {row.period_key}
                      </Typography>
                    </td>
                    <td>
                      <Avatar src={row.company.logo} alt={row.company.name} sx={{ width: 38, height: 38 }}>
                        {row.company.name.charAt(0)}
                      </Avatar>
                    </td>
                    <td>
                      <Typography fontWeight={500} color='text.primary'>
                        {row.company.name}
                      </Typography>
                    </td>
                    <td>
                      <Typography variant='body2' align='center'>
                        {row.tickets_app_count_total}
                      </Typography>
                    </td>
                    <td>
                      <Typography variant='body2' align='right'>
                        {formatCurrency(row.commission_app_total)}
                      </Typography>
                    </td>
                    <td>
                      <Typography variant='body2' fontWeight={600} color='primary' align='right'>
                        {formatCurrency(row.commission_company)}
                      </Typography>
                    </td>
                    <td>
                      <Typography variant='body2' align='center'>
                        {formatDate(row.date_to_pay)}
                      </Typography>
                    </td>
                    <td>
                      <Box display='flex' justifyContent='center'>
                        <Chip
                          label={row.paid === 'paid' ? 'Pagado' : 'En Proceso'}
                          color={row.paid === 'paid' ? 'success' : 'warning'}
                          size='small'
                          variant='tonal'
                        />
                      </Box>
                    </td>
                    <td>
                      <Box display='flex' gap={1} justifyContent='center'>
                        {row.voucher ? (
                          <>
                            <Button size='small' color='info' variant='text' onClick={() => handleViewVoucher(row)}>
                              Ver
                            </Button>
                            <Button size='small' color='primary' variant='text' onClick={() => handleUpdateClick(row)}>
                              Editar
                            </Button>
                          </>
                        ) : (
                          <Button size='small' color='primary' variant='text' onClick={() => handleUpdateClick(row)}>
                            Insertar
                          </Button>
                        )}
                      </Box>
                    </td>
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
                {totalRecords > 0
                  ? `Mostrando ${(currentPage - 1) * pageSize + 1} a ${Math.min(currentPage * pageSize, totalRecords)} de ${totalRecords} comisiones`
                  : 'Sin datos'}
              </Typography>
              {totalPages > 1 && (
                <Pagination
                  shape='rounded'
                  color='primary'
                  variant='tonal'
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, page) => setCurrentPage(page)}
                  showFirstButton
                  showLastButton
                />
              )}
            </div>
          )}
          count={totalRecords}
          rowsPerPage={pageSize}
          page={currentPage - 1}
          onPageChange={() => {}}
        />
      </Card>

      {selectedCommission && (
        <UpdateCommissionDialog open={dialogOpen} commission={selectedCommission} onClose={handleCloseDialog} />
      )}

      <CommissionsChartModal open={chartModalOpen} onClose={() => setChartModalOpen(false)} data={commissions} />

      {selectedVoucher && (
        <ViewVoucherModal
          open={voucherModalOpen}
          onClose={() => {
            setVoucherModalOpen(false)
            setSelectedVoucher(null)
          }}
          voucherUrl={selectedVoucher.url}
          companyName={selectedVoucher.companyName}
        />
      )}
    </>
  )
}

export default VentasTable
