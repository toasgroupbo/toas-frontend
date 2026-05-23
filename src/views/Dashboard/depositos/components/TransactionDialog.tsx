'use client'

import { useEffect, useState } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material'

import { useProcessTransaction, useVerifyTransaction } from '@/hooks/useDeposits'
import type { Travel } from '@/types/api/deposits'

interface TransactionDialogProps {
  open: boolean
  onClose: () => void
  travel: Travel
}

type DialogMode = 'confirm-process' | 'confirm-verify' | 'loading' | 'error' | 'success' | 'inprogress' | 'failed'

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

const TransactionDialog = ({ open, onClose, travel }: TransactionDialogProps) => {
  const [mode, setMode] = useState<DialogMode>('confirm-process')
  const [error, setError] = useState<string | null>(null)
  const [isVerifyMode, setIsVerifyMode] = useState(false)

  const processTransaction = useProcessTransaction()
  const verifyTransaction = useVerifyTransaction()

  useEffect(() => {
    if (open && travel) {
      setError(null)

      // Determine mode based on transaction status
      if (travel.transaction) {
        const status = travel.transaction.status

        if (status === 'AUTHORIZED' || status === 'IN_PROGRESS') {
          setIsVerifyMode(true)
          setMode('confirm-verify')
        } else if (status === 'FAILED') {
          // Allow retry for failed transactions
          setIsVerifyMode(false)
          setMode('confirm-process')
        } else {
          setIsVerifyMode(false)
          setMode('confirm-process')
        }
      } else {
        setIsVerifyMode(false)
        setMode('confirm-process')
      }
    }
  }, [open, travel])

  const handleProcessTransaction = async () => {
    try {
      setMode('loading')
      setError(null)

      const response = await processTransaction.mutateAsync(travel.id)

      // Show success message based on response
      if (response.status === 'AUTHORIZED') {
        setMode('success')
      } else if (response.status === 'IN_PROGRESS') {
        setMode('inprogress')
      } else if (response.status === 'FAILED') {
        setMode('failed')
      } else {
        setMode('success')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la transacción')
      setMode('error')
    }
  }

  const handleVerifyTransaction = async () => {
    try {
      setMode('loading')
      setError(null)

      if (!travel.transaction?.id) {
        throw new Error('No se encontró el ID de la transacción')
      }

      const response = await verifyTransaction.mutateAsync(travel.transaction.id.toString())

      // Show result based on verification response
      if (response.status === 'COMPLETED') {
        setMode('success')
      } else if (response.status === 'IN_PROGRESS') {
        setMode('inprogress')
      } else if (response.status === 'FAILED') {
        setMode('failed')
      } else {
        setMode('success')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al verificar la transacción')
      setMode('error')
    }
  }

  const handleRetry = () => {
    if (isVerifyMode) {
      handleVerifyTransaction()
    } else {
      handleProcessTransaction()
    }
  }

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value

    return `Bs. ${num.toFixed(2)}`
  }

  const canClose = mode !== 'loading'

  return (
    <Dialog
      open={open}
      onClose={canClose ? onClose : undefined}
      maxWidth='md'
      fullWidth
      disableEscapeKeyDown={!canClose}
    >
      <DialogTitle>
        <Box display='flex' alignItems='center' gap={2}>
          <i className='tabler-cash' style={{ fontSize: '24px' }} />
          <Box>
            <Typography variant='h6'>{isVerifyMode ? 'Verificar Transacción' : 'Procesar Transacción'}</Typography>
            <Typography variant='body2' color='text.secondary'>
              Bus: {travel.bus.plaque} - {travel.bus.name}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Propietario: {travel.bus.owner.name}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Confirm Process Mode */}
        {mode === 'confirm-process' && (
          <Box py={3}>
            <Alert severity='warning' icon={<i className='tabler-alert-triangle' />} sx={{ mb: 3 }}>
              <Typography variant='subtitle2'>¿Estás seguro?</Typography>
              <Typography variant='body2'>Esta acción procesará la transacción bancaria para este viaje.</Typography>
            </Alert>

            <Card variant='outlined'>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Detalles del Viaje
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box display='grid' gridTemplateColumns='1fr 1fr' gap={3}>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Bus
                    </Typography>
                    <Typography variant='body2' fontWeight={600}>
                      {travel.bus.plaque} - {travel.bus.name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Propietario
                    </Typography>
                    <Typography variant='body2' fontWeight={600}>
                      {travel.bus.owner.name}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Banco
                    </Typography>
                    <Typography variant='body2' fontWeight={600}>
                      {getBankName(travel.bus.owner.bankAccount.bankCode)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Nro. Cuenta
                    </Typography>
                    <Typography variant='body2' fontFamily='monospace'>
                      {travel.bus.owner.bankAccount.account}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Titular
                    </Typography>
                    <Typography variant='body2'>{travel.bus.owner.bankAccount.titularName}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Confirm Verify Mode */}
        {mode === 'confirm-verify' && (
          <Box py={3}>
            <Alert severity='info' icon={<i className='tabler-info-circle' />} sx={{ mb: 3 }}>
              <Typography variant='subtitle2'>Verificar Transacción Autorizada</Typography>
              <Typography variant='body2'>
                Esta transacción ya fue autorizada. ¿Deseas verificar su estado con el banco?
              </Typography>
            </Alert>

            <Card variant='outlined'>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Detalles de la Transacción
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box display='grid' gridTemplateColumns='1fr 1fr' gap={3}>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      ID de Transacción
                    </Typography>
                    <Typography variant='body2' fontFamily='monospace'>
                      {travel.transaction?.transactionId}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Estado
                    </Typography>
                    <Typography variant='body2' color='warning.main' fontWeight={600}>
                      {travel.transaction?.status === 'AUTHORIZED' ? 'Autorizado' : travel.transaction?.status}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Bus
                    </Typography>
                    <Typography variant='body2' fontWeight={600}>
                      {travel.bus.plaque} - {travel.bus.name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Propietario
                    </Typography>
                    <Typography variant='body2' fontWeight={600}>
                      {travel.bus.owner.name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Banco
                    </Typography>
                    <Typography variant='body2' fontWeight={600}>
                      {getBankName(travel.bus.owner.bankAccount.bankCode)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Nro. Cuenta
                    </Typography>
                    <Typography variant='body2' fontFamily='monospace'>
                      {travel.bus.owner.bankAccount.account}
                    </Typography>
                  </Box>
                  <Box gridColumn='1 / -1'>
                    <Typography variant='caption' color='text.secondary'>
                      Titular
                    </Typography>
                    <Typography variant='body2' fontWeight={600}>
                      {travel.bus.owner.bankAccount.titularName}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Loading Mode */}
        {mode === 'loading' && (
          <Box display='flex' flexDirection='column' alignItems='center' gap={2} py={6}>
            <CircularProgress size={60} />
            <Typography variant='h6'>
              {isVerifyMode ? 'Verificando transacción...' : 'Procesando transacción...'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Por favor espera
            </Typography>
          </Box>
        )}

        {/* Error Mode */}
        {mode === 'error' && error && (
          <Box py={3}>
            <Alert severity='error' icon={<i className='tabler-alert-circle' />}>
              <Typography variant='subtitle2'>Error</Typography>
              <Typography variant='body2'>{error}</Typography>
            </Alert>
          </Box>
        )}

        {/* Success Mode */}
        {mode === 'success' && (
          <Box py={3}>
            <Alert severity='success' icon={<i className='tabler-circle-check' />}>
              <Typography variant='subtitle2'>
                {isVerifyMode ? 'Pago Verificado Exitosamente' : 'Pago Procesado Exitosamente'}
              </Typography>
              <Typography variant='body2'>
                {isVerifyMode
                  ? 'La transacción ha sido completada y el pago se realizó correctamente.'
                  : 'La transacción ha sido autorizada exitosamente.'}
              </Typography>
            </Alert>
          </Box>
        )}

        {/* In Progress Mode */}
        {mode === 'inprogress' && (
          <Box py={3}>
            <Alert severity='warning' icon={<i className='tabler-clock' />}>
              <Typography variant='subtitle2'>Pago En Proceso</Typography>
              <Typography variant='body2'>
                La transacción está siendo procesada por el banco. Por favor, vuelva a verificar más tarde.
              </Typography>
            </Alert>
          </Box>
        )}

        {/* Failed Mode */}
        {mode === 'failed' && (
          <Box py={3}>
            <Alert severity='error' icon={<i className='tabler-x' />}>
              <Typography variant='subtitle2'>Pago Fallido</Typography>
              <Typography variant='body2'>
                El pago ha fallado por completo. Puede volver a intentar realizar el pago nuevamente.
              </Typography>
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {mode === 'confirm-process' && (
          <>
            <Button onClick={onClose} variant='outlined'>
              Cancelar
            </Button>
            <Button onClick={handleProcessTransaction} variant='contained' color='primary'>
              Confirmar y Procesar
            </Button>
          </>
        )}

        {mode === 'confirm-verify' && (
          <>
            <Button onClick={onClose} variant='outlined'>
              Cancelar
            </Button>
            <Button onClick={handleVerifyTransaction} variant='contained' color='primary'>
              Verificar Transacción
            </Button>
          </>
        )}

        {mode === 'error' && (
          <>
            <Button onClick={onClose} variant='outlined'>
              Cerrar
            </Button>
            <Button onClick={handleRetry} variant='contained' color='primary'>
              Reintentar
            </Button>
          </>
        )}

        {mode === 'success' && (
          <Button onClick={onClose} variant='contained' color='primary'>
            Aceptar
          </Button>
        )}

        {mode === 'inprogress' && (
          <Button onClick={onClose} variant='contained' color='primary'>
            Entendido
          </Button>
        )}

        {mode === 'failed' && (
          <Button onClick={onClose} variant='contained' color='primary'>
            Cerrar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default TransactionDialog
