'use client'

import { useState, useEffect } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'

import type { Ticket } from '@/types/api/tickets'
import type { Travel } from '@/types/api/travels'
import { useGenerateQR, useVerifyQR } from '@/hooks/usePayments'

// Tiempo de expiración en segundos (8 minutos)
const QR_EXPIRATION_SECONDS = 8 * 60

interface QRPaymentDialogProps {
  open: boolean
  onClose: () => void
  ticket: Ticket | null
  travel: Travel | null
  onPaymentSuccess: () => void
  onPaymentCancel: () => void
}

const QRPaymentDialog = ({
  open,
  onClose,
  ticket,
  travel,
  onPaymentSuccess,
  onPaymentCancel
}: QRPaymentDialogProps) => {
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'generating' | 'waiting' | 'verifying' | 'paid' | 'expired' | 'error'>('generating')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)

  const generateQRMutation = useGenerateQR()
  const verifyQRMutation = useVerifyQR()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60

    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const generateQRCode = async (ticketId: number) => {
    if (!ticketId || ticketId <= 0) return

    setPaymentStatus('generating')
    setErrorMessage(null)
    setTimeRemaining(0)

    try {
      const response = await generateQRMutation.mutateAsync({
        ticketId: ticketId
      })

      // Extraer la imagen de response.data.qrImage
      const qrImageData = response.data?.qrImage

      if (!qrImageData || typeof qrImageData !== 'string') {
        setErrorMessage('Error: No se recibió la imagen QR del servidor.')
        setPaymentStatus('error')

        return
      }

      // Si la imagen viene sin el prefijo data URI, agregarlo
      const imageData = qrImageData.startsWith('data:')
        ? qrImageData
        : `data:image/png;base64,${qrImageData}`

      setQrImage(imageData)

      // Iniciar timer de 8 minutos cuando se muestra la imagen
      setTimeRemaining(QR_EXPIRATION_SECONDS)

      setPaymentStatus('waiting')
    } catch (error) {
      console.error('Error generating QR:', error)
      setErrorMessage('Error al generar el código QR. Por favor, intenta de nuevo.')
      setPaymentStatus('error')
    }
  }

  const verifyPayment = async (ticketId: number) => {
    if (!ticketId || ticketId <= 0) return

    setPaymentStatus('verifying')

    try {
      const response = await verifyQRMutation.mutateAsync({
        ticketId: ticketId
      })

      if (response.status === 'paid') {
        setPaymentStatus('paid')
        setTimeout(() => {
          onPaymentSuccess()
        }, 1500)
      } else if (response.status === 'expired') {
        setPaymentStatus('expired')
        setErrorMessage('El código QR ha expirado.')
      } else {
        setPaymentStatus('waiting')
      }
    } catch (error) {
      console.error('Error verifying QR:', error)
      setPaymentStatus('waiting')
    }
  }

  // Generate QR when dialog opens with a valid ticket
  useEffect(() => {
    if (open && ticket && ticket.id > 0) {
      generateQRCode(ticket.id)
    } else if (!open) {
      setQrImage(null)
      setPaymentStatus('generating')
      setErrorMessage(null)
      setTimeRemaining(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ticket?.id])

  // Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (paymentStatus === 'waiting' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Tiempo expirado - cancelar la orden
            setPaymentStatus('expired')
            setErrorMessage('El tiempo para pagar ha expirado. La orden será cancelada.')
            onPaymentCancel()

            return 0
          }

          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStatus, timeRemaining > 0])

  // Poll for payment verification
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    const ticketId = ticket?.id

    if (paymentStatus === 'waiting' && ticketId && ticketId > 0) {
      interval = setInterval(() => {
        verifyPayment(ticketId)
      }, 10000) // Verificar cada 10 segundos
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStatus, ticket?.id])

  const handleRetry = () => {
    if (ticket && ticket.id > 0) {
      generateQRCode(ticket.id)
    }
  }

  const handleCancel = () => {
    onPaymentCancel()
    onClose()
  }

  if (!ticket || !travel) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' gap={2}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              bgcolor: 'info.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <i className='tabler-qrcode' style={{ fontSize: '28px', color: 'white' }} />
          </Box>
          <Box>
            <Typography variant='h5' fontWeight={600}>
              Pago por QR
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Ticket #{ticket.id}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          {/* Info del viaje */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant='body2' color='text.secondary'>
              <strong>Ruta:</strong> {travel.route.officeOrigin.place?.name || 'N/A'} → {travel.route.officeDestination.place?.name || 'N/A'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              <strong>Asientos:</strong> {ticket.seats.length}
            </Typography>
          </Box>

          {/* QR Code */}
          <Box
            sx={{
              minHeight: 300,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}
          >
            {paymentStatus === 'generating' && (
              <>
                <CircularProgress size={60} />
                <Typography variant='body1' color='text.secondary'>
                  Generando código QR...
                </Typography>
              </>
            )}

            {paymentStatus === 'waiting' && qrImage && (
              <>
                {/* Timer de expiración */}
                {timeRemaining > 0 && (
                  <Chip
                    icon={<i className='tabler-clock' style={{ fontSize: '16px' }} />}
                    label={`Expira en: ${formatTime(timeRemaining)}`}
                    color={timeRemaining <= 60 ? 'error' : timeRemaining <= 180 ? 'warning' : 'default'}
                    variant='outlined'
                    sx={{ mb: 1 }}
                  />
                )}

                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 2,
                    boxShadow: 3
                  }}
                >
                  <img
                    src={qrImage}
                    alt='Código QR de pago'
                    style={{ width: 250, height: 250 }}
                  />
                </Box>
                <Chip
                  icon={<CircularProgress size={16} />}
                  label='Esperando pago...'
                  color='info'
                  variant='outlined'
                />
                <Typography variant='caption' color='text.secondary'>
                  Escanea el código QR con tu aplicación bancaria
                </Typography>
              </>
            )}

            {paymentStatus === 'verifying' && (
              <>
                <CircularProgress size={40} />
                <Typography variant='body1' color='text.secondary'>
                  Verificando pago...
                </Typography>
              </>
            )}

            {paymentStatus === 'paid' && (
              <>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className='tabler-check' style={{ fontSize: '48px', color: 'white' }} />
                </Box>
                <Typography variant='h6' color='success.main' fontWeight={600}>
                  ¡Pago confirmado!
                </Typography>
              </>
            )}

            {(paymentStatus === 'error' || paymentStatus === 'expired') && (
              <>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'error.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className='tabler-x' style={{ fontSize: '48px', color: 'white' }} />
                </Box>
                <Alert severity='error' sx={{ mt: 2 }}>
                  {errorMessage}
                </Alert>
              </>
            )}
          </Box>

          {/* Total */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: 'success.lighter',
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography variant='h6' fontWeight='bold'>
              Total a pagar:
            </Typography>
            <Typography variant='h4' color='success.main' fontWeight='bold'>
              Bs. {parseFloat(ticket.total_price).toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
        {(paymentStatus === 'error' || paymentStatus === 'expired') && (
          <Button
            onClick={handleRetry}
            variant='contained'
            color='primary'
            startIcon={<i className='tabler-refresh' />}
            fullWidth
          >
            Generar nuevo QR
          </Button>
        )}

        {paymentStatus !== 'paid' && paymentStatus !== 'expired' && (
          <Button
            onClick={handleCancel}
            variant='outlined'
            color='error'
            fullWidth
            disabled={paymentStatus === 'verifying'}
          >
            Cancelar pago
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default QRPaymentDialog
