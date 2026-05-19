'use client'

import { useState, useMemo, useRef, useCallback } from 'react'

import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import Pagination from '@mui/material/Pagination'
import Tooltip from '@mui/material/Tooltip'
import Avatar from '@mui/material/Avatar'
import classnames from 'classnames'
import { flexRender, getCoreRowModel, useReactTable, getSortedRowModel } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

import { useCommissions, useUpdateCommission } from '@/hooks/useCommissions'
import type { Commission } from '@/types/api/commissions'
import CustomTextField from '@core/components/mui/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import tableStyles from '@core/styles/table.module.css'
import UpdateCommissionDialog from '@/views/Dashboard/comisiones/components/UpdateCommissionDialog'
import CommissionsChartModal from '@/views/Dashboard/comisiones/components/CommissionsChartModal'
import ViewVoucherModal from '@/views/Dashboard/comisiones/components/ViewVoucherModal'
import { useAuth } from '@/contexts/AuthContext'
import { useSnackbar } from '@/contexts/SnackbarContext'
import { useUploadImage } from '@/hooks/useUploadImage'

const formatCurrency = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value

  return `Bs. ${num.toFixed(2)}`
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)

  return date.toLocaleString('es-BO', {
    timeZone: 'America/La_Paz',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPeriodKey = (periodKey: string) => {
  const [year, month] = periodKey.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)

  return date.toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'long'
  })
}

