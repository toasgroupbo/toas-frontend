'use client'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Chip
} from '@mui/material'

import { formatDate, formatTime } from '../../sale/utils/dateFormatters'

interface TravelInfo {
  origin: string
  destination: string
  departureTime: string
}

interface Cashier {
  id: number
  email: string
  fullName: string
  ci: string
  phone: string
  cashTotal: string
  qrTotal: string
}

interface Totals {
  totalCash: string
  totalQr: string
}

interface TicketsSummaryModalProps {
  open: boolean
  onClose: () => void
  travelInfo: TravelInfo | null
  cashiers: Cashier[]
  totals: Totals
  ticketsCount: number
  seatsCount: number
}

const TicketsSummaryModal = ({
  open,
  onClose,
  travelInfo,
  cashiers,
  totals,
  ticketsCount,
  seatsCount
}: TicketsSummaryModalProps) => {
  const totalGeneral = parseFloat(totals.totalCash) + parseFloat(totals.totalQr)

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <i className='tabler-report' style={{ fontSize: '24px', color: 'var(--mui-palette-primary-main)' }} />
          <Typography variant='h6' fontWeight='bold'>
            Resumen de Ventas
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Travel Info */}
        {travelInfo && (
          <Box sx={{ mb: 3 }}>
            <Typography variant='subtitle2' color='text.secondary' gutterBottom>
              Información del Viaje
            </Typography>
            <Box
              sx={{
                bgcolor: 'action.hover',
                p: 2,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className='tabler-route' style={{ fontSize: '20px', color: 'var(--mui-palette-primary-main)' }} />
                <Typography variant='body1' fontWeight='medium'>
                  {travelInfo.origin}
                </Typography>
                <i className='tabler-arrow-right' style={{ fontSize: '16px' }} />
                <Typography variant='body1' fontWeight='medium'>
                  {travelInfo.destination}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <i className='tabler-calendar' style={{ fontSize: '16px', color: 'var(--mui-palette-info-main)' }} />
                  <Typography variant='body2'>{formatDate(travelInfo.departureTime)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <i className='tabler-clock' style={{ fontSize: '16px', color: 'var(--mui-palette-warning-main)' }} />
                  <Typography variant='body2'>{formatTime(travelInfo.departureTime)}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* Summary Stats */}
        <Box sx={{ mb: 3 }}>
          <Typography variant='subtitle2' color='text.secondary' gutterBottom>
            Resumen General
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box
              sx={{
                flex: 1,
                minWidth: '120px',
                bgcolor: 'primary.lighter',
                p: 2,
                borderRadius: 2,
                textAlign: 'center'
              }}
            >
              <Typography variant='h4' color='primary.main' fontWeight='bold'>
                {ticketsCount}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Tickets Vendidos
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                minWidth: '120px',
                bgcolor: 'info.lighter',
                p: 2,
                borderRadius: 2,
                textAlign: 'center'
              }}
            >
              <Typography variant='h4' color='info.main' fontWeight='bold'>
                {seatsCount}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Asientos Vendidos
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Totals */}
        <Box sx={{ mb: 3 }}>
          <Typography variant='subtitle2' color='text.secondary' gutterBottom>
            Totales de Venta
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1.5,
                bgcolor: 'warning.lighter',
                borderRadius: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className='tabler-cash' style={{ fontSize: '20px', color: 'var(--mui-palette-warning-main)' }} />
                <Typography variant='body2'>Efectivo</Typography>
              </Box>
              <Typography variant='h6' fontWeight='bold' color='warning.dark'>
                Bs. {parseFloat(totals.totalCash).toFixed(2)}
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1.5,
                bgcolor: 'info.lighter',
                borderRadius: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className='tabler-qrcode' style={{ fontSize: '20px', color: 'var(--mui-palette-info-main)' }} />
                <Typography variant='body2'>QR</Typography>
              </Box>
              <Typography variant='h6' fontWeight='bold' color='info.dark'>
                Bs. {parseFloat(totals.totalQr).toFixed(2)}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1.5,
                bgcolor: 'success.lighter',
                borderRadius: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className='tabler-coin' style={{ fontSize: '20px', color: 'var(--mui-palette-success-main)' }} />
                <Typography variant='body1' fontWeight='medium'>
                  Total General
                </Typography>
              </Box>
              <Typography variant='h5' fontWeight='bold' color='success.dark'>
                Bs. {totalGeneral.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Cashiers */}
        {cashiers.length > 0 && (
          <Box>
            <Typography variant='subtitle2' color='text.secondary' gutterBottom>
              Ventas por Cajero
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {cashiers.map(cashier => (
                <Box
                  key={cashier.id}
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant='body1' fontWeight='medium'>
                        {cashier.fullName}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {cashier.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Chip
                      icon={<i className='tabler-cash' style={{ fontSize: '14px' }} />}
                      label={`Efectivo: Bs. ${parseFloat(cashier.cashTotal).toFixed(2)}`}
                      size='small'
                      color='warning'
                      variant='tonal'
                    />
                    <Chip
                      icon={<i className='tabler-qrcode' style={{ fontSize: '14px' }} />}
                      label={`QR: Bs. ${parseFloat(cashier.qrTotal).toFixed(2)}`}
                      size='small'
                      color='info'
                      variant='tonal'
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant='contained' color='primary'>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TicketsSummaryModal
