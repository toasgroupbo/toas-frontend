'use client'

import { useState, useMemo, useEffect } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  MenuItem,
  Grid,
  TablePagination,
  Pagination,
  Chip
} from '@mui/material'
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getPaginationRowModel
} from '@tanstack/react-table'

import { useTravelsForAdmin } from '@/hooks/useDeposits'
import { usePlaces } from '@/hooks/useLugares'
import type { Travel } from '@/types/api/deposits'
import type { Company } from '@/types/api/company'
import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'
import TransactionDialog from '@/views/Dashboard/depositos/components/TransactionDialog'

interface TravelsModalProps {
  open: boolean
  onClose: () => void
  company: Company
}

const columnHelper = createColumnHelper<Travel>()

const formatCurrency = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value

  return `Bs. ${num.toFixed(2)}`
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const TravelsModal = ({ open, onClose, company }: TravelsModalProps) => {
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [isPaidFilter, setIsPaidFilter] = useState<string>('all')
  const [originPlaceId, setOriginPlaceId] = useState<string>('')
  const [destinationPlaceId, setDestinationPlaceId] = useState<string>('')
  const [selectedTravel, setSelectedTravel] = useState<Travel | null>(null)
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)

  const { data: places } = usePlaces()

  // Build filters - always filter by closed status
  const filters = useMemo(() => {
    return {
      companyId: Number(company.id),
      status: 'closed',
      isPaid: isPaidFilter === 'all' ? undefined : isPaidFilter === 'paid',
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      origin_placeId: originPlaceId ? Number(originPlaceId) : undefined,
      destination_placeId: destinationPlaceId ? Number(destinationPlaceId) : undefined
    }
  }, [company.id, isPaidFilter, startDate, endDate, originPlaceId, destinationPlaceId])

  const { data: travels, isLoading, error } = useTravelsForAdmin(filters)

  const handleOpenTransactionDialog = (travel: Travel) => {
    setSelectedTravel(travel)
    setTransactionDialogOpen(true)
  }

  const handleCloseTransactionDialog = () => {
    setTransactionDialogOpen(false)
    setSelectedTravel(null)
  }

  const columns = useMemo<any[]>(
    () => [
      columnHelper.accessor('bus.plaque', {
        header: 'Bus',
        cell: ({ row }) => (
          <Box>
            <Typography variant='body2' fontWeight={500}>
              {row.original.bus.plaque}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {row.original.bus.name}
            </Typography>
          </Box>
        )
      }),

      columnHelper.accessor('tickets_count', {
        header: 'Tickets',
        cell: ({ row }) => (
          <Box>
            <Typography variant='body2'>Total: {row.original.tickets_count}</Typography>
            <Typography variant='caption' color='text.secondary'>
              App: {row.original.tickets_app_count} | Oficina: {row.original.tickets_office_count}
            </Typography>
          </Box>
        )
      }),
      columnHelper.accessor('app_amount', {
        header: 'Monto App',
        cell: ({ row }) => <Typography variant='body2'>{formatCurrency(row.original.app_amount)}</Typography>
      }),
      columnHelper.accessor('total_commission', {
        header: 'Comisión Total',
        cell: ({ row }) => (
          <Typography variant='body2' color='success.main'>
            {formatCurrency(row.original.total_commission)}
          </Typography>
        )
      }),
      columnHelper.accessor('travel_status', {
        header: 'Estado',
        cell: ({ row }) => (
          <Chip
            label={row.original.travel_status}
            color={
              row.original.travel_status === 'closed'
                ? 'success'
                : row.original.travel_status === 'active'
                  ? 'primary'
                  : 'default'
            }
            size='small'
          />
        )
      }),
      columnHelper.accessor('isPaid', {
        header: 'Pagado',
        cell: ({ row }) => {
          const isPaid = row.original.isPaid
          const transactionStatus = row.original.transaction?.status

          if (!isPaid) {
            return <Chip label='No' color='error' size='small' />
          }

          if (isPaid && transactionStatus === 'COMPLETED') {
            return <Chip label='Sí' color='success' size='small' />
          }

          if (isPaid && (transactionStatus === 'AUTHORIZED' || transactionStatus === 'IN_PROGRESS')) {
            return <Chip label='Pendiente' color='warning' size='small' />
          }

          return <Chip label='Pendiente' color='warning' size='small' />
        }
      }),
      columnHelper.accessor('bus.owner.name', {
        header: 'Propietario / Datos Bancarios',
        cell: ({ row }) => {
          const owner = row.original.bus.owner
          const bankAccount = owner.bankAccount

          return (
            <Box>
              <Typography variant='body2' fontWeight={500}>
                {owner.name}
              </Typography>
              {bankAccount && (
                <>
                  <Typography variant='caption' display='block' color='text.secondary'>
                    CI: {owner.ci} | Tel: {owner.phone}
                  </Typography>
                  <Typography variant='caption' display='block' color='primary.main' sx={{ mt: 0.5 }}>
                    Cuenta: {bankAccount.account}
                  </Typography>

                  <Typography variant='caption' display='block' color='text.secondary'>
                    CI: {bankAccount.documentNumber}
                  </Typography>
                </>
              )}
            </Box>
          )
        }
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
          const isPaid = row.original.isPaid
          const transactionStatus = row.original.transaction?.status

          if (!isPaid) {
            return (
              <Button
                variant='contained'
                size='small'
                color='primary'
                onClick={() => handleOpenTransactionDialog(row.original)}
              >
                Realizar Pago
              </Button>
            )
          }

          if (isPaid && (transactionStatus === 'AUTHORIZED' || transactionStatus === 'IN_PROGRESS')) {
            return (
              <Button
                variant='contained'
                size='small'
                color='info'
                onClick={() => handleOpenTransactionDialog(row.original)}
              >
                Verificar
              </Button>
            )
          }

          if (isPaid && transactionStatus === 'COMPLETED') {
            return null
          }

          return null
        },
        enableSorting: false
      })
    ],
    []
  )

  const table = useReactTable({
    data: travels || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageIndex: currentPage - 1,
        pageSize
      }
    }
  })

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth='xl' fullWidth>
        <DialogTitle>
          <Box display='flex' alignItems='center' justifyContent='space-between'>
            <Box>
              <Typography variant='h5'>Viajes - {company.name}</Typography>
              <Typography variant='body2' color='text.secondary'>
                Listado de viajes para procesar depósitos
              </Typography>
            </Box>
            <IconButton onClick={onClose} size='small'>
              <i className='tabler-x' />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Filters */}
          <Box mb={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <CustomTextField
                  select
                  fullWidth
                  label='Origen'
                  value={originPlaceId}
                  onChange={e => setOriginPlaceId(e.target.value)}
                >
                  <MenuItem value=''>Todos</MenuItem>
                  {places?.map(place => (
                    <MenuItem key={place.id} value={place.id}>
                      {place.name}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <CustomTextField
                  select
                  fullWidth
                  label='Destino'
                  value={destinationPlaceId}
                  onChange={e => setDestinationPlaceId(e.target.value)}
                >
                  <MenuItem value=''>Todos</MenuItem>
                  {places?.map(place => (
                    <MenuItem key={place.id} value={place.id}>
                      {place.name}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <CustomTextField
                  select
                  fullWidth
                  label='Estado de Pago'
                  value={isPaidFilter}
                  onChange={e => setIsPaidFilter(e.target.value)}
                >
                  <MenuItem value='all'>Todos</MenuItem>
                  <MenuItem value='paid'>Pagado</MenuItem>
                  <MenuItem value='pending'>Pendiente</MenuItem>
                </CustomTextField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <CustomTextField
                  type='date'
                  fullWidth
                  label='Fecha Inicio'
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <CustomTextField
                  type='date'
                  fullWidth
                  label='Fecha Fin'
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Table */}
          {isLoading ? (
            <Box display='flex' justifyContent='center' alignItems='center' minHeight='300px'>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity='error'>
              Error al cargar los viajes: {error instanceof Error ? error.message : 'Error desconocido'}
            </Alert>
          ) : (
            <>
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
                                  asc: ' 🔼',
                                  desc: ' 🔽'
                                }[header.column.getIsSorted() as string] ?? null}
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.length === 0 ? (
                      <tr>
                        <td colSpan={columns.length} className='text-center'>
                          <Typography variant='body2' color='text.secondary' py={4}>
                            No hay viajes disponibles
                          </Typography>
                        </td>
                      </tr>
                    ) : (
                      table.getRowModel().rows.map(row => (
                        <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <Box display='flex' justifyContent='space-between' alignItems='center' mt={3}>
                <TablePagination
                  component='div'
                  count={table.getFilteredRowModel().rows.length}
                  page={currentPage - 1}
                  onPageChange={(_, page) => setCurrentPage(page + 1)}
                  rowsPerPage={pageSize}
                  onRowsPerPageChange={e => {
                    setPageSize(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  labelRowsPerPage='Filas por página:'
                />
                <Pagination
                  count={Math.ceil(table.getFilteredRowModel().rows.length / pageSize)}
                  page={currentPage}
                  onChange={(_, page) => setCurrentPage(page)}
                  color='primary'
                  variant='outlined'
                  shape='rounded'
                />
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} variant='outlined'>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {selectedTravel && (
        <TransactionDialog
          open={transactionDialogOpen}
          onClose={handleCloseTransactionDialog}
          travel={selectedTravel}
        />
      )}
    </>
  )
}

export default TravelsModal
