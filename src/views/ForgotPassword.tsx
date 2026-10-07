'use client'

import { useState } from 'react'

import Link from 'next/link'
import Image from 'next/image'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

import type { SystemMode } from '@core/types'

import CustomTextField from '@core/components/mui/TextField'
import AuthIllustrationWrapper from './AuthIllustrationWrapper'
import { useForgotPassword } from '@/hooks/usePasswordRecovery'

const ForgotPassword = ({ mode }: { mode: SystemMode }) => {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const forgotPasswordMutation = useForgotPassword()

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

    if (!value) {
      setEmailError('El email es requerido')

      return false
    }

    if (!emailRegex.test(value)) {
      setEmailError('Formato de email inválido')

      return false
    }

    setEmailError('')

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(email)) return

    try {
      await forgotPasswordMutation.mutateAsync({ email })
      setSubmitted(true)
    } catch (error: any) {
      console.error('Error:', error)
    }
  }

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

              {!submitted ? (
                <>
                  <div className='flex flex-col gap-1 mbe-6'>
                    <Typography variant='h4'>¿Olvidaste tu contraseña?</Typography>
                    <Typography>
                      Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                    </Typography>
                  </div>

                  {forgotPasswordMutation.isError && (
                    <Alert severity='error' sx={{ mb: 3 }}>
                      <Typography variant='body2'>
                        Error al enviar el correo. Intenta nuevamente.
                      </Typography>
                    </Alert>
                  )}

                  <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-6'>
                    <CustomTextField
                      autoFocus
                      fullWidth
                      type='email'
                      label='Email'
                      placeholder='Ingresa tu email'
                      value={email}
                      onChange={e => {
                        setEmail(e.target.value)
                        setEmailError('')

                        if (forgotPasswordMutation.isError) {
                          forgotPasswordMutation.reset()
                        }
                      }}
                      error={!!emailError}
                      helperText={emailError}
                    />

                    <Button
                      fullWidth
                      variant='contained'
                      type='submit'
                      disabled={forgotPasswordMutation.isPending}
                      startIcon={forgotPasswordMutation.isPending ? <CircularProgress size={20} /> : null}
                    >
                      {forgotPasswordMutation.isPending ? 'Enviando...' : 'Enviar enlace'}
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
              ) : (
                <>
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
                      <i className='tabler-mail-check' style={{ fontSize: 40, color: '#4caf50' }} />
                    </Box>

                    <Typography variant='h5' gutterBottom>
                      Revisa tu correo
                    </Typography>

                    <Typography color='text.secondary' paragraph>
                      Si el correo <strong>{email}</strong> está registrado, te enviamos un enlace para restablecer tu
                      contraseña.
                    </Typography>

                    <Typography variant='body2' color='text.secondary' paragraph>
                      Revisa también la carpeta de spam. El enlace vence en 30 minutos.
                    </Typography>

                    <Alert severity='info' sx={{ mt: 3, textAlign: 'left' }}>
                      <Typography variant='body2'>
                        Si solicitas varios enlaces, solo el <strong>último</strong> será válido.
                      </Typography>
                    </Alert>
                  </Box>

                  <Box mt={4}>
                    <Button
                      component={Link}
                      href='/login'
                      fullWidth
                      variant='contained'
                      startIcon={<i className='tabler-arrow-left' />}
                    >
                      Volver al inicio de sesión
                    </Button>

                    <Button
                      fullWidth
                      variant='text'
                      color='secondary'
                      onClick={() => {
                        setSubmitted(false)
                        setEmail('')
                        forgotPasswordMutation.reset()
                      }}
                      sx={{ mt: 1 }}
                    >
                      Enviar a otro correo
                    </Button>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </AuthIllustrationWrapper>
      </div>
    </div>
  )
}

export default ForgotPassword
