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
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material'

import { useProcessTransaction, useVerifyTransaction } from '@/hooks/useDeposits'
import type { Travel } from '@/types/api/deposits'
import type { ProcessTransactionResponse, VerifyTransactionResponse } from '@/types/api/transactions'

interface TransactionDialogProps {
  open: boolean
  onClose: () => void
  travel: Travel
}

const TransactionDialog = ({ open, onClose, travel }: TransactionDialogProps) => {
  const [activeStep, setActiveStep] = useState(-1) // -1 = confirmation step
  const [processResponse, setProcessResponse] = useState<ProcessTransactionResponse | null>(null)
  const [verifyResponse, setVerifyResponse] = useState<VerifyTransactionResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const processTransaction = useProcessTransaction()
  const verifyTransaction = useVerifyTransaction()

  const steps = ['Procesar Transacción', 'Autorización', 'Verificación', 'Completado']

  useEffect(() => {
    if (open && travel) {
      // Reset state when dialog opens
      setVerifyResponse(null)
      setError(null)

      // If travel already has AUTHORIZED transaction, skip to verification
      if (travel.transaction && travel.transaction.status === 'AUTHORIZED') {
        setProcessResponse({
          id: travel.transaction.id,
          transactionId: travel.transaction.transactionId,
          status: travel.transaction.status,
          processRequest: { spreadsheet: [] }, // Empty for existing transactions
          createdAt: '',
          updatedAt: ''
        })
        setActiveStep(-2) // Special step for verify-only confirmation
      } else {
        setActiveStep(-1) // Normal confirmation step
        setProcessResponse(null)
      }
    }
  }, [open, travel])

  const handleProcessTransaction = async () => {
    try {
      setActiveStep(0)
      setError(null)

      // Step 1: Process transaction
      const response = await processTransaction.mutateAsync(travel.id)

      setProcessResponse(response)
      setActiveStep(1)

      // Automatically proceed to verification if status is AUTHORIZED
      if (response.status === 'AUTHORIZED') {
        setTimeout(() => {
          handleVerifyTransaction(response.id)
        }, 1500) // Small delay to show the authorization step
      } else {
        setError('La transacción no fue autorizada')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la transacción')
      setActiveStep(0)
    }
  }

  const handleVerifyTransaction = async (transactionId: number) => {
    try {
      setActiveStep(2)
      setError(null)

      // Step 2: Verify transaction - use the id (not transactionId string)
      const response = await verifyTransaction.mutateAsync(transactionId.toString())

      setVerifyResponse(response)

      if (response.status === 'COMPLETED') {
        setActiveStep(3)
      } else {
        setError('La verificación de la transacción falló')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al verificar la transacción')
      setActiveStep(2)
    }
  }

  const handleRetryVerification = () => {
    if (processResponse) {
      handleVerifyTransaction(processResponse.id)
    }
  }

  const handleStartVerification = () => {
    if (processResponse) {
      handleVerifyTransaction(processResponse.id)
    }
  }

  const handleClose = () => {
    if (activeStep === 3 || error) {
      onClose()
    }
  }

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value

    return `Bs. ${num.toFixed(2)}`
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' gap={2}>
          <i className='tabler-cash' style={{ fontSize: '24px' }} />
          <Box>
            <Typography variant='h6'>
              {activeStep === -2 ? 'Verificar Transacción' : 'Procesar Transacción'}
            </Typography>
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
        {/* Step -2: Verify-only Confirmation */}
        {activeStep === -2 && (
          <Box py={3}>
            <Alert severity='info' icon={<i className='tabler-info-circle' />} sx={{ mb: 3 }}>
              <Typography variant='subtitle2'>Verificar Transacción Autorizada</Typography>
              <Typography variant='body2'>
                Esta transacción ya fue autorizada previamente. ¿Deseas verificar su estado con el banco?
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
                      {travel.transaction?.status}
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
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Step -1: Confirmation */}
        {activeStep === -1 && (
          <Box py={3}>
            <Alert severity='warning' icon={<i className='tabler-alert-triangle' />} sx={{ mb: 3 }}>
              <Typography variant='subtitle2'>¿Estás seguro?</Typography>
              <Typography variant='body2'>
                Esta acción procesará la transacción bancaria para este viaje. Una vez iniciado el proceso no se puede cancelar.
              </Typography>
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
                      Salida
                    </Typography>
                    <Typography variant='body2'>
                      {new Date(travel.departure_time).toLocaleString('es-PE')}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Llegada
                    </Typography>
                    <Typography variant='body2'>
                      {new Date(travel.arrival_time).toLocaleString('es-PE')}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Monto App
                    </Typography>
                    <Typography variant='body2' color='primary.main' fontWeight={600}>
                      {formatCurrency(travel.app_amount)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Comisión Total
                    </Typography>
                    <Typography variant='body2' color='success.main' fontWeight={600}>
                      {formatCurrency(travel.total_commission)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Cuenta Bancaria
                    </Typography>
                    <Typography variant='body2' fontFamily='monospace'>
                      {travel.bus.owner.bankAccount.account}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Titular
                    </Typography>
                    <Typography variant='body2'>
                      {travel.bus.owner.bankAccount.titularName}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {activeStep >= 0 && (
          <>
            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map(label => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Error Alert */}
            {error && (
              <Alert severity='error' sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Step 0: Processing */}
            {activeStep === 0 && !error && (
              <Box display='flex' flexDirection='column' alignItems='center' gap={2} py={4}>
                <CircularProgress size={60} />
                <Typography variant='h6'>Procesando transacción...</Typography>
                <Typography variant='body2' color='text.secondary'>
                  Iniciando el proceso de pago
                </Typography>
              </Box>
            )}
          </>
        )}

        {/* Step 1: Authorized */}
        {activeStep === 1 && processResponse && (
          <Box>
            <Alert severity='info' icon={<i className='tabler-checks' />} sx={{ mb: 3 }}>
              <Typography variant='subtitle2'>Transacción Autorizada</Typography>
              <Typography variant='body2'>
                ID: {processResponse.transactionId}
              </Typography>
            </Alert>

            <Card variant='outlined'>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Detalles del Pago
                </Typography>
                <Divider sx={{ my: 2 }} />
                <List>
                  {processResponse.processRequest.spreadsheet.map((item, index) => (
                    <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2 }}>
                      <Box width='100%'>
                        <Typography variant='subtitle2' color='primary'>
                          Destinatario #{index + 1}
                        </Typography>
                        <Box display='grid' gridTemplateColumns='1fr 1fr' gap={2} mt={1}>
                          <Box>
                            <Typography variant='caption' color='text.secondary'>
                              Correo
                            </Typography>
                            <Typography variant='body2'>{item.mail}</Typography>
                          </Box>
                          <Box>
                            <Typography variant='caption' color='text.secondary'>
                              Monto
                            </Typography>
                            <Typography variant='body2' fontWeight={600}>
                              {formatCurrency(item.amount)}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant='caption' color='text.secondary'>
                              Titular
                            </Typography>
                            <Typography variant='body2'>{item.titularName}</Typography>
                          </Box>
                          <Box>
                            <Typography variant='caption' color='text.secondary'>
                              Cuenta
                            </Typography>
                            <Typography variant='body2' fontFamily='monospace'>
                              {item.accountNumber}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      {index < processResponse.processRequest.spreadsheet.length - 1 && (
                        <Divider sx={{ width: '100%', mt: 2 }} />
                      )}
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            <Box display='flex' alignItems='center' justifyContent='center' gap={2} mt={3}>
              <CircularProgress size={24} />
              <Typography variant='body2' color='text.secondary'>
                Verificando transacción...
              </Typography>
            </Box>
          </Box>
        )}

        {/* Step 2: Verifying */}
        {activeStep === 2 && !verifyResponse && (
          <Box display='flex' flexDirection='column' alignItems='center' gap={2} py={4}>
            <CircularProgress size={60} />
            <Typography variant='h6'>Verificando transacción...</Typography>
            <Typography variant='body2' color='text.secondary'>
              Confirmando el pago con el banco
            </Typography>
          </Box>
        )}

        {/* Step 3: Completed */}
        {activeStep === 3 && verifyResponse && (
          <Box>
            <Alert severity='success' icon={<i className='tabler-circle-check' />} sx={{ mb: 3 }}>
              <Typography variant='subtitle2'>Transacción Completada Exitosamente</Typography>
              <Typography variant='body2'>
                ID: {verifyResponse.transactionId}
              </Typography>
            </Alert>

            {verifyResponse.batchDetailResponse && (
              <Card variant='outlined'>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    Resumen de la Operación
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box display='grid' gridTemplateColumns='1fr 1fr' gap={3}>
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        ID de Operación
                      </Typography>
                      <Typography variant='body2' fontFamily='monospace'>
                        {verifyResponse.batchDetailResponse.operationId}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Estado
                      </Typography>
                      <Typography variant='body2' color='success.main' fontWeight={600}>
                        {verifyResponse.batchDetailResponse.status}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Total de Operaciones
                      </Typography>
                      <Typography variant='body2'>
                        {verifyResponse.batchDetailResponse.totalOperations}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Operaciones Exitosas
                      </Typography>
                      <Typography variant='body2' color='success.main'>
                        {verifyResponse.batchDetailResponse.successfulOperations}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Operaciones Fallidas
                      </Typography>
                      <Typography variant='body2' color={verifyResponse.batchDetailResponse.failedOperations > 0 ? 'error.main' : 'text.secondary'}>
                        {verifyResponse.batchDetailResponse.failedOperations}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Fecha de Creación
                      </Typography>
                      <Typography variant='body2'>
                        {new Date(verifyResponse.batchDetailResponse.createdAt).toLocaleString('es-PE')}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Fecha de Completado
                      </Typography>
                      <Typography variant='body2'>
                        {new Date(verifyResponse.batchDetailResponse.completedAt).toLocaleString('es-PE')}
                      </Typography>
                    </Box>
                  </Box>

                  {verifyResponse.batchDetailResponse.userActions && verifyResponse.batchDetailResponse.userActions.length > 0 && (
                    <>
                      <Divider sx={{ my: 3 }} />
                      <Typography variant='subtitle2' gutterBottom>
                        Acciones del Usuario
                      </Typography>
                      <List dense>
                        {verifyResponse.batchDetailResponse.userActions.map((action, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={action.action}
                              secondary={`Usuario: ${action.userId} - ${new Date(action.timestamp).toLocaleString('es-PE')}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {activeStep === -2 ? (
          <>
            <Button onClick={onClose} variant='outlined'>
              Cancelar
            </Button>
            <Button onClick={handleStartVerification} variant='contained' color='primary'>
              Verificar Transacción
            </Button>
          </>
        ) : activeStep === -1 ? (
          <>
            <Button onClick={onClose} variant='outlined'>
              Cancelar
            </Button>
            <Button onClick={handleProcessTransaction} variant='contained' color='primary'>
              Confirmar y Procesar
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleClose}
              variant={activeStep === 3 ? 'contained' : 'outlined'}
              disabled={activeStep >= 0 && activeStep < 3 && !error}
            >
              {activeStep === 3 ? 'Finalizar' : 'Cerrar'}
            </Button>
            {error && activeStep === 2 && (
              <Button onClick={handleRetryVerification} variant='contained' color='primary'>
                Volver a Intentar Verificación
              </Button>
            )}
            {error && activeStep !== 2 && (
              <Button onClick={handleProcessTransaction} variant='contained' color='primary'>
                Reintentar
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default TransactionDialog
