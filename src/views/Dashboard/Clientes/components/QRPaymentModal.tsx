'use client'

import { useState, useEffect } from 'react'

import Image from 'next/image'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'

interface QRPaymentModalProps {
  open: boolean
  onClose: () => void
  onPaymentSuccess?: () => void
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
  verifyPayment: (correlationId: string) => Promise<boolean>
}

const QRPaymentModal = ({
  open,
  onClose,
  onPaymentSuccess,
  qrData,
  isLoading,
  error,
  verifyPayment
}: QRPaymentModalProps) => {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'verified' | 'expired'>('pending')
  const [countdown, setCountdown] = useState<number>(0)
  const [verificationAttempts, setVerificationAttempts] = useState<number>(0)

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

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (open) {
      setPaymentStatus('pending')
      setVerificationAttempts(0)
    }
  }, [open])

  useEffect(() => {
    if (!open || !qrData?.correlationId || paymentStatus !== 'pending') return

    let intervalId: NodeJS.Timeout
    let timeoutId: NodeJS.Timeout

    const startVerification = async () => {
      const checkPayment = async () => {
        try {
          setVerificationAttempts(prev => prev + 1)
          console.log(
            '🔍 QRPaymentModal - qrData.correlationId:',
            qrData.correlationId,
            'tipo:',
            typeof qrData.correlationId
          )
          const isPaid = await verifyPayment(qrData.correlationId)

          if (isPaid) {
            setPaymentStatus('verified')
            clearInterval(intervalId)
            clearTimeout(timeoutId)

            if (onPaymentSuccess) {
              onPaymentSuccess()
            }
          }
        } catch (error) {
          console.error('Error verificando pago:', error)
        }
      }

      intervalId = setInterval(checkPayment, 3000)

      const expiresDate = new Date(qrData.expiresAt)
      const now = new Date()
      const msUntilExpiry = expiresDate.getTime() - now.getTime()

      if (msUntilExpiry > 0) {
        setCountdown(Math.floor(msUntilExpiry / 1000))
        timeoutId = setTimeout(() => {
          setPaymentStatus('expired')
          clearInterval(intervalId)
        }, msUntilExpiry)
      } else {
        setPaymentStatus('expired')
      }
    }

    startVerification()

    return () => {
      if (intervalId) clearInterval(intervalId)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [open, qrData, verifyPayment, paymentStatus, onPaymentSuccess])

  useEffect(() => {
    if (countdown <= 0 || paymentStatus !== 'pending') return

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)

          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown, paymentStatus])

  const handleClose = () => {
    setPaymentStatus('pending')
    setCountdown(0)
    setVerificationAttempts(0)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Typography variant='h6'>Pago con QR</Typography>
          {paymentStatus === 'verified' && (
            <Chip label='Pago Confirmado' color='success' size='small' icon={<i className='tabler-check' />} />
          )}
          {paymentStatus === 'expired' && (
            <Chip label='QR Expirado' color='error' size='small' icon={<i className='tabler-x' />} />
          )}
        </Box>
      </DialogTitle>

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

        {qrData && !isLoading && paymentStatus === 'pending' && (
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
                  <strong>Expira en:</strong> {formatCountdown(countdown)}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  ID de transacción: {qrData.correlationId}
                </Typography>
              </Box>
            </Paper>

            <Box sx={{ mb: 2 }}>
              <Typography variant='body2' color='text.secondary' align='center'>
                Verificando pago... (Intento {verificationAttempts})
              </Typography>
              <LinearProgress sx={{ mt: 1 }} />
            </Box>

            <Alert severity='warning'>
              Este QR expirará en {formatCountdown(countdown)}. Realiza el pago antes de ese momento. La verificación se
              realiza automáticamente cada 5 segundos.
            </Alert>
          </Box>
        )}

        {qrData && !isLoading && paymentStatus === 'verified' && (
          <Box>
            <Alert severity='success' sx={{ mb: 3 }}>
              ¡Pago confirmado exitosamente!
            </Alert>

            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  mx: 'auto'
                }}
              >
                <i className='tabler-check' style={{ fontSize: '48px', color: 'white' }} />
              </Box>
              <Typography variant='h6' gutterBottom color='success.main'>
                Pago Completado
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Typography variant='body2'>
                  <strong>Total pagado:</strong> Bs. {qrData.totalAmount}
                </Typography>
                <Typography variant='body2'>
                  <strong>ID Clientes recargados:</strong> {qrData.customerIds.join(', ')}
                </Typography>
                <Typography variant='body2'>
                  <strong>ID de transacción:</strong> {qrData.correlationId}
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}

        {qrData && !isLoading && paymentStatus === 'expired' && (
          <Box>
            <Alert severity='error' sx={{ mb: 3 }}>
              El código QR ha expirado. Por favor, genera uno nuevo.
            </Alert>

            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  mx: 'auto'
                }}
              >
                <i className='tabler-x' style={{ fontSize: '48px', color: 'white' }} />
              </Box>
              <Typography variant='h6' gutterBottom color='error.main'>
                QR Expirado
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Typography variant='body2'>
                  <strong>Fecha de expiración:</strong> {formatExpirationDate(qrData.expiresAt)}
                </Typography>
                {/*   <Typography variant='body2'>
                  <strong>ID de transacción:</strong> {qrData.correlationId}
                </Typography> */}
              </Box>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color='primary' variant='contained'>
          {paymentStatus === 'verified' ? 'Cerrar' : 'Cancelar'}
        </Button>
        {(paymentStatus === 'expired' || error) && (
          <Button onClick={() => window.location.reload()} color='secondary'>
            Generar nuevo QR
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default QRPaymentModal
