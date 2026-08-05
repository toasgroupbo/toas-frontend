'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'

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
  Pagination,
  Chip
} from '@mui/material'
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel
} from '@tanstack/react-table'

import { useTransactionTravels } from '@/hooks/useDeposits'
import { usePlaces } from '@/hooks/useLugares'
import type { Travel, CompanyWithDebt } from '@/types/api/deposits'
import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'
import TransactionDialog from '@/views/Dashboard/depositos/components/TransactionDialog'
import PaymentDetailsDialog from '@/views/Dashboard/depositos/components/PaymentDetailsDialog'

interface TravelsModalProps {
  open: boolean
  onClose: () => void
  company: CompanyWithDebt
}

const columnHelper = createColumnHelper<Travel>()

const formatCurrency = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value

  return `Bs. ${num.toFixed(2)}`
}

const formatDateToBolivia = (dateString: string) => {
  const date = new Date(dateString)

  return new Intl.DateTimeFormat('es-BO', {
    timeZone: 'America/La_Paz',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const getBankName = (bankCode: string) => {
  const banks: { [key: string]: string } = {
    '1005': 'Banco de Crédito',
    '1016': 'Banco Económico',
    '1034': 'Banco Fortaleza',
    '1018': 'Banco Ganadero',
    '1033': 'Banco FIE',
    '1009': 'Banco BISA',
    '1003': 'Banco Mercantil Santa Cruz',
    '1007': 'Banco de la Nación Argentina',
    '1001': 'Banco Nacional de Bolivia',
    '1017': 'Banco Solidario',
    '1014': 'Banco Unión',
    MLD3022: 'Cooperativa Comarapa',
    MLD3030: 'Cooperativa Catedral',
    MLD3026: 'El Chorolque',
    '3003': 'Cooperativa Factima',
    MLD3012: 'Cooperativa Inca Huasi',
    '3001': 'Cooperativa Jesús Nazareno',
    MLD3048: 'Cooperativa Magisterio',
    MLD3028: 'Cooperativa Madre y Maestra',
    MLD3034: 'Cooperativa Abierta',
    MLD3011: 'Cooperativa Pío X',
    '3015': 'Cooperativa Quillacollo',
    '3002': 'Cooperativa San Martín de Porres',
    '3025': 'Cooperativa San Mateo',
    MLD3021: 'Cooperativa Trinidad',
    '27002': 'CIDRE',
    '27003': 'Creser',
    '27004': 'Diaconía',
    '27009': 'IDEPRO',
    '27012': 'Pro Mujer',
    MLD1016: 'Banco Económico MLD',
    MLD1034: 'Banco Fortaleza MLD',
    MLD1018: 'Banco Ganadero MLD',
    MLD1033: 'Banco FIE MLD',
    MLD1001: 'Banco Nacional de Bolivia MLD',
    MLD1017: 'Banco Solidario MLD',
    MLD1014: 'Banco Unión MLD',
    '53001': 'Tigo Money',
    '74003': 'Banco Pyme de la Comunidad',
    '74002': 'Banco Pyme Ecofuturo',
    UNI3025: 'Cooperativa San Mateo UNI',
    UNI27009: 'IDEPRO UNI',
    UNI27012: 'Pro Mujer UNI',
    MLD75001: 'La Primera EFV',
    '75003': 'La Promotora EFV'
  }

  return banks[bankCode] || bankCode || 'N/A'
}

const TravelsModal = ({ open, onClose, company }: TravelsModalProps) => {
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [isPaidFilter, setIsPaidFilter] = useState<string>('pending')
  const [originPlaceId, setOriginPlaceId] = useState<string>('all')
  const [destinationPlaceId, setDestinationPlaceId] = useState<string>('all')
  const [selectedTravel, setSelectedTravel] = useState<Travel | null>(null)
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)
  const [paymentDetailsDialogOpen, setPaymentDetailsDialogOpen] = useState(false)
  const [paymentDetailsTravel, setPaymentDetailsTravel] = useState<Travel | null>(null)

  // Ref to track initial mount
  const isInitialMount = useRef(true)

  const { data: places } = usePlaces()

  // Resetear página cuando cambian los filtros (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false

      return
    }

    setCurrentPage(1)
  }, [isPaidFilter, startDate, endDate, originPlaceId, destinationPlaceId, pageSize])

  const filters = useMemo(() => {
    return {
      companyId: Number(company.id),
      status: 'closed',
      isPaid: isPaidFilter === 'all' ? undefined : isPaidFilter === 'paid',
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      origin_placeId: originPlaceId && originPlaceId !== 'all' ? Number(originPlaceId) : undefined,
      destination_placeId: destinationPlaceId && destinationPlaceId !== 'all' ? Number(destinationPlaceId) : undefined,
      page: currentPage,
      limit: pageSize
    }
  }, [company.id, isPaidFilter, startDate, endDate, originPlaceId, destinationPlaceId, currentPage, pageSize])

  const { data: travels, isLoading, error, meta } = useTransactionTravels(filters)

  // Usar datos directamente del servidor (ya vienen paginados)
  const paginatedData = travels

  const totalRecords = meta?.total ?? 0
  const totalPages = meta?.lastPage ?? 1

  const handleOpenTransactionDialog = (travel: Travel) => {
    setSelectedTravel(travel)
    setTransactionDialogOpen(true)
  }

  const handleCloseTransactionDialog = () => {
    setTransactionDialogOpen(false)
    setSelectedTravel(null)
  }

  const handleOpenPaymentDetailsDialog = useCallback((travel: Travel) => {
    setPaymentDetailsTravel(travel)
    setPaymentDetailsDialogOpen(true)
  }, [])

  const handleClosePaymentDetailsDialog = useCallback(() => {
    setPaymentDetailsDialogOpen(false)
    setPaymentDetailsTravel(null)
  }, [])

  const columns = useMemo<any[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }: any) => <Typography variant='body2'>{row.original.id}</Typography>
      },
      {
        accessorKey: 'bus.plaque',
        header: 'Bus/Placa',
        cell: ({ row }: any) => (
          <Box>
            <Typography variant='body2' fontWeight={500}>
              {row.original.bus.plaque}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {row.original.bus.name}
            </Typography>
          </Box>
        )
      },
      {
        accessorKey: 'departure_time',
        header: 'Fecha y Hora de Salida',
        cell: ({ row }: any) => (
          <Typography variant='body2'>{formatDateToBolivia(row.original.departure_time)}</Typography>
        )
      },
      {
        accessorKey: 'total',
        header: 'Venta Total',
        cell: ({ row }: any) => (
          <Typography variant='body2' fontWeight={500} color='primary.main'>
            {formatCurrency(row.original.total)}
          </Typography>
        )
      },
      {
        accessorKey: 'qr_amount',
        header: 'Venta QR',
        cell: ({ row }: any) => <Typography variant='body2'>{formatCurrency(row.original.qr_amount)}</Typography>
      },
      {
        accessorKey: 'cash_amount',
        header: 'Venta Efectivo',
        cell: ({ row }: any) => <Typography variant='body2'>{formatCurrency(row.original.cash_amount)}</Typography>
      },
      {
        accessorKey: 'app_amount',
        header: 'Venta App',
        cell: ({ row }: any) => <Typography variant='body2'>{formatCurrency(row.original.app_amount)}</Typography>
      },
      {
        accessorKey: 'isPaid',
        header: 'Pagado',
        cell: ({ row }: any) => {
          const isPaid = row.original.isPaid
          const transactionStatus = row.original.transaction?.status

          if (!isPaid) {
            return <Chip label='No' color='error' size='small' />
          }

          if (isPaid && transactionStatus === 'COMPLETED') {
            return <Chip label='Sí' color='success' size='small' />
          }

          if (isPaid && transactionStatus === 'AUTHORIZED') {
            return <Chip label='Autorizado' color='warning' size='small' />
          }

          if (isPaid && transactionStatus === 'IN_PROGRESS') {
            return <Chip label='En Proceso' color='info' size='small' />
          }

          return <Chip label='Pendiente' color='warning' size='small' />
        }
      },
      {
        accessorKey: 'net_to_company',
        header: 'Monto a Pagar',
        cell: ({ row }: any) => (
          <Typography variant='body2' fontWeight={600} color='success.main'>
            {formatCurrency(row.original.net_to_company)}
          </Typography>
        )
      },
      {
        accessorKey: 'bus.owner.name',
        header: 'Titular',
        cell: ({ row }: any) => {
          const owner = row.original.bus.owner
          const bankAccount = owner.bankAccount

          return <Typography variant='body2'>{bankAccount?.titularName || owner.name || 'N/A'}</Typography>
        }
      },
      {
        accessorKey: 'bus.owner.bankAccount',
        header: 'Banco/Nro Cuenta',
        cell: ({ row }: any) => {
          const bankAccount = row.original.bus.owner?.bankAccount

          if (!bankAccount) {
            return (
              <Typography variant='body2' color='text.secondary'>
                N/A
              </Typography>
            )
          }

          const bankName = getBankName(bankAccount.bankCode)

          return (
            <Box>
              <Typography variant='body2' fontWeight={500}>
                {bankName}
              </Typography>
              <Typography variant='caption' color='text.secondary' fontFamily='monospace'>
                {bankAccount.account}
              </Typography>
            </Box>
          )
        }
      },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }: any) => {
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
            return (
              <Button
                variant='outlined'
                size='small'
                color='success'
                startIcon={<i className='tabler-eye' />}
                onClick={() => handleOpenPaymentDetailsDialog(row.original)}
              >
                Ver
              </Button>
            )
          }

          return null
        },
        enableSorting: false
      }
    ],
    [handleOpenPaymentDetailsDialog]
  )

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true
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
                  <MenuItem value='all'>Todos</MenuItem>
                  {places?.slice().sort((a, b) => a.name.localeCompare(b.name)).map(place => (
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
                  <MenuItem value='all'>Todos</MenuItem>
                  {places?.slice().sort((a, b) => a.name.localeCompare(b.name)).map(place => (
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

              <div className='flex justify-between items-center flex-wrap mt-3 gap-2'>
                <Typography color='text.disabled'>
                  {totalRecords > 0
                    ? `Mostrando ${(currentPage - 1) * pageSize + 1} a ${Math.min(currentPage * pageSize, totalRecords)} de ${totalRecords} viajes`
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

      {paymentDetailsTravel && (
        <PaymentDetailsDialog
          open={paymentDetailsDialogOpen}
          onClose={handleClosePaymentDetailsDialog}
          travel={paymentDetailsTravel}
        />
      )}
    </>
  )
}

export default TravelsModal
