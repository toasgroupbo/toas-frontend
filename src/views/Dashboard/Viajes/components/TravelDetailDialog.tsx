'use client'

import { useState } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'

import Tooltip from '@mui/material/Tooltip'

import type { Travel } from '@/types/api/travels'
import { useTicketsByTravelAndCompany, useTicketsByTravel, type CashierSummary } from '@/hooks/useTickets'
import { printTravelReport } from '../utils/printTravelReport'
import { printTravelReportThermal } from '@/utils/thermal/printReportThermal'
import { useThermalPrinter } from '@/hooks/useThermalPrinter'
import { useAuth } from '@/contexts/AuthContext'
import { useApproveTravel, useRejectTravel } from '@/hooks/useTravelApproval'
import { usePermissions } from '@/hooks/usePermissions'
import { useSnackbar } from '@/contexts/SnackbarContext'

interface TravelDetailDialogProps {
  open: boolean
  onClose: () => void
  travel: Travel | null
  companyName?: string
  isCashier?: boolean
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)

  return date.toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/La_Paz'
  })
}

const formatTime = (dateString: string): string => {
  const date = new Date(dateString)

  return date.toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/La_Paz'
  })
}

const formatCurrency = (amount: number | string) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  return `Bs. ${numAmount.toFixed(2)}`
}

