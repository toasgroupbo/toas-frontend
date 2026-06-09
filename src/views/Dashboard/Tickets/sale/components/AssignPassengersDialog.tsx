'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'
import Divider from '@mui/material/Divider'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import CustomTextField from '@core/components/mui/TextField'
import type { Ticket } from '@/types/api/tickets'
import type { Travel } from '@/types/api/travels'
import { useSearchPassengerByCI, type Passenger } from '@/hooks/usePassengers'
import { useGenerateQR, useVerifyQR } from '@/hooks/usePayments'
import { formatFullDateTime } from '../utils/dateFormatters'

interface AssignPassengersDialogProps {
  open: boolean
  onClose: () => void
  ticket: Ticket | null
  travel: Travel | null
  paymentMethod: 'cash' | 'qr'
  onConfirmPayment: () => Promise<void>
  onCancelPayment: () => Promise<void>
  onAssignPassengers: (assignments: SeatAssignment[]) => Promise<void>
  onPaymentSuccess: () => void
  isLoading?: boolean
  isConfirming?: boolean
  isCancelling?: boolean
}

export interface SeatAssignment {
  seatId: number
  passengerName: string
  passengerCI: string
}

const AssignPassengersDialog = ({
  open,
  onClose,
  ticket,
  travel,
  paymentMethod,
  onConfirmPayment,
  onCancelPayment,
  onAssignPassengers,
  onPaymentSuccess,
  isLoading,
  isConfirming,
  isCancelling
}: AssignPassengersDialogProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // Estados para asignación de pasajeros
  const [assignments, setAssignments] = useState<Record<string, Passenger | null>>({})
  const [openSelectModal, setOpenSelectModal] = useState(false)
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null)
  const [searchCI, setSearchCI] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPassengerName, setNewPassengerName] = useState('')
  const [newPassengerCI, setNewPassengerCI] = useState('')
  const [duplicateCIError, setDuplicateCIError] = useState<string | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [foundPassenger, setFoundPassenger] = useState<Passenger | null>(null)
  const [editingSeat, setEditingSeat] = useState<string | null>(null)
  const [editedName, setEditedName] = useState('')

  // Estados para timer
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isExpired, setIsExpired] = useState(false)

  // Estados para QR
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [qrStatus, setQrStatus] = useState<'idle' | 'generating' | 'waiting' | 'verifying' | 'paid'>('idle')

  // Estados para asignación de pasajeros guardada
  const [passengersAssigned, setPassengersAssigned] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)

  // Estado para modal de confirmación de cancelación
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // Ref para evitar cancelaciones duplicadas
  const cancellingRef = useRef(false)

  const customerId = (ticket as any)?.buyer?.id || null
  const searchPassengerMutation = useSearchPassengerByCI()
  const generateQRMutation = useGenerateQR()
  const verifyQRMutation = useVerifyQR()

  // Formatear tiempo restante
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60

    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Inicializar timer al abrir el modal
  useEffect(() => {
    if (open && ticket?.reserve_expiresAt) {
      setExpiresAt(new Date(ticket.reserve_expiresAt))
      setIsExpired(false)
      cancellingRef.current = false
    }
  }, [open, ticket?.reserve_expiresAt])

  // Countdown y auto-cancelación
  useEffect(() => {
    if (!expiresAt || isExpired) return

    const interval = setInterval(() => {
      const now = new Date()
      const diff = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))

      setTimeRemaining(diff)

      if (diff <= 0 && !cancellingRef.current) {
        cancellingRef.current = true
        setIsExpired(true)
        onCancelPayment()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, isExpired, onCancelPayment])

  // Refs para callbacks (evitar stale closures en el polling)
  const onPaymentSuccessRef = useRef(onPaymentSuccess)
  const onCancelPaymentRef = useRef(onCancelPayment)
  const verifyQRMutationRef = useRef(verifyQRMutation)

  // Actualizar refs en cada render
  useEffect(() => {
    onPaymentSuccessRef.current = onPaymentSuccess
    onCancelPaymentRef.current = onCancelPayment
    verifyQRMutationRef.current = verifyQRMutation
  })

  // Estado separado para indicar que está verificando (no afecta el polling)
  const [isVerifying, setIsVerifying] = useState(false)

  // Polling para verificar pago QR
  useEffect(() => {
    // Solo iniciar polling cuando qrStatus es 'waiting'
    const shouldPoll = qrStatus === 'waiting' && ticket?.id

    if (!shouldPoll) return

    let isActive = true
    const ticketId = ticket.id

    const checkPayment = async () => {
      if (!isActive) return

      setIsVerifying(true)

      try {
        const response = await verifyQRMutationRef.current.mutateAsync({ ticketId })

        if (!isActive) return

        setIsVerifying(false)

        if (response.status === 'PAID') {
          setQrStatus('paid')

          // La navegación al modal de éxito se maneja en el useEffect separado abajo
        } else if (response.status === 'EXPIRED') {
          setQrStatus('idle')
          setIsExpired(true)

          if (!cancellingRef.current) {
            cancellingRef.current = true
            onCancelPaymentRef.current()
          }
        }

        // Si es PENDING, no hacer nada - el polling continuará
      } catch {
        setIsVerifying(false)

        // No cambiar qrStatus en caso de error, el polling continuará
      }
    }

    // Verificar inmediatamente al entrar en estado 'waiting'
    checkPayment()

    // Luego verificar cada 10 segundos
    const interval = setInterval(checkPayment, 10000)

    return () => {
      isActive = false
      setIsVerifying(false)
      clearInterval(interval)
    }
  }, [qrStatus, ticket?.id])

  // Efecto separado para navegar al modal de éxito cuando el pago QR es confirmado
  useEffect(() => {
    if (qrStatus === 'paid') {
      const timer = setTimeout(() => {
        onPaymentSuccessRef.current()
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [qrStatus])

  // Reset estados al cerrar
  useEffect(() => {
    if (open && ticket) {
      const initialAssignments: Record<string, Passenger | null> = {}

      ticket.seats.forEach(seat => {
        initialAssignments[seat.seatNumber] = null
      })
      setAssignments(initialAssignments)
      setQrImage(null)
      setQrStatus('idle')
      setPassengersAssigned(false)
      setIsAssigning(false)
      setShowCancelConfirm(false)
    } else {
      setAssignments({})
      setOpenSelectModal(false)
      setSelectedSeat(null)
      setSearchCI('')
      setShowCreateForm(false)
      setNewPassengerName('')
      setNewPassengerCI('')
      setDuplicateCIError(null)
      setSearchError(null)
      setEditingSeat(null)
      setEditedName('')
      setExpiresAt(null)
      setTimeRemaining(0)
      setIsExpired(false)
      setQrImage(null)
      setQrStatus('idle')
      setPassengersAssigned(false)
      setIsAssigning(false)
      setShowCancelConfirm(false)
      cancellingRef.current = false
    }
  }, [open, ticket])

  const handleSearchPassenger = async () => {
    if (searchCI.length < 3) {
      setSearchError('Ingresa al menos 3 caracteres para buscar')

      return
    }

    setSearchError(null)
    setFoundPassenger(null)

    try {
      const result = await searchPassengerMutation.mutateAsync(searchCI)

      if (result) {
        setFoundPassenger(result)
      } else {
        setSearchError('No se encontró ningún pasajero con ese CI')
      }
    } catch {
      setSearchError('Error al buscar pasajero')
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearchPassenger()
    }
  }

  const handleOpenSelectModal = (seatNumber: string) => {
    setSelectedSeat(seatNumber)
    setOpenSelectModal(true)
    setShowCreateForm(false)
    setSearchCI('')
    setDuplicateCIError(null)
    setSearchError(null)
    setFoundPassenger(null)
  }

  const handleSelectPassenger = (passenger: Passenger) => {
    if (selectedSeat) {
      setAssignments(prev => ({
        ...prev,
        [selectedSeat]: passenger
      }))
      setOpenSelectModal(false)
      setSelectedSeat(null)
      setSearchCI('')
    }
  }

  const handleRemoveAssignment = (seatNumber: string) => {
    setAssignments(prev => ({
      ...prev,
      [seatNumber]: null
    }))
  }

  const handleStartEdit = (seatNumber: string) => {
    const passenger = assignments[seatNumber]

    if (passenger) {
      setEditingSeat(seatNumber)
      setEditedName(passenger.fullName)
    }
  }

  const handleSaveEdit = () => {
    if (editingSeat && editedName.trim()) {
      setAssignments(prev => {
        const currentPassenger = prev[editingSeat]

        if (currentPassenger) {
          return {
            ...prev,
            [editingSeat]: {
              ...currentPassenger,
              fullName: editedName.trim()
            }
          }
        }

        return prev
      })
      setEditingSeat(null)
      setEditedName('')
    }
  }

  const handleShowCancelConfirmEdit = () => {
    setEditingSeat(null)
    setEditedName('')
  }

  const handleCreatePassenger = () => {
    if (!newPassengerName.trim() || !newPassengerCI.trim()) return

    const newPassenger: Passenger = {
      id: -1,
      fullName: newPassengerName.trim(),
      ci: newPassengerCI.trim(),
      customerId: customerId || 0
    }

    if (selectedSeat) {
      setAssignments(prev => ({
        ...prev,
        [selectedSeat]: newPassenger
      }))
    }

    setNewPassengerName('')
    setNewPassengerCI('')
    setShowCreateForm(false)
    setOpenSelectModal(false)
    setSelectedSeat(null)
    setDuplicateCIError(null)
  }

  // Obtener asignaciones actuales
  const getSeatAssignments = useCallback((): SeatAssignment[] => {
    if (!ticket) return []

    return ticket.seats
      .filter(seat => assignments[seat.seatNumber] !== null)
      .map(seat => ({
        seatId: seat.id || Number(seat.seatNumber),
        passengerName: assignments[seat.seatNumber]!.fullName,
        passengerCI: assignments[seat.seatNumber]!.ci
      }))
  }, [ticket, assignments])

  // Asignar pasajeros antes de confirmar/generar QR
  const handleAssignAndProceed = async (action: 'confirm' | 'generateQR') => {
    if (!passengersAssigned) {
      setIsAssigning(true)

      try {
        await onAssignPassengers(getSeatAssignments())
        setPassengersAssigned(true)
      } catch (error) {
        console.error('Error assigning passengers:', error)
        setIsAssigning(false)

        return
      }

      setIsAssigning(false)
    }

    if (action === 'confirm') {
      await onConfirmPayment()
    } else if (action === 'generateQR') {
      await handleGenerateQR()
    }
  }

  // Generar QR
  const handleGenerateQR = async () => {
    if (!ticket?.id) return

    setQrStatus('generating')

    try {
      const response = await generateQRMutation.mutateAsync({ ticketId: ticket.id })

      const qrImageData = response.data?.qrImage

      if (!qrImageData || typeof qrImageData !== 'string') {
        setQrStatus('idle')

        return
      }

      const imageData = qrImageData.startsWith('data:') ? qrImageData : `data:image/png;base64,${qrImageData}`

      setQrImage(imageData)

      // Actualizar timer con la nueva expiración del QR
      if (response.reserve_expiresAt) {
        setExpiresAt(new Date(response.reserve_expiresAt))
      }

      setQrStatus('waiting')
    } catch (error) {
      console.error('Error generating QR:', error)
      setQrStatus('idle')
    }
  }

  // Mostrar modal de confirmación de cancelación
  const handleShowCancelConfirm = () => {
    setShowCancelConfirm(true)
  }

  // Confirmar cancelación
  const handleConfirmCancel = async () => {
    if (cancellingRef.current) return
    cancellingRef.current = true
    setShowCancelConfirm(false)
    await onCancelPayment()
  }

  // Cerrar modal de confirmación sin cancelar
  const handleCloseCancelConfirm = () => {
    setShowCancelConfirm(false)
  }

  const isProcessing = isLoading || isConfirming || isCancelling || isAssigning

  if (!ticket) return null

  // Determinar color del timer
  const getTimerColor = () => {
    if (timeRemaining <= 60) return 'error'
    if (timeRemaining <= 180) return 'warning'

    return 'default'
  }

  return (
    <>
      <Dialog open={open} onClose={isProcessing ? undefined : onClose} maxWidth='md' fullWidth fullScreen={isMobile}>
        <DialogTitle>
          <Box display='flex' flexDirection='column' gap={1}>
            <Box display='flex' alignItems='center' justifyContent='space-between'>
              <Box display='flex' alignItems='center' gap={{ xs: 1, sm: 2 }}>
                <Box
                  sx={{
                    width: { xs: 36, sm: 44 },
                    height: { xs: 36, sm: 44 },
                    borderRadius: '50%',
                    bgcolor: paymentMethod === 'cash' ? 'success.main' : 'info.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <i
                    className={paymentMethod === 'cash' ? 'tabler-cash' : 'tabler-qrcode'}
                    style={{ fontSize: isMobile ? '18px' : '22px', color: 'white' }}
                  />
                </Box>
                <Box>
                  <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={600}>
                    {paymentMethod === 'cash' ? 'Pago en Efectivo' : 'Pago por QR'}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Ticket #{ticket.id}
                  </Typography>
                </Box>
              </Box>
              <Box display='flex' alignItems='center' gap={1}>
                {/* Timer */}
                {timeRemaining > 0 && !isExpired && (
                  <Chip
                    icon={<i className='tabler-clock' style={{ fontSize: '16px' }} />}
                    label={formatTime(timeRemaining)}
                    color={getTimerColor()}
                    variant='outlined'
                    size='small'
                    sx={{ fontWeight: 600, minWidth: 80 }}
                  />
                )}
                <IconButton onClick={handleShowCancelConfirm} disabled={isProcessing} size='small'>
                  <i className='tabler-x' />
                </IconButton>
              </Box>
            </Box>
            {travel && (
              <Box sx={{ pl: { xs: 0, sm: 7 }, borderLeft: { sm: 'none' } }}>
                <Typography variant='caption' color='primary.main' fontWeight={500}>
                  {travel.route?.officeOrigin?.place?.name || 'N/A'} →{' '}
                  {travel.route?.officeDestination?.place?.name || 'N/A'}
                </Typography>
                <Typography variant='caption' color='text.secondary' sx={{ ml: 1 }}>
                  {formatFullDateTime(travel.departure_time)}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            {/* Mensaje de expiración */}
            {isExpired && (
              <Alert severity='error' icon={<i className='tabler-alert-circle' />}>
                <Typography variant='body2'>
                  El tiempo para completar la venta ha expirado. El ticket ha sido cancelado.
                </Typography>
              </Alert>
            )}

            {/* QR Pagado */}
            {qrStatus === 'paid' && (
              <Alert severity='success' icon={<i className='tabler-check' />}>
                <Typography variant='body2' fontWeight={600}>
                  ¡Pago confirmado exitosamente!
                </Typography>
              </Alert>
            )}

            {/* Sección QR (solo para pago QR y cuando se ha generado) */}
            {paymentMethod === 'qr' && qrImage && !isExpired && (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Box
                  sx={{
                    p: { xs: 1, sm: 2 },
                    bgcolor: 'white',
                    borderRadius: 2,
                    boxShadow: 3,
                    display: 'inline-block',
                    mb: 2
                  }}
                >
                  <img
                    src={qrImage}
                    alt='Código QR de pago'
                    style={{ width: isMobile ? 180 : 220, height: isMobile ? 180 : 220 }}
                  />
                </Box>
                <Box>
                  {qrStatus === 'waiting' && (
                    <Chip
                      icon={<CircularProgress size={14} />}
                      label='Esperando pago...'
                      color='info'
                      variant='outlined'
                    />
                  )}
                  {isVerifying && (
                    <Chip
                      icon={<CircularProgress size={14} />}
                      label='Verificando...'
                      color='warning'
                      variant='outlined'
                    />
                  )}
                </Box>
                <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                  Escanea el código QR con tu aplicación bancaria
                </Typography>
                <Divider sx={{ my: 2 }} />
              </Box>
            )}

            {/* Info del cliente */}
            {!isExpired && qrStatus !== 'paid' && (
              <Alert severity='info' icon={<i className='tabler-info-circle' />}>
                <Typography variant={isMobile ? 'caption' : 'body2'}>
                  Asigna un pasajero a cada asiento. Cliente: <strong>{(ticket as any)?.buyer?.name}</strong>
                </Typography>
              </Alert>
            )}

            {/* Lista de asientos (ocultar si expiró o pago completado) */}
            {!isExpired && qrStatus !== 'paid' && (
              <>
                {ticket.travelSeats.map(seat => {
                  const assignedPassenger = assignments[seat.seatNumber]

                  return (
                    <Card key={seat.seatNumber} variant='outlined'>
                      <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
                        <Box
                          display='flex'
                          flexDirection={{ xs: 'column', sm: 'row' }}
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                          justifyContent='space-between'
                          gap={2}
                        >
                          <Box display='flex' alignItems='center' gap={1} flexWrap='wrap'>
                            <Chip
                              label={`Asiento ${seat.seatNumber}`}
                              color='primary'
                              variant='tonal'
                              size={isMobile ? 'small' : 'medium'}
                              icon={<i className='tabler-armchair' />}
                            />
                            {seat.deck && (
                              <Chip label={`Piso ${seat.deck}`} size='small' color='secondary' variant='outlined' />
                            )}
                            <Typography variant='body2' color='text.secondary'>
                              Bs. {seat.price}
                            </Typography>
                          </Box>

                          <Box display='flex' alignItems='center' gap={1} width={{ xs: '100%', sm: 'auto' }}>
                            {assignedPassenger ? (
                              editingSeat === seat.seatNumber ? (
                                <Box display='flex' alignItems='center' gap={0.5} width='100%'>
                                  <CustomTextField
                                    size='small'
                                    value={editedName}
                                    onChange={e => setEditedName(e.target.value)}
                                    placeholder='Nombre del pasajero'
                                    autoFocus
                                    sx={{ minWidth: { xs: 120, sm: 180 } }}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault()
                                        handleSaveEdit()
                                      }

                                      if (e.key === 'Escape') {
                                        handleShowCancelConfirmEdit()
                                      }
                                    }}
                                  />
                                  <IconButton size='small' color='success' onClick={handleSaveEdit}>
                                    <i className='tabler-check' style={{ fontSize: '16px' }} />
                                  </IconButton>
                                  <IconButton size='small' color='error' onClick={handleShowCancelConfirmEdit}>
                                    <i className='tabler-x' style={{ fontSize: '16px' }} />
                                  </IconButton>
                                </Box>
                              ) : (
                                <Box display='flex' alignItems='center' gap={0.5}>
                                  <Chip
                                    label={`${assignedPassenger.fullName} - CI: ${assignedPassenger.ci}`}
                                    color='success'
                                    variant='outlined'
                                    size={isMobile ? 'small' : 'medium'}
                                    sx={{
                                      maxWidth: { xs: '100%', sm: 'none' },
                                      '& .MuiChip-label': {
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                      }
                                    }}
                                  />
                                  <IconButton
                                    size='small'
                                    color='primary'
                                    onClick={() => handleStartEdit(seat.seatNumber)}
                                    disabled={isProcessing || qrStatus === 'waiting'}
                                  >
                                    <i className='tabler-pencil' style={{ fontSize: '16px' }} />
                                  </IconButton>
                                  <IconButton
                                    size='small'
                                    color='error'
                                    onClick={() => handleRemoveAssignment(seat.seatNumber)}
                                    disabled={isProcessing || qrStatus === 'waiting'}
                                  >
                                    <i className='tabler-trash' style={{ fontSize: '16px' }} />
                                  </IconButton>
                                </Box>
                              )
                            ) : (
                              <Button
                                variant='outlined'
                                size='small'
                                startIcon={<i className='tabler-user-plus' />}
                                onClick={() => handleOpenSelectModal(seat.seatNumber)}
                                disabled={isProcessing || qrStatus === 'waiting'}
                                fullWidth={isMobile}
                              >
                                {isMobile ? 'Asignar' : 'Asignar Pasajero'}
                              </Button>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  )
                })}
              </>
            )}

            {/* Total */}
            <Box
              sx={{
                p: { xs: 1.5, sm: 2 },
                bgcolor: 'success.lighter',
                borderRadius: 1,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'center', sm: 'center' },
                gap: { xs: 0.5, sm: 0 }
              }}
            >
              <Typography variant={isMobile ? 'body1' : 'h6'} fontWeight='bold'>
                Total a pagar:
              </Typography>
              <Typography variant={isMobile ? 'h6' : 'h5'} color='success.main' fontWeight='bold'>
                Bs. {ticket.total_price}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            pb: { xs: 2, sm: 3 },
            gap: { xs: 1, sm: 2 },
            flexDirection: { xs: 'column', sm: 'row' }
          }}
        >
          {/* Botones según estado y método de pago */}
          {!isExpired && qrStatus !== 'paid' && (
            <>
              {paymentMethod === 'cash' ? (
                <>
                  <Button
                    onClick={handleShowCancelConfirm}
                    variant='outlined'
                    color='error'
                    fullWidth={isMobile}
                    disabled={isProcessing}
                    startIcon={isCancelling ? <CircularProgress size={16} /> : <i className='tabler-x' />}
                    sx={{ flex: { sm: 1 }, order: { xs: 2, sm: 1 } }}
                  >
                    {isCancelling ? 'Cancelando...' : 'Cancelar Venta'}
                  </Button>
                  <Button
                    onClick={() => handleAssignAndProceed('confirm')}
                    variant='contained'
                    color='success'
                    fullWidth={isMobile}
                    disabled={isProcessing}
                    startIcon={
                      isConfirming || isAssigning ? <CircularProgress size={16} /> : <i className='tabler-check' />
                    }
                    sx={{ flex: { sm: 1 }, order: { xs: 1, sm: 2 } }}
                  >
                    {isAssigning ? 'Asignando...' : isConfirming ? 'Confirmando...' : 'Confirmar Pago'}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleShowCancelConfirm}
                    variant='outlined'
                    color='error'
                    fullWidth={isMobile}
                    disabled={isProcessing || isVerifying}
                    startIcon={isCancelling ? <CircularProgress size={16} /> : <i className='tabler-x' />}
                    sx={{ flex: { sm: 1 }, order: { xs: 2, sm: 1 } }}
                  >
                    {isCancelling ? 'Cancelando...' : 'Cancelar Venta'}
                  </Button>
                  {!qrImage ? (
                    <Button
                      onClick={() => handleAssignAndProceed('generateQR')}
                      variant='contained'
                      color='info'
                      fullWidth={isMobile}
                      disabled={isProcessing || qrStatus === 'generating'}
                      startIcon={
                        qrStatus === 'generating' || isAssigning ? (
                          <CircularProgress size={16} />
                        ) : (
                          <i className='tabler-qrcode' />
                        )
                      }
                      sx={{ flex: { sm: 1 }, order: { xs: 1, sm: 2 } }}
                    >
                      {isAssigning ? 'Asignando...' : qrStatus === 'generating' ? 'Generando...' : 'Generar QR'}
                    </Button>
                  ) : (
                    <Button
                      variant='contained'
                      color='info'
                      fullWidth={isMobile}
                      disabled
                      startIcon={<CircularProgress size={16} />}
                      sx={{ flex: { sm: 1 }, order: { xs: 1, sm: 2 } }}
                    >
                      Esperando pago...
                    </Button>
                  )}
                </>
              )}
            </>
          )}

          {/* Botón cerrar cuando expiró */}
          {isExpired && (
            <Button onClick={onClose} variant='contained' color='primary' fullWidth>
              Cerrar
            </Button>
          )}

          {/* Cuando el pago QR es exitoso, mostrar botón que navega al éxito */}
          {qrStatus === 'paid' && !isExpired && (
            <Button
              onClick={onPaymentSuccess}
              variant='contained'
              color='success'
              fullWidth
              startIcon={<i className='tabler-check' />}
            >
              Continuar
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal de búsqueda de pasajero */}
      <Dialog
        open={openSelectModal}
        onClose={() => setOpenSelectModal(false)}
        maxWidth='sm'
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box display='flex' alignItems='center' justifyContent='space-between'>
            <Typography variant={isMobile ? 'body1' : 'h6'} fontWeight={600}>
              Buscar Pasajero - Asiento {selectedSeat}
            </Typography>
            <IconButton onClick={() => setOpenSelectModal(false)} size='small'>
              <i className='tabler-x' />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {showCreateForm ? (
              <Box>
                <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 2 }}>
                  Crear Nuevo Pasajero
                </Typography>
                <Stack spacing={2}>
                  {duplicateCIError && (
                    <Alert severity='error' icon={<i className='tabler-alert-circle' />}>
                      {duplicateCIError}
                    </Alert>
                  )}
                  <CustomTextField
                    label='Nombre Completo'
                    value={newPassengerName}
                    onChange={e => setNewPassengerName(e.target.value)}
                    fullWidth
                    size='small'
                  />
                  <CustomTextField
                    label='CI'
                    value={newPassengerCI}
                    onChange={e => {
                      setNewPassengerCI(e.target.value)
                      setDuplicateCIError(null)
                    }}
                    fullWidth
                    size='small'
                    error={!!duplicateCIError}
                  />
                  <Box display='flex' flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                    <Button
                      variant='contained'
                      color='primary'
                      onClick={handleCreatePassenger}
                      disabled={!newPassengerName.trim() || !newPassengerCI.trim()}
                      startIcon={<i className='tabler-check' />}
                      fullWidth
                    >
                      Agregar Pasajero
                    </Button>
                    <Button
                      variant='outlined'
                      onClick={() => {
                        setShowCreateForm(false)
                        setDuplicateCIError(null)
                      }}
                      fullWidth
                    >
                      Cancelar
                    </Button>
                  </Box>
                </Stack>
              </Box>
            ) : (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1,
                    alignItems: 'flex-end'
                  }}
                >
                  <CustomTextField
                    label='Buscar por CI'
                    placeholder={isMobile ? 'Ingrese CI' : 'Ingrese el CI del pasajero'}
                    value={searchCI}
                    onChange={e => {
                      setSearchCI(e.target.value)
                      setSearchError(null)
                      setFoundPassenger(null)
                    }}
                    onKeyDown={handleSearchKeyDown}
                    fullWidth
                    size='small'
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-id' />
                        </InputAdornment>
                      ),
                      endAdornment: searchPassengerMutation.isPending && (
                        <InputAdornment position='end'>
                          <CircularProgress size={20} />
                        </InputAdornment>
                      )
                    }}
                  />

                  <Button
                    variant='contained'
                    color='primary'
                    onClick={handleSearchPassenger}
                    disabled={searchCI.length < 3 || searchPassengerMutation.isPending}
                    sx={{
                      minWidth: { xs: '100%', sm: 120 },
                      height: 40,
                      flexShrink: 0
                    }}
                  >
                    {searchPassengerMutation.isPending ? (
                      <CircularProgress size={20} color='inherit' />
                    ) : (
                      <>
                        <i className='tabler-search' style={{ marginRight: 6 }} />
                        {!isMobile && 'Buscar'}
                      </>
                    )}
                  </Button>
                </Box>

                {searchError && (
                  <Alert severity='error' icon={<i className='tabler-alert-circle' />}>
                    {searchError}
                  </Alert>
                )}

                {foundPassenger && !searchPassengerMutation.isPending && (
                  <Card
                    variant='outlined'
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                    onClick={() => handleSelectPassenger(foundPassenger)}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
                      <Box
                        display='flex'
                        flexDirection={{ xs: 'column', sm: 'row' }}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        justifyContent='space-between'
                        gap={2}
                      >
                        <Box display='flex' alignItems='center' gap={2}>
                          <Box
                            sx={{
                              width: { xs: 36, sm: 40 },
                              height: { xs: 36, sm: 40 },
                              borderRadius: '50%',
                              bgcolor: 'primary.lighter',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <i
                              className='tabler-user'
                              style={{ fontSize: '20px', color: 'var(--mui-palette-primary-main)' }}
                            />
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant='body1' fontWeight={600} noWrap>
                              {foundPassenger.fullName}
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                              CI: {foundPassenger.ci}
                            </Typography>
                          </Box>
                        </Box>
                        <Button
                          variant='contained'
                          size='small'
                          fullWidth={isMobile}
                          startIcon={<i className='tabler-check' />}
                          onClick={() => handleSelectPassenger(foundPassenger)}
                        >
                          Seleccionar
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                )}

                <Button
                  variant='outlined'
                  startIcon={<i className='tabler-user-plus' />}
                  onClick={() => {
                    setShowCreateForm(true)
                    setNewPassengerCI(searchCI)
                  }}
                  fullWidth
                >
                  Crear Nuevo Pasajero
                </Button>
              </>
            )}
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación de cancelación */}
      <Dialog open={showCancelConfirm} onClose={handleCloseCancelConfirm} maxWidth='xs' fullWidth>
        <DialogTitle>
          <Box display='flex' alignItems='center' gap={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'error.lighter',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i
                className='tabler-alert-triangle'
                style={{ fontSize: '20px', color: 'var(--mui-palette-error-main)' }}
              />
            </Box>
            <Typography variant='h6' fontWeight={600}>
              Confirmar Cancelación
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary'>
            ¿Estás seguro de que deseas cancelar esta venta? El ticket será cancelado y los asientos quedarán
            disponibles nuevamente.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={handleCloseCancelConfirm} variant='outlined' color='secondary' disabled={isCancelling}>
            No, continuar
          </Button>
          <Button
            onClick={handleConfirmCancel}
            variant='contained'
            color='error'
            disabled={isCancelling}
            startIcon={isCancelling ? <CircularProgress size={16} /> : <i className='tabler-x' />}
          >
            {isCancelling ? 'Cancelando...' : 'Sí, cancelar venta'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AssignPassengersDialog
