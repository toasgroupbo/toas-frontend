'use client'

import { useState, useMemo, useEffect, useRef } from 'react'

import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import { Pagination } from '@mui/material'
import Avatar from '@mui/material/Avatar'
import classnames from 'classnames'
import { flexRender, getCoreRowModel, useReactTable, getSortedRowModel } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

import { useCommissions, useGenerateCommissions } from '@/hooks/useCommissions'
import type { Commission } from '@/types/api/commissions'
import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'
import CommissionsChartModal from '@/views/Dashboard/comisiones/components/CommissionsChartModal'
import DebouncedInput from '@/views/Dashboard/Tickets/sold/components/DebouncedInput'
import { useAuth } from '@/contexts/AuthContext'

const getTodayDate = () => new Date().toISOString().split('T')[0]

// Helper to validate complete date format (YYYY-MM-DD = 10 chars)
const isValidDateInput = (date: string) => date === '' || date.length === 10

const formatCurrency = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value

  return `Bs. ${num.toFixed(2)}`
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)

  return date.toLocaleDateString('es-BO', {
    timeZone: 'America/La_Paz',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)

  return date.toLocaleTimeString('es-BO', {
    timeZone: 'America/La_Paz',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

const VentasTable = () => {
  const { isCompanyAdmin, isImpersonating } = useAuth()
  const isCompanyMode = isImpersonating || isCompanyAdmin

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [startDate, setStartDate] = useState<string>(getTodayDate())
  const [endDate, setEndDate] = useState<string>('')
  const [startDateInput, setStartDateInput] = useState<string>(getTodayDate())
  const [endDateInput, setEndDateInput] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [chartModalOpen, setChartModalOpen] = useState<boolean>(false)

  // Refs to track if this is the initial mount (to avoid resetting page on first render)
  const isInitialStartDate = useRef(true)
  const isInitialEndDate = useRef(true)

  // Debounce effect for start date
  useEffect(() => {
    if (!isValidDateInput(startDateInput)) return

    // Capture the initial state BEFORE the timeout
    const shouldResetPage = !isInitialStartDate.current

    if (isInitialStartDate.current) {
      isInitialStartDate.current = false
    }

    const timeout = setTimeout(() => {
      setStartDate(startDateInput)

      if (shouldResetPage) {
        setCurrentPage(1)
      }
    }, 800)

    return () => clearTimeout(timeout)
  }, [startDateInput])

  // Debounce effect for end date
  useEffect(() => {
    if (!isValidDateInput(endDateInput)) return

    // Capture the initial state BEFORE the timeout
    const shouldResetPage = !isInitialEndDate.current

    if (isInitialEndDate.current) {
      isInitialEndDate.current = false
    }

    const timeout = setTimeout(() => {
      setEndDate(endDateInput)

      if (shouldResetPage) {
        setCurrentPage(1)
      }
    }, 800)

    return () => clearTimeout(timeout)
  }, [endDateInput])

  const generateMutation = useGenerateCommissions()

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: pageSize,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      search: searchQuery || undefined
    }),
    [currentPage, pageSize, startDate, endDate, searchQuery]
  )

  const { data: commissionsResponse, isLoading, error } = useCommissions(queryParams)

  const commissions = commissionsResponse?.data || []
  const meta = commissionsResponse?.meta
  const totals = commissionsResponse?.totals

  const totalCommissionApp = parseFloat(totals?.total_commission_app || '0')
  const totalPlatform = parseFloat(totals?.total_commission_company || '0')
  const totalSaldo = totalCommissionApp - totalPlatform

  const columns = useMemo<ColumnDef<Commission, any>[]>(() => {
    const baseColumns: ColumnDef<Commission, any>[] = [
      {
        id: 'nro',
        header: 'NRO',
        cell: ({ row }) => (
          <Typography variant='body2' fontWeight={500}>
            {(currentPage - 1) * pageSize + row.index + 1}
          </Typography>
        ),
        meta: { align: 'center' }
      },
      {
        accessorKey: 'departure_time',
        header: 'FECHA SALIDA',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography variant='body2' sx={{ textTransform: 'capitalize' }}>
              {formatDate(row.original.departure_time)}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {formatTime(row.original.departure_time)}
            </Typography>
          </div>
        ),
        meta: { align: 'left' }
      }
    ]

    if (!isCompanyMode) {
      baseColumns.push(
        {
          id: 'logo',
          header: 'LOGO',
          cell: ({ row }) => {
            const logoUrl = row.original.travel.company.logo.startsWith('http')
              ? row.original.travel.company.logo
              : `${process.env.NEXT_PUBLIC_API_URL}${row.original.travel.company.logo}`

            return (
              <Avatar src={logoUrl} alt={row.original.travel.company.name} sx={{ width: 38, height: 38 }}>
                {row.original.travel.company.name.charAt(0)}
              </Avatar>
            )
          },
          meta: { align: 'center' }
        },
        {
          id: 'empresa',
          header: 'EMPRESA',
          cell: ({ row }) => (
            <Typography fontWeight={500} color='text.primary'>
              {row.original.travel.company.name}
            </Typography>
          ),
          meta: { align: 'left' }
        }
      )
    }

    // Columna RUTA / PLACA para todos los modos
    baseColumns.push({
      id: 'ruta',
      header: 'RUTA / PLACA',
      cell: ({ row }) => {
        const origin = row.original.travel.route?.officeOrigin?.place?.name || 'N/A'
        const destination = row.original.travel.route?.officeDestination?.place?.name || 'N/A'
        const plaque = row.original.travel.bus?.plaque || 'N/A'

        return (
          <div className='flex flex-col'>
            <Typography variant='body2'>
              {origin} → {destination}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Placa: {plaque}
            </Typography>
          </div>
        )
      },
      meta: { align: 'left' }
    })

    /*  baseColumns.push({
      id: 'cant_viajes',
      header: 'CANT. DE VIAJES',
      cell: () => <Typography variant='body2'>1</Typography>,
      meta: { align: 'center' }
    }) */

    if (!isCompanyMode) {
      baseColumns.push({
        accessorKey: 'commission_app_total',
        header: 'TOTAL COMISION APP',
        cell: ({ row }) => <Typography variant='body2'>{formatCurrency(row.original.commission_app_total)}</Typography>,
        meta: { align: 'right' }
      })
    }

    baseColumns.push(
      {
        accessorKey: 'commission_company_total',
        header: 'COMISION PLATAFORMA',
        cell: ({ row }) => <Typography variant='body2'>{formatCurrency(row.original.commission_company)}</Typography>,
        meta: { align: 'right' }
      },
      {
        accessorKey: 'tickets_app_count',
        header: 'CANT. VENTAS APP',
        cell: ({ row }) => <Typography variant='body2'>{row.original.tickets_app_count}</Typography>,
        meta: { align: 'center' }
      },
      {
        id: 'total_plataforma',
        header: 'TOTAL PLATAFORMA',
        cell: ({ row }) => (
          <Typography variant='body2' fontWeight={600} color='primary'>
            {formatCurrency(row.original.commission_company_total)}
          </Typography>
        ),
        meta: { align: 'right' }
      }
    )

    return baseColumns
  }, [currentPage, pageSize, isCompanyMode])

  const table = useReactTable<Commission>({
    data: commissions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true
  })

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
          <div className='flex flex-col gap-2'>
            <Typography variant='h5'>Reporte de Comisiones</Typography>
            <Typography variant='body2' color='text.secondary'>
              Visualiza y analiza el{' '}
              <Typography component='span' color='primary' variant='body2'>
                reporte de comisiones
              </Typography>{' '}
              y ventas.
            </Typography>
          </div>
        </div>

        <div className='flex flex-wrap gap-4 px-6 pb-4 items-center justify-between'>
          <div className='flex flex-wrap gap-4 items-center'>
            {!isCompanyMode && (
              <DebouncedInput
                placeholder='Buscar empresa...'
                value={searchQuery}
                onChange={value => {
                  const newValue = String(value)

                  // Only reset page if search value actually changed
                  if (newValue !== searchQuery) {
                    setSearchQuery(newValue)
                    setCurrentPage(1)
                  }
                }}
                debounce={500}
                size='small'
                sx={{ minWidth: 200 }}
              />
            )}

            <CustomTextField
              type='date'
              label='Fecha inicio'
              value={startDateInput}
              onChange={e => setStartDateInput(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: '150px' }}
            />

            <CustomTextField
              type='date'
              label='Fecha Final'
              value={endDateInput}
              onChange={e => setEndDateInput(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: '150px' }}
            />

            {!isCompanyMode && (
              <Button
                variant='contained'
                color='success'
                startIcon={
                  generateMutation.isPending ? (
                    <CircularProgress size={16} color='inherit' />
                  ) : (
                    <i className='tabler-refresh' />
                  )
                }
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
              >
                Generar comisiones
              </Button>
            )}
          </div>

          <div className='flex items-center gap-4'>
            {!isCompanyMode ? (
              <Box display='flex' flexDirection='column' gap={0.5} alignItems='flex-end'>
                <Typography variant='body2' fontWeight={600}>
                  TOTAL COMISION APP{' '}
                  <Typography component='span' color='primary.main' fontWeight={600}>
                    {formatCurrency(totalCommissionApp)}
                  </Typography>
                </Typography>
                <Typography variant='body2' fontWeight={600}>
                  TOTAL PLATAFORMA{' '}
                  <Typography component='span' color='warning.main' fontWeight={600}>
                    {formatCurrency(totalPlatform)}
                  </Typography>
                </Typography>
                <Typography variant='body2' fontWeight={600}>
                  TOTAL SALDO{' '}
                  <Typography component='span' color='success.main' fontWeight={600}>
                    {formatCurrency(totalSaldo)}
                  </Typography>
                </Typography>
              </Box>
            ) : (
              <Typography variant='body2' fontWeight={600}>
                TOTAL PLATAFORMA{' '}
                <Typography component='span' color='primary.main' fontWeight={600}>
                  {formatCurrency(totalPlatform)}
                </Typography>
              </Typography>
            )}

            {!isCompanyMode && (
              <Button
                variant='contained'
                color='primary'
                startIcon={<i className='tabler-chart-bar' />}
                disabled={(meta?.total || 0) === 0}
                onClick={() => setChartModalOpen(true)}
              >
                Gráfico
              </Button>
            )}

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
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    const align = (header.column.columnDef.meta as { align?: string })?.align || 'left'

                    return (
                      <th key={header.id} style={{ textAlign: align as 'left' | 'center' | 'right' }}>
                        {header.isPlaceholder ? null : (
                          <div
                            className={classnames({
                              'flex items-center': header.column.getIsSorted(),
                              'cursor-pointer select-none': header.column.getCanSort(),
                              'justify-center': align === 'center',
                              'justify-end': align === 'right'
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
                    )
                  })}
                </tr>
              ))}
            </thead>

            {commissions.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-8'>
                    <Typography>No hay datos de comisiones disponibles</Typography>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => {
                      const align = (cell.column.columnDef.meta as { align?: string })?.align || 'left'

                      return (
                        <td key={cell.id} style={{ textAlign: align as 'left' | 'center' | 'right' }}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
          <Typography color='text.disabled'>
            {(meta?.total || 0) > 0
              ? `Mostrando ${(currentPage - 1) * pageSize + 1} a ${Math.min(currentPage * pageSize, meta?.total || 0)} de ${meta?.total || 0} comisiones`
              : 'Sin datos'}
          </Typography>
          <Pagination
            shape='rounded'
            color='primary'
            variant='tonal'
            count={meta?.lastPage || 1}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            showFirstButton
            showLastButton
          />
        </div>
      </Card>

      <CommissionsChartModal
        open={chartModalOpen}
        onClose={() => setChartModalOpen(false)}
        data={commissions || []}
        totals={totals}
        isCompanyAdmin={isCompanyMode}
      />
    </>
  )
}

export default VentasTable
