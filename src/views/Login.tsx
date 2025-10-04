'use client'

// React Imports
import { useState, useCallback } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MUI Imports
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

import type { SystemMode } from '@core/types'
import type { LoginRequest } from '@/types/api/auth'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

import AuthIllustrationWrapper from './AuthIllustrationWrapper'

// Hook Imports
import { useLogin } from '@/hooks/useLogin'

const LoginV1 = ({}: { mode: SystemMode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  // Hooks
  const router = useRouter()
  const loginMutation = useLogin()

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
    clearErrors
  } = useForm<LoginRequest>({
    defaultValues: {
      correo: '',
      contrasenia: ''
    }
  })

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const getErrorMessage = (error: any): string => {
    if (error?.response?.data?.message) {
      const message = error.response.data.message.toLowerCase()

      if (message.includes('email') || message.includes('correo')) {
        return 'El correo electrónico no existe o es incorrecto'
      }

      if (message.includes('contrasenia') || message.includes('contraseña') || message.includes('password')) {
        return 'La contraseña es incorrecta'
      }

      if (message.includes('credenciales')) {
        return 'Correo o contraseña incorrectos'
      }

      return error.response.data.message
    }

    return 'Error al iniciar sesión. Intenta nuevamente.'
  }

  const onSubmit = async (data: LoginRequest) => {
    clearErrors()

    try {
      await loginMutation.mutateAsync(data)
    } catch (error: any) {
      console.error('Error de login:', error)
    }
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          width: '100%',
          position: 'relative'
        }}
      >
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
              <div className='flex flex-col gap-1 mbe-6'>
                <Typography variant='h4'>{`¡Bienvenido Administrador! 👋🏻`}</Typography>
                <Typography>Por favor inicia sesión en tu cuenta</Typography>
              </div>
              <Alert severity='info' sx={{ mb: 3 }}>
                <Typography variant='body2' fontWeight={600} gutterBottom>
                  🔐 Credenciales de prueba:
                </Typography>
                <Typography variant='caption' component='div' sx={{ mt: 1 }}>
                  <strong>Super Admin:</strong> superadmin@demo.com / super123
                </Typography>
                <Typography variant='caption' component='div'>
                  <strong>Admin App:</strong> adminapp@demo.com / adminapp123
                </Typography>
                <Typography variant='caption' component='div'>
                  <strong>Admin Empresa:</strong> adminempresa@demo.com / empresa123
                </Typography>
                <Typography variant='caption' component='div'>
                  <strong>Cajero:</strong> cajero@demo.com / cajero123
                </Typography>
              </Alert>

              {loginMutation.isError && (
                <Alert severity='error' className='mb-4' sx={{ mb: 3 }}>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {getErrorMessage(loginMutation.error)}
                  </Typography>
                </Alert>
              )}

              <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
                <Controller
                  name='correo'
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
                      label='Email o Usuario'
                      placeholder='Ingresa tu email o usuario'
                      error={!!errors.correo}
                      helperText={errors.correo?.message}
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
                  name='contrasenia'
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
                      error={!!errors.contrasenia}
                      helperText={errors.contrasenia?.message}
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
            </CardContent>
          </Card>
        </AuthIllustrationWrapper>
      </div>
    </>
  )
}

export default LoginV1
