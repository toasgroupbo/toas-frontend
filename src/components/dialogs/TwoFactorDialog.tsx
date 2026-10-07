'use client'

import { useState } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Divider,
  IconButton
} from '@mui/material'

import { useGenerate2FA, useEnable2FA, useDisable2FA } from '@/hooks/useTwoFactor'

interface TwoFactorDialogProps {
  open: boolean
  onClose: () => void
  isTwoFactorEnabled: boolean
  onSuccess: (enabled: boolean) => void
}

type DialogStep = 'initial' | 'password' | 'qr' | 'disable'

const TwoFactorDialog = ({ open, onClose, isTwoFactorEnabled, onSuccess }: TwoFactorDialogProps) => {
  const [step, setStep] = useState<DialogStep>('initial')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [qrData, setQrData] = useState<{ qrCode: string; secret: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateMutation = useGenerate2FA()
  const enableMutation = useEnable2FA()
  const disableMutation = useDisable2FA()

  const resetState = () => {
    setStep('initial')
    setPassword('')
    setCode('')
    setQrData(null)
    setError(null)
    generateMutation.reset()
    enableMutation.reset()
    disableMutation.reset()
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const getErrorMessage = (err: any): string => {
    const message = err?.response?.data?.message?.toLowerCase() || ''

    if (message.includes('invalid password')) {
      return 'Contraseña incorrecta'
    }

    if (message.includes('invalid 2fa code')) {
      return 'Código incorrecto. Verifica que el código sea el actual'
    }

    if (message.includes('already enabled')) {
      return 'La verificación en dos pasos ya está activada'
    }

    if (message.includes('not enabled')) {
      return 'La verificación en dos pasos no está activada'
    }

    if (message.includes('generate a 2fa secret first')) {
      return 'Debes escanear el código QR primero'
    }

    return err?.response?.data?.message || 'Error inesperado. Intenta nuevamente'
  }

  const handleStartActivation = () => {
    setStep('password')
    setError(null)
  }

  const handleStartDeactivation = () => {
    setStep('disable')
    setError(null)
  }

  const handleGenerateQR = async () => {
    setError(null)

    try {
      const data = await generateMutation.mutateAsync({ password })

      setQrData({ qrCode: data.qrCode, secret: data.secret })
      setStep('qr')
      setPassword('')
    } catch (err: any) {
      setError(getErrorMessage(err))
    }
  }

  const handleEnableTwoFactor = async () => {
    if (code.length !== 6) return

    setError(null)

    try {
      await enableMutation.mutateAsync({ code })
      onSuccess(true)
      handleClose()
    } catch (err: any) {
      setError(getErrorMessage(err))
      setCode('')
    }
  }

  const handleDisableTwoFactor = async () => {
    if (code.length !== 6) return

    setError(null)

    try {
      await disableMutation.mutateAsync({ code })
      onSuccess(false)
      handleClose()
    } catch (err: any) {
      setError(getErrorMessage(err))
      setCode('')
    }
  }

  const formatSecret = (secret: string): string => {
    return secret.match(/.{1,4}/g)?.join(' ') || secret
  }

  const isLoading = generateMutation.isPending || enableMutation.isPending || disableMutation.isPending

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' gap={2}>
          <i className='tabler-shield-lock' style={{ fontSize: 24 }} />
          <Typography variant='h6'>Verificación en dos pasos</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {step === 'initial' && (
          <Box py={2}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                bgcolor: isTwoFactorEnabled ? 'success.lighter' : 'grey.100',
                borderRadius: 1,
                mb: 3
              }}
            >
              <i
                className={isTwoFactorEnabled ? 'tabler-shield-check' : 'tabler-shield-off'}
                style={{ fontSize: 32, color: isTwoFactorEnabled ? '#4caf50' : '#9e9e9e' }}
              />
              <Box>
                <Typography variant='subtitle1' fontWeight={600}>
                  {isTwoFactorEnabled ? 'Activada' : 'Desactivada'}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {isTwoFactorEnabled
                    ? 'Tu cuenta está protegida con verificación en dos pasos'
                    : 'Agrega una capa extra de seguridad a tu cuenta'}
                </Typography>
              </Box>
            </Box>

            <Typography variant='body2' color='text.secondary' paragraph>
              La verificación en dos pasos agrega seguridad adicional a tu cuenta. Después de activarla, necesitarás tu
              contraseña y un código de tu aplicación de autenticación para iniciar sesión.
            </Typography>

            <Typography variant='body2' color='text.secondary'>
              Aplicaciones compatibles: Google Authenticator, Microsoft Authenticator, Authy, 1Password.
            </Typography>
          </Box>
        )}

        {step === 'password' && (
          <Box py={2}>
            <Alert severity='info' sx={{ mb: 3 }}>
              Para activar la verificación en dos pasos, confirma tu contraseña actual.
            </Alert>

            {error && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              autoFocus
              fullWidth
              type='password'
              label='Contraseña actual'
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && password) {
                  handleGenerateQR()
                }
              }}
              disabled={isLoading}
            />
          </Box>
        )}

        {step === 'qr' && qrData && (
          <Box py={2}>
            <Stepper activeStep={1} alternativeLabel sx={{ mb: 3 }}>
              <Step completed>
                <StepLabel>Confirmar contraseña</StepLabel>
              </Step>
              <Step>
                <StepLabel>Escanear código</StepLabel>
              </Step>
              <Step>
                <StepLabel>Verificar</StepLabel>
              </Step>
            </Stepper>

            <Box textAlign='center' mb={3}>
              <Typography variant='subtitle1' gutterBottom>
                Escanea este código QR con tu aplicación
              </Typography>
              <Box
                component='img'
                src={qrData.qrCode}
                alt='Código QR para 2FA'
                sx={{
                  width: 200,
                  height: 200,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1
                }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box mb={3}>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                ¿No puedes escanear? Ingresa esta clave manualmente:
              </Typography>
              <Box
                sx={{
                  bgcolor: 'grey.100',
                  p: 1.5,
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  letterSpacing: '0.1em',
                  textAlign: 'center',
                  wordBreak: 'break-all'
                }}
              >
                {formatSecret(qrData.secret)}
              </Box>
            </Box>

            {error && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Typography variant='subtitle2' gutterBottom>
              Ingresa el código de 6 dígitos de la aplicación:
            </Typography>
            <TextField
              autoFocus
              fullWidth
              label='Código de verificación'
              placeholder='000000'
              value={code}
              onChange={e => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6)

                setCode(value)
                setError(null)
              }}
              inputProps={{
                inputMode: 'numeric',
                autoComplete: 'one-time-code',
                style: { textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.5rem' }
              }}
              disabled={isLoading}
            />
          </Box>
        )}

        {step === 'disable' && (
          <Box py={2}>
            <Alert severity='warning' sx={{ mb: 3 }}>
              Para desactivar la verificación en dos pasos, ingresa el código actual de tu aplicación.
            </Alert>

            {error && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              autoFocus
              fullWidth
              label='Código de verificación'
              placeholder='000000'
              value={code}
              onChange={e => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6)

                setCode(value)
                setError(null)
              }}
              inputProps={{
                inputMode: 'numeric',
                autoComplete: 'one-time-code',
                style: { textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.5rem' }
              }}
              disabled={isLoading}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        {step === 'initial' && (
          <>
            <Button onClick={handleClose} color='secondary'>
              Cerrar
            </Button>
            {isTwoFactorEnabled ? (
              <Button onClick={handleStartDeactivation} color='error' variant='contained'>
                Desactivar
              </Button>
            ) : (
              <Button onClick={handleStartActivation} color='primary' variant='contained'>
                Activar
              </Button>
            )}
          </>
        )}

        {step === 'password' && (
          <>
            <Button onClick={() => setStep('initial')} color='secondary' disabled={isLoading}>
              Volver
            </Button>
            <Button
              onClick={handleGenerateQR}
              color='primary'
              variant='contained'
              disabled={!password || isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Verificando...' : 'Continuar'}
            </Button>
          </>
        )}

        {step === 'qr' && (
          <>
            <Button onClick={() => setStep('initial')} color='secondary' disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              onClick={handleEnableTwoFactor}
              color='primary'
              variant='contained'
              disabled={code.length !== 6 || isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Activando...' : 'Activar'}
            </Button>
          </>
        )}

        {step === 'disable' && (
          <>
            <Button onClick={() => setStep('initial')} color='secondary' disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              onClick={handleDisableTwoFactor}
              color='error'
              variant='contained'
              disabled={code.length !== 6 || isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Desactivando...' : 'Desactivar'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default TwoFactorDialog