const TravelDetailDialog = ({ open, onClose, travel, companyName, isCashier = false }: TravelDetailDialogProps) => {
  const { userRole } = useAuth()
  const isCashierSeller = userRole === 'CASHIER_SELLER'
  const { hasPermission } = usePermissions()
  const { showSuccess, showError } = useSnackbar()
  const { isSupported: isThermalSupported, isPrinting, print: thermalPrint, error: thermalError } = useThermalPrinter()

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const approveMutation = useApproveTravel()
  const rejectMutation = useRejectTravel()

  const canApprove = hasPermission('TRAVEL', 'APPROVE')
  const isPendingApproval = travel?.travel_status === 'pending_approval'
  const isRejected = travel?.travel_status === 'rejected'
  const departureTimePassed = travel ? new Date(travel.departure_time) < new Date() : false

  const handleApprove = async () => {
    if (!travel) return

    try {
      await approveMutation.mutateAsync(travel.id)
      showSuccess('Viaje aprobado correctamente')
      onClose()
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Error al aprobar el viaje'

      showError(message)
    }
  }

  const handleReject = async () => {
    if (!travel) return

    try {
      await rejectMutation.mutateAsync({
        travelId: travel.id,
        rejection_reason: rejectionReason || undefined
      })
      showSuccess('Viaje rechazado')
      setRejectDialogOpen(false)
      setRejectionReason('')
      onClose()
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Error al rechazar el viaje'

      showError(message)
    }
  }

  const cashierTicketsQuery = useTicketsByTravel(isCashier ? travel?.id || null : null)
  const companyTicketsQuery = useTicketsByTravelAndCompany(!isCashier ? travel?.id || null : null)

  const { data: cashierData, isLoading: cashierLoading } = cashierTicketsQuery
  const { data: companyData, isLoading: companyLoading } = companyTicketsQuery

  const ticketsLoading = isCashier ? cashierLoading : companyLoading
  const ticketsData = isCashier ? cashierData : companyData
  const tickets = ticketsData?.tickets
  const allCashiers: CashierSummary[] = ticketsData?.cashiers || []
  const currentCashier = ticketsData?.currentCashier

  // For CASHIER_SELLER, only show their own sales using currentCashier from API
  const cashiers: CashierSummary[] =
    isCashierSeller && currentCashier
      ? [
          {
            id: currentCashier.cashier.id,
            email: currentCashier.cashier.email,
            fullName: currentCashier.cashier.fullName,
            ci: currentCashier.cashier.ci,
            phone: currentCashier.cashier.phone,
            createdAt: currentCashier.cashier.createdAt,
            cashTotal: currentCashier.cashTotal,
            qrTotal: currentCashier.qrTotal
          }
        ]
      : allCashiers

  const totals = ticketsData?.totals || null

  if (!travel) return null

  const origin = travel.route?.officeOrigin?.place?.name || 'N/A'
  const destination = travel.route?.officeDestination?.place?.name || 'N/A'
  const originOffice = travel.route?.officeOrigin?.name || ''
  const destinationOffice = travel.route?.officeDestination?.name || ''

  const busName = travel.bus?.name || 'N/A'
  const busPlaque = travel.bus?.plaque || 'N/A'
  const totalSeats = (travel as any).totalBusSeats || 0
  const soldSeats = (travel as any).totalSoldSeats || 0
  const availableSeats = (travel as any).seatsAvailable || totalSeats - soldSeats

  const appQrAmount = parseFloat(travel.app_amount || '0')

  // For CASHIER_SELLER, use currentCashier totals from API
  let totalCash: number
  let totalQr: number

  if (isCashierSeller && currentCashier) {
    totalCash = parseFloat(currentCashier.cashTotal || '0')
    totalQr = parseFloat(currentCashier.qrTotal || '0')
  } else {
    totalCash = totals ? parseFloat(totals.totalCash) : parseFloat(travel.cash_amount || '0')
    totalQr = totals ? parseFloat(totals.totalQr) : parseFloat(travel.qr_amount || '0')
  }

  const totalGeneral = totalCash + totalQr

  const drivers = travel.drivers || []
  const assistants = travel.assistants || []

  const isClosed = travel.travel_status === 'closed'
  const isCancelled = travel.travel_status === 'cancelled'

  const allPassengers: { seatNumber: string; deck: number; name: string; ci: string }[] = []

  tickets
    ?.filter(ticket => ticket.status !== 'cancelled')
    .forEach(ticket => {
      const seats = ticket.travelSeats?.length > 0 ? ticket.travelSeats : ticket.seats

      seats?.forEach(seat => {
        const seatAny = seat as any

        allPassengers.push({
          seatNumber: seat.seatNumber,
          deck: seatAny.deck || 1,
          name:
            seatAny.passenger?.name ||
            ticket.billingSnapshot?.nombre ||
            ticket.billing?.nombre ||
            ticket.buyer?.name ||
            'N/A',
          ci: seatAny.passenger?.ci || ticket.billingSnapshot?.ci || ticket.billing?.ci || ticket.buyer?.ci || 'N/A'
        })
      })
    })

  allPassengers.sort((a, b) => parseInt(a.seatNumber) - parseInt(b.seatNumber))

  const handlePrint = () => {
    printTravelReport({
      travel,
      tickets: tickets || [],
      companyName,
      cashiers,
      totals: totals || undefined
    })
  }

  const handleThermalPrint = async () => {
    const success = await thermalPrint(() =>
      printTravelReportThermal({
        travel,
        tickets: tickets || [],
        companyName,
        cashiers,
        totals: totals || undefined
      })
    )

    if (success) {
      showSuccess('Reporte impreso correctamente')
    } else if (thermalError) {
      showError(thermalError)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'closed':
        return 'default'
      case 'cancelled':
        return 'error'
      case 'pending_approval':
        return 'warning'
      case 'rejected':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo'
      case 'closed':
        return 'Cerrado'
      case 'cancelled':
        return 'Cancelado'
      case 'pending_approval':
        return 'Pendiente de aprobación'
      case 'rejected':
        return 'Rechazado'
      default:
        return status
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Box display='flex' alignItems='center' gap={2}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className='tabler-bus' style={{ fontSize: '28px', color: 'white' }} />
            </Box>
            <Box>
              <Typography variant='h5' fontWeight={600}>
                Reporte de Viaje #{travel.id}
              </Typography>
              <Box display='flex' alignItems='center' gap={1}>
                <Chip
                  label={getStatusLabel(travel.travel_status)}
                  size='small'
                  color={getStatusColor(travel.travel_status) as any}
                  variant='tonal'
                />
                {travel.type === 'habilitada' && (
                  <Chip
                    label='Habilitada'
                    size='small'
                    color='warning'
                    variant='tonal'
                    icon={<i className='tabler-star-filled' style={{ fontSize: '12px' }} />}
                  />
                )}
              </Box>
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <i className='tabler-x' style={{ fontSize: '20px' }} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Route Info */}
        <Card variant='outlined' sx={{ mb: 3, bgcolor: 'action.hover' }}>
          <CardContent>
            <Box display='flex' alignItems='center' justifyContent='center' gap={2} mb={2}>
              <Box textAlign='center'>
                <Typography variant='caption' color='text.secondary'>
                  ORIGEN
                </Typography>
                <Typography variant='h6' fontWeight={600}>
                  {origin}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {originOffice}
                </Typography>
              </Box>
              <i
                className='tabler-arrow-right'
                style={{ fontSize: '32px', color: 'var(--mui-palette-primary-main)' }}
              />
              <Box textAlign='center'>
                <Typography variant='caption' color='text.secondary'>
                  DESTINO
                </Typography>
                <Typography variant='h6' fontWeight={600}>
                  {destination}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {destinationOffice}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box display='flex' justifyContent='space-around'>
              <Box textAlign='center'>
                <Typography variant='caption' color='text.secondary'>
                  FECHA
                </Typography>
                <Typography variant='body1' fontWeight={600}>
                  {formatDate(travel.departure_time)}
                </Typography>
              </Box>
              <Box textAlign='center'>
                <Typography variant='caption' color='text.secondary'>
                  SALIDA
                </Typography>
                <Typography variant='body1' fontWeight={600}>
                  {formatTime(travel.departure_time)}
                </Typography>
              </Box>
              <Box textAlign='center'>
                <Typography variant='caption' color='text.secondary'>
                  LLEGADA
                </Typography>
                <Typography variant='body1' fontWeight={600}>
                  {formatTime(travel.arrival_time)}
                </Typography>
              </Box>
              <Box textAlign='center'>
                <Typography variant='caption' color='text.secondary'>
                  CARRIL
                </Typography>
                <Typography variant='body1' fontWeight={600}>
                  {travel.lane || '-'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Bus Info */}
          <Grid item xs={12} md={6}>
            <Typography
              variant='subtitle1'
              fontWeight={600}
              sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <i className='tabler-bus' style={{ fontSize: '20px' }} />
              Información del Bus
            </Typography>
            <Card variant='outlined'>
              <CardContent>
                <Box display='flex' justifyContent='space-between' mb={1}>
                  <Typography variant='body2' color='text.secondary'>
                    Nombre:
                  </Typography>
                  <Typography variant='body2' fontWeight={600}>
                    {busName}
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='space-between' mb={1}>
                  <Typography variant='body2' color='text.secondary'>
                    Placa:
                  </Typography>
                  <Chip label={busPlaque} size='small' variant='outlined' />
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box display='flex' justifyContent='space-between' mb={1}>
                  <Typography variant='body2' color='text.secondary'>
                    Total Asientos:
                  </Typography>
                  <Typography variant='body2' fontWeight={600}>
                    {totalSeats}
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='space-between' mb={1}>
                  <Typography variant='body2' color='text.secondary'>
                    Vendidos:
                  </Typography>
                  <Chip label={soldSeats} size='small' color='success' variant='tonal' />
                </Box>
                <Box display='flex' justifyContent='space-between'>
                  <Typography variant='body2' color='text.secondary'>
                    Disponibles:
                  </Typography>
                  <Chip label={availableSeats} size='small' color='info' variant='tonal' />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Staff Info */}
          <Grid item xs={12} md={6}>
            <Typography
              variant='subtitle1'
              fontWeight={600}
              sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <i className='tabler-users' style={{ fontSize: '20px' }} />
              Personal
            </Typography>
            <Card variant='outlined'>
              <CardContent>
                <Typography variant='caption' color='text.secondary' fontWeight={600}>
                  CONDUCTORES ({drivers.length})
                </Typography>
                {drivers.length > 0 ? (
                  drivers.map((d: any, i: number) => (
                    <Box key={i} sx={{ py: 0.5, borderBottom: '1px dashed', borderColor: 'divider' }}>
                      <Typography variant='body2' fontWeight={500}>
                        {d.name}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        CI: {d.ci} | Tel: {d.phone}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant='body2' color='text.secondary' fontStyle='italic'>
                    Sin conductores
                  </Typography>
                )}

                <Typography variant='caption' color='text.secondary' fontWeight={600} sx={{ mt: 2, display: 'block' }}>
                  AYUDANTES ({assistants.length})
                </Typography>
                {assistants.length > 0 ? (
                  assistants.map((a: any, i: number) => (
                    <Box key={i} sx={{ py: 0.5, borderBottom: '1px dashed', borderColor: 'divider' }}>
                      <Typography variant='body2' fontWeight={500}>
                        {a.name}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        CI: {a.ci} | Tel: {a.phone}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant='body2' color='text.secondary' fontStyle='italic'>
                    Sin ayudantes
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Sales Summary */}
          <Grid item xs={12}>
            <Typography
              variant='subtitle1'
              fontWeight={600}
              sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <i className='tabler-receipt' style={{ fontSize: '20px' }} />
              Resumen de Ventas
            </Typography>
            <Card variant='outlined'>
              <CardContent>
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Typography variant='caption' color='text.secondary' fontWeight={600}>
                      CAJERO
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant='caption' color='text.secondary' fontWeight={600}>
                      EFECTIVO
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant='caption' color='text.secondary' fontWeight={600}>
                      QR
                    </Typography>
                  </Grid>

                  {!isCashierSeller && (
                    <>
                      <Grid item xs={4}>
                        <Typography variant='body2'>App</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant='body2'>-</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant='body2'>{formatCurrency(appQrAmount)}</Typography>
                      </Grid>
                    </>
                  )}

                  {cashiers.map(cashier => (
                    <Grid container spacing={1} key={cashier.id}>
                      <Grid item xs={4}>
                        <Typography variant='body2'>{cashier.fullName}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant='body2'>{formatCurrency(cashier.cashTotal)}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant='body2'>{formatCurrency(cashier.qrTotal)}</Typography>
                      </Grid>
                    </Grid>
                  ))}
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={4} textAlign='center'>
                    <Typography variant='caption' color='primary.main' fontWeight={600}>
                      TOTAL GENERAL
                    </Typography>
                    <Typography variant='h6' fontWeight='bold' color='primary.main'>
                      {formatCurrency(totalGeneral)}
                    </Typography>
                  </Grid>
                  <Grid item xs={4} textAlign='center'>
                    <Typography variant='caption' color='text.secondary' fontWeight={600}>
                      TOTAL EFECTIVO
                    </Typography>
                    <Typography variant='h6' fontWeight={600}>
                      {formatCurrency(totalCash)}
                    </Typography>
                  </Grid>
                  <Grid item xs={4} textAlign='center'>
                    <Typography variant='caption' color='text.secondary' fontWeight={600}>
                      TOTAL QR
                    </Typography>
                    <Typography variant='h6' fontWeight={600}>
                      {formatCurrency(totalQr)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Passengers */}
          <Grid item xs={12}>
            <Typography
              variant='subtitle1'
              fontWeight={600}
              sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <i className='tabler-users-group' style={{ fontSize: '20px' }} />
              Pasajeros ({allPassengers.length})
            </Typography>
            <Card variant='outlined'>
              <CardContent sx={{ p: 0 }}>
                {ticketsLoading ? (
                  <Box display='flex' justifyContent='center' p={3}>
                    <CircularProgress size={24} />
                  </Box>
                ) : allPassengers.length > 0 ? (
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell align='center' sx={{ fontWeight: 600 }}>
                          Asiento
                        </TableCell>
                        <TableCell align='center' sx={{ fontWeight: 600 }}>
                          Piso
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>CI</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allPassengers.map((p, idx) => (
                        <TableRow key={idx}>
                          <TableCell align='center'>
                            <Chip label={p.seatNumber} size='small' color='primary' variant='outlined' />
                          </TableCell>
                          <TableCell align='center'>{p.deck}</TableCell>
                          <TableCell>{p.name}</TableCell>
                          <TableCell>{p.ci}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Box textAlign='center' py={3}>
                    <i
                      className='tabler-users-minus'
                      style={{ fontSize: '40px', color: 'var(--mui-palette-text-disabled)' }}
                    />
                    <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                      No hay pasajeros registrados
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {isClosed && travel.closedAt && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant='body2' color='text.secondary'>
              <strong>Cerrado el:</strong> {formatDate(travel.closedAt)} a las {formatTime(travel.closedAt)}
            </Typography>
          </Box>
        )}

        {/* Travel approval info */}
        {(travel.createdBy || travel.reviewedBy || isRejected) && (
          <Box sx={{ mt: 2, p: 2, bgcolor: isRejected ? 'error.lighter' : 'action.hover', borderRadius: 1 }}>
            {travel.createdBy && (
              <Typography variant='body2' color='text.secondary'>
                <strong>Creado por:</strong> {travel.createdBy.fullName} ({travel.createdBy.email})
              </Typography>
            )}
            {travel.reviewedBy && travel.reviewedAt && (
              <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                <strong>{isRejected ? 'Rechazado por:' : 'Aprobado por:'}</strong> {travel.reviewedBy.fullName} el{' '}
                {formatDate(travel.reviewedAt)}
              </Typography>
            )}
            {isRejected && travel.rejection_reason && (
              <Typography variant='body2' color='error.main' sx={{ mt: 1 }}>
                <strong>Motivo:</strong> {travel.rejection_reason}
              </Typography>
            )}
            {isPendingApproval && departureTimePassed && (
              <Alert severity='warning' sx={{ mt: 1 }}>
                La hora de salida ya pasó. Este viaje solo puede ser rechazado.
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant='outlined' color='inherit'>
          Cerrar
        </Button>

        {canApprove && isPendingApproval && (
          <>
            <Button
              onClick={() => setRejectDialogOpen(true)}
              variant='outlined'
              color='error'
              startIcon={<i className='tabler-x' />}
              disabled={rejectMutation.isPending}
            >
              Rechazar
            </Button>
            <Button
              onClick={handleApprove}
              variant='contained'
              color='success'
              startIcon={approveMutation.isPending ? <CircularProgress size={20} /> : <i className='tabler-check' />}
              disabled={approveMutation.isPending || departureTimePassed}
            >
              {departureTimePassed ? 'Hora pasada' : 'Aprobar'}
            </Button>
          </>
        )}

        {!isCashierSeller && !isPendingApproval && (
          <>
            <Button
              onClick={handlePrint}
              variant='contained'
              color='primary'
              startIcon={<i className='tabler-printer' />}
              disabled={ticketsLoading}
            >
              Imprimir Reporte
            </Button>
            <Tooltip
              title={isThermalSupported ? 'Imprimir en impresora térmica USB' : 'WebUSB no disponible - requiere HTTPS'}
            >
              <span>
                <Button
                  onClick={handleThermalPrint}
                  variant='outlined'
                  color='secondary'
                  disabled={!isThermalSupported || isPrinting || ticketsLoading}
                  startIcon={isPrinting ? <CircularProgress size={18} /> : <i className='tabler-device-tablet' />}
                >
                  {isPrinting ? 'Imprimiendo...' : 'Impr. Tablet'}
                </Button>
              </span>
            </Tooltip>
          </>
        )}
      </DialogActions>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>
          <Box display='flex' alignItems='center' gap={2}>
            <i className='tabler-alert-triangle' style={{ fontSize: 24, color: '#f44336' }} />
            <Typography variant='h6'>Rechazar Viaje</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity='warning' sx={{ mb: 3 }}>
            Esta acción no se puede deshacer. El viaje quedará rechazado permanentemente.
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={3}
            label='Motivo del rechazo (opcional)'
            placeholder='Ej: El bus está en mantenimiento ese día'
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
            inputProps={{ maxLength: 500 }}
            helperText={`${rejectionReason.length}/500 caracteres`}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              setRejectDialogOpen(false)
              setRejectionReason('')
            }}
            color='inherit'
            disabled={rejectMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleReject}
            variant='contained'
            color='error'
            startIcon={rejectMutation.isPending ? <CircularProgress size={20} /> : <i className='tabler-x' />}
            disabled={rejectMutation.isPending}
          >
            {rejectMutation.isPending ? 'Rechazando...' : 'Rechazar Viaje'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  )
}

export default TravelDetailDialog