const VentasTable = () => {
  const { isCompanyAdmin } = useAuth()
  const { showSuccess, showError } = useSnackbar()
  const updateMutation = useUpdateCommission()
  const uploadImageMutation = useUploadImage()
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [pageSize, setPageSize] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [isPaidFilter, setIsPaidFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('')

  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [chartModalOpen, setChartModalOpen] = useState<boolean>(false)
  const [voucherModalOpen, setVoucherModalOpen] = useState<boolean>(false)
  const [selectedVoucher, setSelectedVoucher] = useState<{ url: string; companyName: string } | null>(null)

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setSearchTerm(value)

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    if (value.length >= 3 || value.length === 0) {
      debounceTimeoutRef.current = setTimeout(() => {
        setDebouncedSearchTerm(value)
      }, 500)
    } else if (value.length < 3 && value.length > 0) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  const filters = useMemo(() => {
    return {
      isPaid: isPaidFilter === 'all' ? undefined : isPaidFilter === 'paid',
      startDate: startDate ? startDate.toISOString().split('T')[0] : undefined,
      endDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
      search: debouncedSearchTerm || undefined
    }
  }, [isPaidFilter, startDate, endDate, debouncedSearchTerm])

  const { data: commissions, isLoading, error, totals } = useCommissions(filters)

  const paginatedData = useMemo(() => {
    return commissions?.slice((currentPage - 1) * pageSize, currentPage * pageSize) || []
  }, [commissions, currentPage, pageSize])

  const totalRecords = commissions?.length || 0
  const totalPages = Math.ceil(totalRecords / pageSize)

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

  const handleUpdateCommission = async (
    paidAmount: string,
    voucherFile: File | null,
    paidAt: string,
    existingVoucher: string | null
  ) => {
    if (!selectedCommission) return

    try {
      const formattedAmount = parseFloat(paidAmount).toFixed(2)
      let voucherUrl = existingVoucher || ''

      if (voucherFile) {
        try {
          voucherUrl = await uploadImageMutation.mutateAsync(voucherFile)
        } catch (error) {
          showError('Error al subir el comprobante. Por favor, intente nuevamente.')

          return
        }
      }

      const paidAtISO = paidAt ? new Date(paidAt).toISOString() : new Date().toISOString()

      await updateMutation.mutateAsync({
        id: selectedCommission.id,
        payload: {
          paid: formattedAmount,
          voucherUrl: voucherUrl,
          paidAt: paidAtISO
        }
      })

      setDialogOpen(false)
      setSelectedCommission(null)
      showSuccess('Comisión actualizada exitosamente')
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Error al actualizar la comisión. Por favor intenta nuevamente.')
    }
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedCommission(null)
  }

  const columns = useMemo<ColumnDef<Commission, any>[]>(() => {
    const baseColumns: ColumnDef<Commission, any>[] = [
      {
        id: 'nro',
        header: 'NRO',
        cell: ({ row }) => (
          <Typography variant='body2' fontWeight={500}>
            {(currentPage - 1) * pageSize + row.index + 1}
          </Typography>
        )
      },
      {
        accessorKey: 'period_key',
        header: 'CUOTA CORRESPONDIENTE',
        cell: ({ row }) => (
          <Typography variant='body2' fontWeight={500}>
            {formatPeriodKey(row.original.period_key)}
          </Typography>
        )
      }
    ]

    if (!isCompanyAdmin) {
      baseColumns.push(
        {
          id: 'logo',
          header: 'LOGO',
          cell: ({ row }) => {
            const logoUrl = row.original.company.logo.startsWith('http')
              ? row.original.company.logo
              : `${process.env.NEXT_PUBLIC_API_URL}${row.original.company.logo}`

            return (
              <Avatar src={logoUrl} alt={row.original.company.name} sx={{ width: 38, height: 38 }}>
                {row.original.company.name.charAt(0)}
              </Avatar>
            )
          }
        },
        {
          accessorKey: 'company.name',
          header: 'EMPRESA',
          cell: ({ row }) => (
            <Typography fontWeight={500} color='text.primary'>
              {row.original.company.name}
            </Typography>
          )
        }
      )
    }

    baseColumns.push(
      {
        accessorKey: 'commission_per_ticket_at_time',
        header: 'COMISIÓN EMPRESA',
        cell: ({ row }: any) => (
          <Typography variant='body2' align='right'>
            {formatCurrency(row.original.commission_per_ticket_at_time)}
          </Typography>
        )
      },
      {
        accessorKey: 'total_trips_count',
        header: 'CANTIDAD DE VIAJES',
        cell: ({ row }) => (
          <Typography variant='body2' align='center'>
            {row.original.total_trips_count || 0}
          </Typography>
        )
      },
      {
        accessorKey: 'tickets_app_count_total',
        header: 'CANT. VENTAS APP',
        cell: ({ row }) => (
          <Typography variant='body2' align='center'>
            {row.original.tickets_app_count_total}
          </Typography>
        )
      },
      {
        accessorKey: 'commission_app_total',
        header: 'COMISIÓN APP CALCULADA',
        cell: ({ row }) => (
          <Typography variant='body2' align='right'>
            {formatCurrency(row.original.commission_app_total)}
          </Typography>
        )
      },
      {
        accessorKey: 'net_to_company',
        header: isCompanyAdmin ? 'TOTAL A COBRAR' : 'TOTAL A PAGAR',
        cell: ({ row }) => (
          <Typography variant='body2' fontWeight={600} color='primary' align='right'>
            {formatCurrency(row.original.net_to_company)}
          </Typography>
        )
      },
      {
        accessorKey: 'paidAt',
        header: 'FECHA PAGO',
        cell: ({ row }) => {
          if (!row.original.paidAt) {
            return (
              <Typography variant='body2' align='center' color='text.secondary'>
                -
              </Typography>
            )
          }

          return (
            <Typography variant='body2' align='center'>
              {formatDateTime(row.original.paidAt)}
            </Typography>
          )
        }
      },
      {
        accessorKey: 'paid',
        header: 'PAGADO',
        cell: ({ row }) => (
          <Typography variant='body2' align='right' fontWeight={600}>
            {formatCurrency(row.original.paid)}
          </Typography>
        )
      }
    )

    if (!isCompanyAdmin) {
      baseColumns.push({
        id: 'actions',
        header: 'COMPROBANTE',
        cell: ({ row }) => {
          const hasVoucher = !!row.original.voucher

          return (
            <Box display='flex' gap={1} justifyContent='center'>
              {hasVoucher ? (
                <>
                  <Tooltip title='Ver'>
                    <Button size='small' color='info' variant='text' onClick={() => handleViewVoucher(row.original)}>
                      Ver
                    </Button>
                  </Tooltip>
                  <Tooltip title='Editar'>
                    <Button size='small' color='primary' variant='text' onClick={() => handleUpdateClick(row.original)}>
                      Editar
                    </Button>
                  </Tooltip>
                </>
              ) : (
                <Tooltip title='Insertar Comprobante'>
                  <Button size='small' color='primary' variant='text' onClick={() => handleUpdateClick(row.original)}>
                    Insertar
                  </Button>
                </Tooltip>
              )}
            </Box>
          )
        }
      })
    }

    return baseColumns
  }, [currentPage, pageSize, isCompanyAdmin])

  const table = useReactTable<Commission>({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
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
          <div className='flex flex-wrap gap-4 items-center'>
            {!isCompanyAdmin && (
              <CustomTextField
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder='Buscar empresa '
                className='min-w-[200px]'
              />
            )}

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
            {!isCompanyAdmin && (
              <Box display='flex' flexDirection='column' gap={0.5}>
                <Typography variant='caption' color='primary.main' fontWeight={600}>
                  Total, App: Bs. {parseFloat(totals.total_app).toFixed(2)}
                </Typography>
                <Typography variant='caption' color='warning.main' fontWeight={600}>
                  Total, Comisión Empresa: Bs. {parseFloat(totals.total_net_to_company).toFixed(2)}
                </Typography>
                <Typography variant='caption' color='success.main' fontWeight={600}>
                  Total, Deuda: Bs. {parseFloat(totals.total_balance).toFixed(2)}
                </Typography>
              </Box>
            )}

            <Button
              variant='contained'
              color='primary'
              startIcon={<i className='tabler-chart-bar' />}
              disabled={totalRecords === 0}
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
                  <td colSpan={columns.length} className='text-center py-8'>
                    <Typography>No hay datos de comisiones disponibles</Typography>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

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
      </Card>

      {selectedCommission && (
        <UpdateCommissionDialog
          open={dialogOpen}
          commission={selectedCommission}
          onClose={handleCloseDialog}
          onSubmit={handleUpdateCommission}
          isLoading={updateMutation.isPending || uploadImageMutation.isPending}
        />
      )}

      <CommissionsChartModal
        open={chartModalOpen}
        onClose={() => setChartModalOpen(false)}
        data={commissions || []}
        isCompanyAdmin={isCompanyAdmin}
      />

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
