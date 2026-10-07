'use client'

import { useState } from 'react'

import Link from 'next/link'
import Image from 'next/image'

import { useForm, Controller } from 'react-hook-form'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

import type { SystemMode } from '@core/types'
import type { LoginRequest } from '@/types/api/auth'

import CustomTextField from '@core/components/mui/TextField'
import AuthIllustrationWrapper from './AuthIllustrationWrapper'
import { useLogin, useLogin2FA } from '@/hooks/useLogin'

const LoginV1 = ({ mode }: { mode: SystemMode }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  const [twoFactorState, setTwoFactorState] = useState<{ required: boolean; tempToken: string | null }>({
    required: false,
    tempToken: null
  })

  const [twoFactorCode, setTwoFactorCode] = useState('')

  const loginMutation = useLogin()
  const login2FAMutation = useLogin2FA()

  const {
    control,
    handleSubmit,
    formState: { errors },
    clearErrors
  } = useForm<LoginRequest>({
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const getErrorMessage = (error: any): string => {
    if (error?.response?.data?.message) {
      const message = error.response.data.message.toLowerCase()

      if (message.includes('email') || message.includes('correo') || message.includes('not found')) {
        return 'El correo electrónico no existe o es incorrecto'
      }

      if (message.includes('contrasenia') || message.includes('contraseña') || message.includes('password')) {
        return 'La contraseña es incorrecta'
      }

      if (message.includes('credenciales')) {
        return 'Correo o contraseña incorrectos'
      }

      if (message.includes('invalid 2fa code')) {
        return 'Código incorrecto. Verifica el código en tu aplicación'
      }

      if (message.includes('invalid or expired token') || message.includes('expired')) {
        return 'La verificación expiró. Por favor, inicia sesión nuevamente'
      }

      if (message.includes('too many requests') || message.includes('throttler')) {
        return 'Demasiados intentos. Espera un minuto antes de reintentar'
      }

      return error.response.data.message
    }

    return 'Error al iniciar sesión. Intenta nuevamente.'
  }

  const onSubmit = async (data: LoginRequest) => {
    clearErrors()

    try {
      const result = await loginMutation.mutateAsync(data)

      if (result && 'twoFactorRequired' in result) {
        setTwoFactorState({ required: true, tempToken: result.tempToken })
        setTwoFactorCode('')
      }
    } catch (error: any) {
      console.error('Error de login:', error)
    }
  }

  const onSubmit2FA = async () => {
    if (!twoFactorState.tempToken || twoFactorCode.length !== 6) return

    try {
      await login2FAMutation.mutateAsync({
        tempToken: twoFactorState.tempToken,
        code: twoFactorCode
      })
    } catch (error: any) {
      console.error('Error de verificación 2FA:', error)

      if (error?.response?.data?.message?.toLowerCase().includes('expired')) {
        setTwoFactorState({ required: false, tempToken: null })
        setTwoFactorCode('')
      }
    }
  }

  const handleBackToLogin = () => {
    setTwoFactorState({ required: false, tempToken: null })
    setTwoFactorCode('')
    loginMutation.reset()
    login2FAMutation.reset()
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
      {/* Video de fondo */}
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

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',

          zIndex: 0
        }}
      />

      {/* Contenido del login */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <AuthIllustrationWrapper>
          <Card className='flex flex-col sm:is-[450px]'>
            <CardContent className='sm:!p-12'>
              <Link href={'/'} className='flex justify-center mbe-6'>
                <Image
                  src='/images/illustrations/characters/flota3.png'
                  alt='Logo'
                  width={300}
                  height={300}
                  className='h-40 w-auto'
                />
              </Link>

              {!twoFactorState.required ? (
                <>
                  <div className='flex flex-col gap-1 mbe-6'>
                    <Typography variant='h4'>{`¡Bienvenido ! 👋🏻`}</Typography>
                    <Typography>Por favor inicia sesión en tu cuenta</Typography>
                  </div>

                  {loginMutation.isError && (
                    <Alert severity='error' className='mb-4' sx={{ mb: 3 }}>
                      <Typography variant='body2' sx={{ fontWeight: 500 }}>
                        {getErrorMessage(loginMutation.error)}
                      </Typography>
                    </Alert>
                  )}

                  <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
                    <Controller
                      name='email'
                      control={control}
                      rules={{
                        required: 'El email es requerido',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Formato de email inválido'
                        }
                      }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          autoFocus
                          fullWidth
                          label='Email'
                          placeholder='Ingresa tu email'
                          error={!!errors.email}
                          helperText={errors.email?.message}
                          onChange={e => {
                            field.onChange(e)

                            if (loginMutation.isError) {
                              loginMutation.reset()
                            }
                          }}
                        />
                      )}
                    />

                    <Controller
                      name='password'
                      control={control}
                      rules={{
                        required: 'La contraseña es requerida',
                        minLength: {
                          value: 3,
                          message: 'La contraseña debe tener al menos 3 caracteres'
                        }
                      }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='Contraseña'
                          placeholder='············'
                          type={isPasswordShown ? 'text' : 'password'}
                          error={!!errors.password}
                          helperText={errors.password?.message}
                          onChange={e => {
                            field.onChange(e)

                            if (loginMutation.isError) {
                              loginMutation.reset()
                            }
                          }}
                          slotProps={{
                            input: {
                              endAdornment: (
                                <InputAdornment position='end'>
                                  <IconButton
                                    edge='end'
                                    onClick={handleClickShowPassword}
                                    onMouseDown={e => e.preventDefault()}
                                  >
                                    <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                                  </IconButton>
                                </InputAdornment>
                              )
                            }
                          }}
                        />
                      )}
                    />

                    <Box display='flex' justifyContent='flex-end'>
                      <Link href='/forgot-password' style={{ textDecoration: 'none' }}>
                        <Typography
                          variant='body2'
                          color='primary'
                          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                        >
                          ¿Olvidaste tu contraseña?
                        </Typography>
                      </Link>
                    </Box>

                    <Button
                      fullWidth
                      variant='contained'
                      type='submit'
                      disabled={loginMutation.isPending}
                      startIcon={loginMutation.isPending ? <CircularProgress size={20} /> : null}
                    >
                      {loginMutation.isPending ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <div className='flex flex-col gap-1 mbe-6'>
                    <Typography variant='h4'>Verificación en dos pasos</Typography>
                    <Typography>Ingresa el código de 6 dígitos de tu aplicación de autenticación</Typography>
                  </div>

                  {login2FAMutation.isError && (
                    <Alert severity='error' className='mb-4' sx={{ mb: 3 }}>
                      <Typography variant='body2' sx={{ fontWeight: 500 }}>
                        {getErrorMessage(login2FAMutation.error)}
                      </Typography>
                    </Alert>
                  )}

                  <Box
                    component='form'
                    onSubmit={e => {
                      e.preventDefault()
                      onSubmit2FA()
                    }}
                    className='flex flex-col gap-6'
                  >
                    <CustomTextField
                      autoFocus
                      fullWidth
                      label='Código de verificación'
                      placeholder='000000'
                      value={twoFactorCode}
                      onChange={e => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6)

                        setTwoFactorCode(value)

                        if (login2FAMutation.isError) {
                          login2FAMutation.reset()
                        }

                        if (value.length === 6) {
                          login2FAMutation.mutate({
                            tempToken: twoFactorState.tempToken!,
                            code: value
                          })
                        }
                      }}
                      slotProps={{
                        input: {
                          inputMode: 'numeric',
                          autoComplete: 'one-time-code',
                          style: { textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.5rem' }
                        }
                      }}
                    />

                    <Button
                      fullWidth
                      variant='contained'
                      type='submit'
                      disabled={login2FAMutation.isPending || twoFactorCode.length !== 6}
                      startIcon={login2FAMutation.isPending ? <CircularProgress size={20} /> : null}
                    >
                      {login2FAMutation.isPending ? 'Verificando...' : 'Verificar'}
                    </Button>

                    <Button
                      fullWidth
                      variant='text'
                      color='secondary'
                      onClick={handleBackToLogin}
                      disabled={login2FAMutation.isPending}
                    >
                      Volver al inicio de sesión
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

export default LoginV1
