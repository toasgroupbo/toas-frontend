'use client'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography,
  Divider,
  Chip,
  Grid
} from '@mui/material'

import type { Travel } from '@/types/api/deposits'

interface PaymentDetailsDialogProps {
  open: boolean
  onClose: () => void
  travel: Travel
}

const formatCurrency = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value

  return `Bs. ${num.toFixed(2)}`
}

const formatDateToBolivia = (dateString: string) => {
  const date = new Date(dateString)

  return new Intl.DateTimeFormat('es-BO', {
    timeZone: 'America/La_Paz',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const PaymentDetailsDialog = ({ open, onClose, travel }: PaymentDetailsDialogProps) => {
  const transaction = travel.transaction

  if (!transaction) {
    return null
  }

  const batchDetail = transaction.batchDetailResponse
  const paymentDetails = batchDetail?.Spreadsheet?.FormProvidersPayments?.[0]

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Box display='flex' alignItems='center' gap={2}>
            <i className='tabler-receipt' style={{ fontSize: '24px', color: 'var(--mui-palette-success-main)' }} />
            <Typography variant='h5'>Comprobante de Pago</Typography>
          </Box>
          <IconButton onClick={onClose} size='small'>
            <i className='tabler-x' />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            bgcolor: 'success.lighter',
            border: '1px solid',
            borderColor: 'success.main',
            borderRadius: 2,
            p: 2,
            mb: 3,
            textAlign: 'center'
          }}
        >
          <Chip label='PAGO COMPLETADO' color='success' sx={{ mb: 1 }} />
          <Typography variant='h4' color='success.main' fontWeight={700}>
            {formatCurrency(transaction.totalAmount || travel.net_to_company)}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant='subtitle2' color='text.secondary' gutterBottom>
            Información del Viaje
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant='caption' color='text.secondary'>
                ID Viaje
              </Typography>
              <Typography variant='body2' fontWeight={500}>
                #{travel.id}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant='caption' color='text.secondary'>
                Bus
              </Typography>
              <Typography variant='body2' fontWeight={500}>
                {travel.bus.plaque} - {travel.bus.name}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant='caption' color='text.secondary'>
                Fecha de Salida
              </Typography>
              <Typography variant='body2' fontWeight={500}>
                {formatDateToBolivia(travel.departure_time)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant='caption' color='text.secondary'>
                Venta Total
              </Typography>
              <Typography variant='body2' fontWeight={500}>
                {formatCurrency(travel.total)}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant='subtitle2' color='text.secondary' gutterBottom>
            Detalles del Pago
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant='caption' color='text.secondary'>
                ID Transacción
              </Typography>
              <Typography variant='body2' fontWeight={500} fontFamily='monospace'>
                {transaction.transactionId}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant='caption' color='text.secondary'>
                Fecha de Proceso
              </Typography>
              <Typography variant='body2' fontWeight={500}>
                {batchDetail?.DateProcess ? formatDateToBolivia(batchDetail.DateProcess) : '-'}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant='subtitle2' color='text.secondary' gutterBottom>
            Beneficiario
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant='caption' color='text.secondary'>
                Titular
              </Typography>
              <Typography variant='body2' fontWeight={500}>
                {paymentDetails?.TitularName || travel.bus.owner?.bankAccount?.titularName || travel.bus.owner?.name}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant='caption' color='text.secondary'>
                Documento
              </Typography>
              <Typography variant='body2' fontWeight={500}>
                {paymentDetails?.DocumentType?.trim()} {paymentDetails?.DocumentNumber}{' '}
                {paymentDetails?.DocumentExtension?.trim()}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant='caption' color='text.secondary'>
                Nro. Cuenta
              </Typography>
              <Typography variant='body2' fontWeight={500} fontFamily='monospace'>
                {paymentDetails?.AccountNumber || travel.bus.owner?.bankAccount?.account}
              </Typography>
            </Grid>
            {batchDetail?.SourceAccount && (
              <Grid item xs={12}>
                <Typography variant='caption' color='text.secondary'>
                  Cuenta Origen
                </Typography>
                <Typography variant='body2' fontWeight={500} fontFamily='monospace'>
                  {batchDetail.SourceAccount}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        {transaction.completedAt && (
          <Box
            sx={{
              bgcolor: 'action.hover',
              borderRadius: 1,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <i className='tabler-check' style={{ color: 'var(--mui-palette-success-main)' }} />
            <Typography variant='body2' color='text.secondary'>
              Completado el {formatDateToBolivia(transaction.completedAt)}
            </Typography>
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

export default PaymentDetailsDialog
