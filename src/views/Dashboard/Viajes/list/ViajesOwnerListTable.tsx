'use client'

import { useEffect, useMemo, useState } from 'react'

import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { Pagination } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'
import { useTravelsForOwner, type TravelFilters } from '@/hooks/useTravels'
import { useOwnerRoutes } from '@/hooks/useCashierTravels'
import type { Travel } from '@/types/api/travels'
import TransactionDetailsModal from '@/views/Dashboard/Viajes/components/TransactionDetailsModal'

type TravelWithActionsType = Travel & {
  actions?: string
}

// Helper to validate complete date format (YYYY-MM-DD = 10 chars)
const isValidDateInput = (date: string) => date === '' || date.length === 10

const columnHelper = createColumnHelper<TravelWithActionsType>()

const ViajesOwnerListTable = () => {
  const [statusFilter, setStatusFilter] = useState<string>('closed')
  const [isPaidFilter, setIsPaidFilter] = useState<string>('pending')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [startDateInput, setStartDateInput] = useState<string>('')
  const [endDateInput, setEndDateInput] = useState<string>('')
  const [originPlaceId, setOriginPlaceId] = useState<string>('all')
  const [destinationPlaceId, setDestinationPlaceId] = useState<string>('all')
  const [selectedTravel, setSelectedTravel] = useState<TravelWithActionsType | null>(null)
  const [transactionModalOpen, setTransactionModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

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

  const { data: ownerRoutes } = useOwnerRoutes()

  const uniqueOrigins = useMemo(() => {
    if (!ownerRoutes || ownerRoutes.length === 0) return []
    const originsMap = new Map<number, { id: number; name: string }>()

    ownerRoutes.forEach((route: any) => {
      const originPlace = route.officeOrigin.place
      const destPlace = route.officeDestination.place

      if (destinationPlaceId && destinationPlaceId !== 'all' && destPlace.id !== Number(destinationPlaceId)) {
        return
      }

      if (!originsMap.has(originPlace.id)) {
        originsMap.set(originPlace.id, { id: originPlace.id, name: originPlace.name })
      }
    })

    return Array.from(originsMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [ownerRoutes, destinationPlaceId])

  const uniqueDestinations = useMemo(() => {
    if (!ownerRoutes || ownerRoutes.length === 0) return []
    const destinationsMap = new Map<number, { id: number; name: string }>()

    ownerRoutes.forEach((route: any) => {
      const originPlace = route.officeOrigin.place
      const destPlace = route.officeDestination.place

      if (originPlaceId && originPlaceId !== 'all' && originPlace.id !== Number(originPlaceId)) {
        return
      }

      if (!destinationsMap.has(destPlace.id)) {
        destinationsMap.set(destPlace.id, { id: destPlace.id, name: destPlace.name })
      }
    })

    return Array.from(destinationsMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [ownerRoutes, originPlaceId])

  const apiFilters = useMemo((): TravelFilters => {
    return {
      status: statusFilter !== 'all' ? (statusFilter as 'active' | 'closed') : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      origin_placeId: originPlaceId && originPlaceId !== 'all' ? Number(originPlaceId) : undefined,
      destination_placeId: destinationPlaceId && destinationPlaceId !== 'all' ? Number(destinationPlaceId) : undefined,
      isPaid: isPaidFilter === 'all' ? undefined : isPaidFilter === 'paid',
      page: currentPage,
      limit: pageSize
    }
  }, [statusFilter, startDate, endDate, originPlaceId, destinationPlaceId, isPaidFilter, currentPage, pageSize])

  const { data: travelsResponse, isLoading, error, refetch, isFetching } = useTravelsForOwner(apiFilters)

  const travels = travelsResponse?.data || []
  const meta = travelsResponse?.meta

  const amounts = (travelsResponse?.amounts || { cash: 0, qr: 0, app: 0, total: 0 }) as { cash: number; qr: number; app: number; total: number }
  const totalQr = amounts.qr + amounts.app
  const totalRealizado = amounts.total

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

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

    return `Bs. ${numAmount.toFixed(2)}`
  }

  const handleViewTransaction = (travel: TravelWithActionsType) => {
    setSelectedTravel(travel)
    setTransactionModalOpen(true)
  }

  const columns = useMemo<ColumnDef<TravelWithActionsType, any>[]>(
    () => [
      columnHelper.display({
        id: 'actions',
        header: 'Ver',
        cell: ({ row }) => {
          const hasTransaction = row.original.transaction?.status === 'COMPLETED'

          return (
            <Tooltip title={hasTransaction ? 'Ver detalles de pago' : 'Sin información de pago'}>
              <span>
                <IconButton
                  size='small'
                  color={hasTransaction ? 'primary' : 'default'}
                  disabled={!hasTransaction}
                  onClick={() => handleViewTransaction(row.original)}
                >
                  <i className='tabler-eye' style={{ fontSize: '20px' }} />
                </IconButton>
              </span>
            </Tooltip>
          )
        }
      }),
      columnHelper.accessor('bus', {
        header: 'Bus',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <i className='tabler-bus' style={{ fontSize: '20px', color: 'var(--mui-palette-primary-main)' }} />
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary' variant='body2'>
                {row.original.bus.name}
              </Typography>
              <Chip label={row.original.bus.plaque} size='small' variant='outlined' />
            </div>
          </div>
        )
      }),
      columnHelper.accessor('route', {
        header: 'Ruta / Salida',
        cell: ({ row }) => {
          const originCity = row.original.route.officeOrigin.place?.name || 'N/A'
          const destinationCity = row.original.route.officeDestination.place?.name || 'N/A'

          return (
            <div className='flex flex-col gap-1'>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'action.hover'
                }}
              >
                <div className='flex items-center gap-1'>
                  <i className='tabler-flag' style={{ fontSize: '16px', color: 'var(--mui-palette-success-main)' }} />
                  <Typography variant='caption' fontWeight='medium'>
                    {originCity}
                  </Typography>
                </div>
                <i className='tabler-arrow-right' style={{ fontSize: '16px' }} />
                <div className='flex items-center gap-1'>
                  <i
                    className='tabler-flag-filled'
                    style={{ fontSize: '16px', color: 'var(--mui-palette-error-main)' }}
                  />
                  <Typography variant='caption' fontWeight='medium'>
                    {destinationCity}
                  </Typography>
                </div>
              </Box>
              <div className='flex items-center gap-1'>
                <i className='tabler-clock' style={{ fontSize: '14px', color: 'var(--mui-palette-info-main)' }} />
                <Typography variant='caption'>{formatDateTime(row.original.departure_time)}</Typography>
              </div>
            </div>
          )
        }
      }),
      columnHelper.display({
        id: 'deposito_qr',
        header: 'Depósito QR',
        cell: ({ row }) => {
          const appAmount = parseFloat((row.original as any).app_amount || '0')
          const qrAmount = parseFloat(row.original.qr_amount || '0')
          const appSoldSeats = (row.original as any).seatsApp || 0
          const qrSoldSeats = (row.original as any).seatsQr || 0

          const totalDepositoQr = appAmount + qrAmount
          const totalSeatsQr = appSoldSeats + qrSoldSeats

          return (
            <div className='flex flex-col'>
              <Typography variant='body2' fontWeight='bold'>
                {totalSeatsQr} asientos
              </Typography>
              <Typography variant='body2' fontWeight='medium' color='info.main'>
                {formatCurrency(totalDepositoQr)}
              </Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('app_amount', {
        header: 'Monto App',
        cell: ({ row }) => {
          const appAmount = parseFloat((row.original as any).app_amount || '0')
          const appSoldSeats = (row.original as any).seatsApp || 0

          return (
            <div className='flex flex-col'>
              <Typography variant='body2' fontWeight='bold'>
                {appSoldSeats} asientos
              </Typography>
              <Typography variant='body2' fontWeight='medium' color='success.main'>
                {formatCurrency(appAmount)}
              </Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('qr_amount', {
        header: 'Monto QR',
        cell: ({ row }) => {
          const qrAmount = parseFloat(row.original.qr_amount || '0')
          const qrSoldSeats = (row.original as any).seatsQr || 0

          return (
            <div className='flex flex-col'>
              <Typography variant='body2' fontWeight='bold'>
                {qrSoldSeats} asientos
              </Typography>
              <Typography variant='body2' fontWeight='medium' color='info.main'>
                {formatCurrency(qrAmount)}
              </Typography>
            </div>
          )
        }
      }),

      columnHelper.accessor('cash_amount', {
        header: 'Monto Efectivo',
        cell: ({ row }) => {
          const cashAmount = parseFloat(row.original.cash_amount || '0')
          const cashSoldSeats = (row.original as any).seatsCash || 0

          return (
            <div className='flex flex-col'>
              <Typography variant='body2' fontWeight='bold'>
                {cashSoldSeats} asientos
              </Typography>
              <Typography variant='body2' fontWeight='medium' color='warning.main'>
                {formatCurrency(cashAmount)}
              </Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('totalSoldSeats', {
        header: 'Monto Total',
        cell: ({ row }) => {
          const totalSoldSeats = (row.original as any).totalSoldSeats || 0
          const totalBusSeats = (row.original as any).totalBusSeats || 0

          const totalSoldAmount =
            parseFloat((row.original as any).app_amount || '0') +
            parseFloat(row.original.qr_amount || '0') +
            parseFloat(row.original.cash_amount || '0')

          return (
            <div className='flex flex-col'>
              <Typography variant='body2' fontWeight='bold'>
                {totalSoldSeats} de {totalBusSeats} asientos
              </Typography>
              <Typography variant='caption' color='primary.main' fontWeight='medium'>
                {formatCurrency(totalSoldAmount)}
              </Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('type', {
        header: 'Tipo',
        cell: ({ row }) => (
          <Chip
            label={row.original.type === 'normal' ? 'Normal' : 'Habilitada'}
            color={row.original.type === 'habilitada' ? 'warning' : 'primary'}
            variant='tonal'
            size='small'
            icon={
              <i
                className={row.original.type === 'habilitada' ? 'tabler-star-filled' : 'tabler-circle-filled'}
                style={{ fontSize: '14px' }}
              />
            }
          />
        )
      }),
      columnHelper.accessor('travel_status', {
        header: 'Estado',
        cell: ({ row }) => {
          const statusMap: Record<string, { label: string; color: 'success' | 'default' | 'error' | 'warning' }> = {
            active: { label: 'Activo', color: 'success' },
            closed: { label: 'Cerrado', color: 'default' },
            cancelled: { label: 'Cancelado', color: 'error' }
          }

          const status = statusMap[row.original.travel_status] || {
            label: row.original.travel_status,
            color: 'default'
          }

          return (
            <Chip
              label={status.label}
              color={status.color}
              variant='tonal'
              size='small'
              icon={
                <i
                  className={row.original.travel_status === 'active' ? 'tabler-check' : 'tabler-x'}
                  style={{ fontSize: '14px' }}
                />
              }
            />
          )
        }
      }),
      columnHelper.accessor('closedAt', {
        header: 'Fecha Cierre',
        cell: ({ row }) => {
          if (!row.original.closedAt) return <Typography variant='caption'>-</Typography>

          const date = new Date(row.original.closedAt)

          const fecha = date.toLocaleDateString('es-BO', {
            timeZone: 'America/La_Paz',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })

          const hora = date.toLocaleTimeString('es-BO', {
            timeZone: 'America/La_Paz',
            hour: '2-digit',
            minute: '2-digit'
          })

          return (
            <div className='flex flex-col items-center'>
              <Typography variant='caption'>{fecha}</Typography>
              <Typography variant='caption'>{hora}</Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('isPaid', {
        header: 'Pagado',
        cell: ({ row }) => (
          <Chip
            label={row.original.isPaid ? 'Sí' : 'No'}
            color={row.original.isPaid ? 'success' : 'warning'}
            size='small'
            variant='tonal'
          />
        )
      })
    ],
    []
  )

  const table = useReactTable({
    data: travels,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: meta?.lastPage ?? 1
  })

  if (isLoading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity='error'>Error al cargar los viajes. Por favor, intenta nuevamente.</Alert>
  }

  const totalRows = meta?.total ?? 0
  const totalPages = meta?.lastPage ?? 1

  return (
    <Box>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <div className='flex flex-col gap-2'>
            <Typography variant='h4'>Viajes de mis Buses y Reporte de Depósitos</Typography>
            <Typography variant='body2' color='text.secondary'>
              Vista de solo lectura de los viajes asignados a tus buses
            </Typography>
          </div>
        </div>

        <div className='flex flex-wrap gap-4 px-6 pb-4 items-center'>
          <CustomTextField
            select
            label='Origen'
            value={originPlaceId}
            onChange={e => {
              setOriginPlaceId(e.target.value)
              setCurrentPage(1)
            }}
            size='small'
            sx={{ minWidth: 180 }}
          >
            <MenuItem value='all'>Todos</MenuItem>
            {uniqueOrigins.map(place => (
              <MenuItem key={place.id} value={place.id.toString()}>
                {place.name}
              </MenuItem>
            ))}
          </CustomTextField>

          <i className='tabler-arrow-right' style={{ fontSize: '20px', color: 'var(--mui-palette-text-secondary)' }} />

          <CustomTextField
            select
            label='Destino'
            value={destinationPlaceId}
            onChange={e => {
              setDestinationPlaceId(e.target.value)
              setCurrentPage(1)
            }}
            size='small'
            sx={{ minWidth: 180 }}
          >
            <MenuItem value='all'>Todos</MenuItem>
            {uniqueDestinations.map(place => (
              <MenuItem key={place.id} value={place.id.toString()}>
                {place.name}
              </MenuItem>
            ))}
          </CustomTextField>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <CustomTextField
              type='date'
              label='Fecha Inicio'
              value={startDateInput}
              onChange={e => setStartDateInput(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size='small'
              sx={{ width: '150px' }}
            />
            <Typography variant='body2' color='text.secondary'>
              a
            </Typography>
            <CustomTextField
              type='date'
              label='Fecha Fin'
              value={endDateInput}
              onChange={e => setEndDateInput(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size='small'
              sx={{ width: '150px' }}
            />
          </Box>

          <CustomTextField
            select
            label='Estado'
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            size='small'
            sx={{ minWidth: 120 }}
          >
            <MenuItem value='all'>Todos</MenuItem>
            <MenuItem value='active'>Activo</MenuItem>
            <MenuItem value='closed'>Cerrado</MenuItem>
          </CustomTextField>
          <CustomTextField
            select
            label='Pagado'
            value={isPaidFilter}
            onChange={e => {
              setIsPaidFilter(e.target.value)
              setCurrentPage(1)
            }}
            size='small'
            sx={{ minWidth: 120 }}
          >
            <MenuItem value='all'>Todos</MenuItem>
            <MenuItem value='paid'>Pagado</MenuItem>
            <MenuItem value='pending'>Pendiente</MenuItem>
          </CustomTextField>

          <Button
            variant='outlined'
            color='primary'
            onClick={() => refetch()}
            disabled={isFetching}
            startIcon={
              isFetching ? (
                <CircularProgress size={16} color='inherit' />
              ) : (
                <i className='tabler-refresh' />
              )
            }
            sx={{ whiteSpace: 'nowrap' }}
          >
            {isFetching ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>

        <div className='flex flex-wrap justify-between gap-4 px-6 pb-6'>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box
              sx={{
                bgcolor: 'info.lighter',
                px: 3,
                py: 1.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'info.main',
                minWidth: '180px',
                textAlign: 'center'
              }}
            >
              <Typography variant='caption' color='info.main' fontWeight='medium'>
                Total Depósito QR
              </Typography>
              <Typography variant='h6' color='info.dark' fontWeight='bold'>
                {formatCurrency(totalQr)}
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: 'success.lighter',
                px: 3,
                py: 1.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'success.main',
                minWidth: '180px',
                textAlign: 'center'
              }}
            >
              <Typography variant='caption' color='success.main' fontWeight='medium'>
                Total Realizado
              </Typography>
              <Typography variant='h6' color='success.dark' fontWeight='bold'>
                {formatCurrency(totalRealizado)}
              </Typography>
            </Box>
          </Box>

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

            {table.getRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-8'>
                    <Typography>No hay viajes disponibles</Typography>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map(row => {
                  const isDisabled = !row.original.enabled

                  return (
                    <tr
                      key={row.id}
                      style={{
                        opacity: isDisabled ? 0.5 : 1,
                        backgroundColor: isDisabled ? 'var(--mui-palette-action-disabledBackground)' : undefined
                      }}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            )}
          </table>
        </div>

        <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
          <Typography color='text.disabled'>
            {totalRows > 0
              ? `Mostrando ${(currentPage - 1) * pageSize + 1} a ${Math.min(currentPage * pageSize, totalRows)} de ${totalRows} viajes`
              : 'No hay viajes'}
          </Typography>
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
        </div>
      </Card>

      <TransactionDetailsModal
        open={transactionModalOpen}
        onClose={() => {
          setTransactionModalOpen(false)
          setSelectedTravel(null)
        }}
        travel={selectedTravel as any}
      />
    </Box>
  )
}

export default ViajesOwnerListTable
