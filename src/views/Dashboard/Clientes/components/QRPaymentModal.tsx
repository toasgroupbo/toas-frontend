'use client'

import Image from 'next/image'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material'

interface QRPaymentModalProps {
  open: boolean
  onClose: () => void
  qrData?: {
    qrImage: string
    expiresAt: string
    totalAmount: number
    amountPerCustomer: number
    customerIds: number[]
    correlationId: string
    message: string
  }
  isLoading: boolean
  error: Error | null
}

const QRPaymentModal = ({ open, onClose, qrData, isLoading, error }: QRPaymentModalProps) => {
  const formatExpirationDate = (dateString: string) => {
    const date = new Date(dateString)

    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>Pago con QR</DialogTitle>
      <DialogContent>
        {isLoading && (
          <Box display='flex' flexDirection='column' alignItems='center' py={4}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Generando código QR...</Typography>
          </Box>
        )}

        {error && (
          <Alert severity='error' sx={{ mt: 2 }}>
            Error al generar el QR: {error.message}
          </Alert>
        )}

        {qrData && !isLoading && (
          <Box>
            <Alert severity='info' sx={{ mb: 3 }}>
              {qrData.message}
            </Alert>

            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', mb: 3 }}>
              <Typography variant='h6' gutterBottom>
                Escanea el código QR para realizar el pago
              </Typography>

              <Box sx={{ my: 3, display: 'flex', justifyContent: 'center' }}>
                <Image
                  src={`data:image/png;base64,${qrData.qrImage}`}
                  alt='QR de pago'
                  width={250}
                  height={250}
                  style={{ border: '1px solid #ddd', borderRadius: '8px' }}
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant='body2' color='text.secondary'>
                  <strong>Monto por cliente:</strong> Bs. {qrData.amountPerCustomer}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  <strong>Total a pagar:</strong> Bs. {qrData.totalAmount}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  <strong>Clientes:</strong> {qrData.customerIds.join(', ')}
                </Typography>
                <Typography variant='body2' color='warning.main'>
                  <strong>Expira:</strong> {formatExpirationDate(qrData.expiresAt)}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  ID de transacción: {qrData.correlationId}
                </Typography>
              </Box>
            </Paper>

            <Alert severity='warning'>
              Este QR expirará en la fecha indicada. Realiza el pago antes de ese momento.
            </Alert>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='primary' variant='contained'>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default QRPaymentModal
