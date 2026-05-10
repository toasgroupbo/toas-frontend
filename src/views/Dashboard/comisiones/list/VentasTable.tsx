'use client'

import { useState, useMemo } from 'react'

import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import Pagination from '@mui/material/Pagination'
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

import { useCompanySalesReport } from '@/hooks/useCompanySalesReport'
import type { CompanySalesReport } from '@/types/api/companySales'
import CustomTextField from '@core/components/mui/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import tableStyles from '@core/styles/table.module.css'
import SalesChartModal from '@/views/Dashboard/comisiones/components/SalesChartModal'

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const columnHelper = createColumnHelper<CompanySalesReport>()

const formatCurrency = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value

  return `Bs ${num.toFixed(2)}`
}

const VentasTable = () => {
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [chartModalOpen, setChartModalOpen] = useState(false)

  const queryParams = useMemo(
    () => ({
      startDate: startDate ? startDate.toISOString().split('T')[0] : undefined,
      endDate: endDate ? endDate.toISOString().split('T')[0] : undefined
    }),
    [startDate, endDate]
  )

  const { salesReport, isLoading, error } = useCompanySalesReport(queryParams)

  const columns = useMemo<ColumnDef<CompanySalesReport, any>[]>(
    () => [
      // DATOS DE LA EMPRESA
      columnHelper.display({
        id: 'nro',
        header: 'NRO',
        cell: ({ row }) => (
          <Typography variant='body2' fontWeight={500}>
            {(currentPage - 1) * pageSize + row.index + 1}
          </Typography>
        )
      }),
      columnHelper.display({
        id: 'logo',
        header: 'LOGO',
        cell: () => (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: 'action.hover',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <i className='tabler-building-skyscraper' style={{ fontSize: '20px' }} />
          </Box>
        )
      }),
      columnHelper.accessor('companyName', {
        header: 'EMPRESA',
        cell: ({ row }) => (
          <Typography fontWeight={500} color='text.primary'>
            {row.original.companyName}
          </Typography>
        )
      }),

      // APLICACIÓN
      columnHelper.accessor('ticketsAppCount', {
        header: 'CANT. VENTAS',
        cell: ({ row }) => <Typography variant='body2'>{row.original.ticketsAppCount}</Typography>
      }),
      columnHelper.accessor('appAmount', {
        header: 'VENTAS ',
        cell: ({ row }) => <Typography variant='body2'>{formatCurrency(row.original.appAmount)}</Typography>
      }),
      columnHelper.accessor('totalCommission', {
        header: 'COMISIÓN',
        cell: ({ row }) => <Typography variant='body2'>{formatCurrency(row.original.totalCommission)}</Typography>
      }),

      // CAJEROS
      columnHelper.accessor('ticketsOfficeCount', {
        header: 'CANT. VENTAS',
        cell: ({ row }) => <Typography variant='body2'>{row.original.ticketsOfficeCount}</Typography>
      }),
      columnHelper.display({
        id: 'cajerosTotal',
        header: 'VENTAS ',
        cell: ({ row }) => {
          const cash = parseFloat(row.original.cashAmount) || 0
          const qr = parseFloat(row.original.qrAmount) || 0

          return <Typography variant='body2'>{formatCurrency(cash + qr)}</Typography>
        }
      }),

      // DEPÓSITO TOTAL
      columnHelper.accessor('netToCompany', {
        header: 'DEPÓSITO TOTAL',
        cell: ({ row }) => (
          <Typography variant='body2' fontWeight={600} color='success.main'>
            {formatCurrency(row.original.netToCompany)}
          </Typography>
        )
      })
    ],
    [currentPage, pageSize]
  )

  const table = useReactTable<CompanySalesReport>({
    data: salesReport,
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

  const totalRecords = salesReport.length
  const totalPages = Math.ceil(totalRecords / pageSize)

  // Obtener datos paginados manualmente
  const paginatedData = salesReport.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  if (isLoading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity='error'>Error al cargar el reporte de ventas. Por favor, intenta nuevamente.</Alert>
  }

  return (
    <>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <div className='flex flex-wrap gap-4 items-center'>
            <AppReactDatepicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              placeholderText='Fecha Inicio'
              customInput={<CustomTextField label='Fecha Inicio' fullWidth className='min-w-[180px]' />}
              dateFormat='dd/MM/yyyy'
              isClearable
            />

            <AppReactDatepicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              placeholderText='Fecha Fin'
              customInput={<CustomTextField label='Fecha Fin' fullWidth className='min-w-[180px]' />}
              dateFormat='dd/MM/yyyy'
              minDate={startDate || undefined}
              isClearable
            />
          </div>

          <div className='flex items-center gap-4'>
            <Button
              variant='contained'
              color='primary'
              startIcon={<i className='tabler-chart-bar' />}
              onClick={() => setChartModalOpen(true)}
              disabled={salesReport.length === 0}
            >
              Estadísticas
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
              {/* Header de grupos */}
              <tr>
                <th
                  colSpan={3}
                  style={{
                    textAlign: 'center',
                    backgroundColor: 'var(--mui-palette-success-lightOpacity)',
                    borderRight: '2px solid var(--mui-palette-divider)'
                  }}
                >
                  DATOS DE LA EMPRESA
                </th>
                <th
                  colSpan={3}
                  style={{
                    textAlign: 'center',
                    backgroundColor: 'var(--mui-palette-success-lightOpacity)',
                    borderRight: '2px solid var(--mui-palette-divider)'
                  }}
                >
                  APLICACIÓN
                </th>
                <th
                  colSpan={2}
                  style={{
                    textAlign: 'center',
                    backgroundColor: 'var(--mui-palette-success-lightOpacity)',
                    borderRight: '2px solid var(--mui-palette-divider)'
                  }}
                >
                  CAJEROS
                </th>
                <th
                  style={{
                    textAlign: 'center',
                    backgroundColor: 'var(--mui-palette-success-lightOpacity)'
                  }}
                >
                  DEPÓSITO TOTAL COMPAÑIA
                </th>
              </tr>

              {/* Header de columnas */}
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
                  <td colSpan={9} className='text-center py-8'>
                    <Typography>No hay datos de ventas disponibles</Typography>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {paginatedData.map((row, index) => (
                  <tr key={row.companyId}>
                    <td>
                      <Typography variant='body2' fontWeight={500}>
                        {(currentPage - 1) * pageSize + index + 1}
                      </Typography>
                    </td>
                    <td>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: 'action.hover',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <i className='tabler-building-skyscraper' style={{ fontSize: '20px' }} />
                      </Box>
                    </td>
                    <td>
                      <Typography fontWeight={500} color='text.primary'>
                        {row.companyName}
                      </Typography>
                    </td>
                    <td>
                      <Typography variant='body2'>{row.ticketsAppCount}</Typography>
                    </td>
                    <td>
                      <Typography variant='body2'>{formatCurrency(row.appAmount)}</Typography>
                    </td>
                    <td>
                      <Typography variant='body2'>{formatCurrency(row.totalCommission)}</Typography>
                    </td>
                    <td>
                      <Typography variant='body2'>{row.ticketsOfficeCount}</Typography>
                    </td>
                    <td>
                      <Typography variant='body2'>
                        {formatCurrency((parseFloat(row.cashAmount) || 0) + (parseFloat(row.qrAmount) || 0))}
                      </Typography>
                    </td>
                    <td>
                      <Typography variant='body2' fontWeight={600} color='success.main'>
                        {formatCurrency(row.netToCompany)}
                      </Typography>
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
                  ? `Mostrando ${(currentPage - 1) * pageSize + 1} a ${Math.min(currentPage * pageSize, totalRecords)} de ${totalRecords} empresas`
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

      <SalesChartModal open={chartModalOpen} onClose={() => setChartModalOpen(false)} data={salesReport} />
    </>
  )
}

export default VentasTable
