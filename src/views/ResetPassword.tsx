'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'

import type { SystemMode } from '@core/types'

import CustomTextField from '@core/components/mui/TextField'
import AuthIllustrationWrapper from './AuthIllustrationWrapper'
import { useResetPassword } from '@/hooks/usePasswordRecovery'

const ResetPassword = ({ mode }: { mode: SystemMode }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [tokenData, setTokenData] = useState<{ token: string; email: string } | null>(null)
  const [isInvalidLink, setIsInvalidLink] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({})
  const [success, setSuccess] = useState(false)

  const resetPasswordMutation = useResetPassword()

  useEffect(() => {
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      setIsInvalidLink(true)

      return
    }

    setTokenData({ token, email })

    window.history.replaceState(null, '', '/reset-password')
  }, [searchParams])

  const validateForm = (): boolean => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {}

    if (!newPassword) {
      newErrors.newPassword = 'La contraseña es requerida'
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres'
    } else if (newPassword.length > 50) {
      newErrors.newPassword = 'La contraseña no puede tener más de 50 caracteres'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña'
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const getErrorMessage = (error: any): string => {
    const message = error?.response?.data?.message

    if (typeof message === 'string') {
      if (message.toLowerCase().includes('invalid or expired')) {
        return 'El enlace no es válido o ya venció. Solicita uno nuevo.'
      }

      return message
    }

    if (Array.isArray(message)) {
      return message.join('. ')
    }

    return 'Error al restablecer la contraseña. Intenta nuevamente.'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !tokenData) return

    try {
      await resetPasswordMutation.mutateAsync({
        email: tokenData.email,
        token: tokenData.token,
        newPassword
      })
      setSuccess(true)
    } catch (error: any) {
      console.error('Error:', error)

      if (error?.response?.data?.message?.toLowerCase().includes('invalid or expired')) {
        setTokenData(null)
        setIsInvalidLink(true)
      }
    }
  }

  const renderInvalidLink = () => (
    <Box textAlign='center' py={2}>
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: 'error.lighter',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 3
        }}
      >
        <i className='tabler-link-off' style={{ fontSize: 40, color: '#f44336' }} />
      </Box>

      <Typography variant='h5' gutterBottom>
        Enlace inválido
      </Typography>

      <Typography color='text.secondary' paragraph>
        El enlace no es válido o ya venció. Los enlaces de recuperación expiran en 30 minutos y solo se pueden usar una
        vez.
      </Typography>

      <Button
        component={Link}
        href='/forgot-password'
        fullWidth
        variant='contained'
        sx={{ mt: 2 }}
      >
        Solicitar nuevo enlace
      </Button>

      <Button
        component={Link}
        href='/login'
        fullWidth
        variant='text'
        color='secondary'
        sx={{ mt: 1 }}
      >
        Volver al inicio de sesión
      </Button>
    </Box>
  )

  const renderSuccess = () => (
    <Box textAlign='center' py={2}>
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: 'success.lighter',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 3
        }}
      >
        <i className='tabler-circle-check' style={{ fontSize: 40, color: '#4caf50' }} />
      </Box>

      <Typography variant='h5' gutterBottom>
        Contraseña actualizada
      </Typography>

      <Typography color='text.secondary' paragraph>
        Tu contraseña se ha restablecido correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
      </Typography>

      <Button
        component={Link}
        href='/login'
        fullWidth
        variant='contained'
        sx={{ mt: 2 }}
      >
        Iniciar sesión
      </Button>
    </Box>
  )

  const renderForm = () => (
    <>
      <div className='flex flex-col gap-1 mbe-6'>
        <Typography variant='h4'>Restablecer contraseña</Typography>
        <Typography>Ingresa tu nueva contraseña para la cuenta {tokenData?.email}</Typography>
      </div>

      {resetPasswordMutation.isError && (
        <Alert severity='error' sx={{ mb: 3 }}>
          <Typography variant='body2'>{getErrorMessage(resetPasswordMutation.error)}</Typography>
        </Alert>
      )}

      <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-6'>
        <CustomTextField
          autoFocus
          fullWidth
          label='Nueva contraseña'
          placeholder='Mínimo 6 caracteres'
          type={showPassword ? 'text' : 'password'}
          value={newPassword}
          onChange={e => {
            setNewPassword(e.target.value)
            setErrors(prev => ({ ...prev, newPassword: undefined }))

            if (resetPasswordMutation.isError) {
              resetPasswordMutation.reset()
            }
          }}
          error={!!errors.newPassword}
          helperText={errors.newPassword}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton edge='end' onClick={() => setShowPassword(!showPassword)}>
                    <i className={showPassword ? 'tabler-eye-off' : 'tabler-eye'} />
                  </IconButton>
                </InputAdornment>
              )
            }
          }}
        />

        <CustomTextField
          fullWidth
          label='Confirmar contraseña'
          placeholder='Repite tu contraseña'
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={e => {
            setConfirmPassword(e.target.value)
            setErrors(prev => ({ ...prev, confirmPassword: undefined }))
          }}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton edge='end' onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <i className={showConfirmPassword ? 'tabler-eye-off' : 'tabler-eye'} />
                  </IconButton>
                </InputAdornment>
              )
            }
          }}
        />

        <Button
          fullWidth
          variant='contained'
          type='submit'
          disabled={resetPasswordMutation.isPending}
          startIcon={resetPasswordMutation.isPending ? <CircularProgress size={20} /> : null}
        >
          {resetPasswordMutation.isPending ? 'Restableciendo...' : 'Restablecer contraseña'}
        </Button>

        <Button
          component={Link}
          href='/login'
          fullWidth
          variant='text'
          color='secondary'
          startIcon={<i className='tabler-arrow-left' />}
        >
          Volver al inicio de sesión
        </Button>
      </form>
    </>
  )

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <meta name='referrer' content='no-referrer' />

      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          minWidth: '100%',
          minHeight: '100%',
          width: 'auto',
          height: 'auto',
          transform: 'translate(-50%, -50%)',
          zIndex: -1,
          objectFit: 'cover'
        }}
      >
        <source src='/videos/videofondo.mp4' type='video/mp4' />
        <source src='/videos/background-login.webm' type='video/webm' />
      </video>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <AuthIllustrationWrapper>
          <Card className='flex flex-col sm:is-[450px]'>
            <CardContent className='sm:!p-12'>
              <Link href='/login' className='flex justify-center mbe-6'>
                <Image
                  src='/images/illustrations/characters/flota3.png'
                  alt='Logo'
                  width={300}
                  height={300}
                  className='h-40 w-auto'
                />
              </Link>

              {isInvalidLink && renderInvalidLink()}
              {success && renderSuccess()}
              {!isInvalidLink && !success && tokenData && renderForm()}
              {!isInvalidLink && !success && !tokenData && (
                <Box display='flex' justifyContent='center' py={4}>
                  <CircularProgress />
                </Box>
              )}
            </CardContent>
          </Card>
        </AuthIllustrationWrapper>
      </div>
    </div>
  )
}

export default ResetPassword
