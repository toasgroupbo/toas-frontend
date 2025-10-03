'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'

import CustomTextField from '@core/components/mui/TextField'

// Schema de validación
const empresaSchema = z
  .object({
    // Datos de la empresa
    logo: z.string().optional(),
    nombreComercial: z.string().min(3, 'El nombre comercial debe tener al menos 3 caracteres'),
    nombreBanco: z.string().min(1, 'Seleccione un banco'),
    nroCuenta: z.string().min(8, 'El número de cuenta debe tener al menos 8 dígitos'),
    tipoCuenta: z.string().min(1, 'Seleccione el tipo de cuenta'),
    comision: z.string().min(1, 'Ingrese la comisión'),
    horasCancelar: z.string().min(1, 'Ingrese las horas para cancelar'),

    // Datos del representante
    nombreRepresentante: z.string().min(5, 'Ingrese nombre y apellido completos'),
    nroCelular: z.string().min(8, 'El número de celular debe tener al menos 8 dígitos'),

    // Datos de la cuenta
    usuario: z.string().min(5, 'El usuario debe tener al menos 5 caracteres'),
    contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    repetirContrasena: z.string()
  })
  .refine(data => data.contrasena === data.repetirContrasena, {
    message: 'Las contraseñas no coinciden',
    path: ['repetirContrasena']
  })

type EmpresaFormData = z.infer<typeof empresaSchema>

interface Props {
  empresaId?: number
}

const FormularioEmpresa: React.FC<Props> = ({ empresaId }) => {
  const router = useRouter()
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const [mostrarRepetirContrasena, setMostrarRepetirContrasena] = useState(false)
  const [isGuardando, setIsGuardando] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      logo: '',
      nombreComercial: '',
      nombreBanco: '',
      nroCuenta: '',
      tipoCuenta: '',
      comision: '',
      horasCancelar: '',
      nombreRepresentante: '',
      nroCelular: '',
      usuario: '',
      contrasena: '',
      repetirContrasena: ''
    }
  })

  // Simular carga de datos si es edición
  useEffect(() => {
    if (empresaId) {
      // Aquí cargarías los datos de la empresa desde tu API
      // Por ahora uso datos de ejemplo
      setValue('nombreComercial', 'TRANS SAIPINA')
      setValue('nombreBanco', 'BANCO UNION')
      setValue('nroCuenta', '1000000652145')
      setValue('tipoCuenta', 'AHORRO')
      setValue('comision', '1')
      setValue('horasCancelar', '3')
      setValue('nombreRepresentante', 'JOAQUIN CARDENAS')
      setValue('nroCelular', '75142695')
      setValue('usuario', 'TRANSAIPINA156')
      setLogoPreview('/images/logos/trans-saipina.png')
    }
  }, [empresaId, setValue])

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      const reader = new FileReader()

      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
        setValue('logo', reader.result as string)
      }

      reader.readAsDataURL(file)
    }
  }

  const handleEliminarLogo = () => {
    setLogoPreview('')
    setValue('logo', '')
  }

  const handleCancelar = () => {
    router.push('/companies/list')
  }

  const onSubmit = async (data: EmpresaFormData) => {
    setIsGuardando(true)

    try {
      console.log('Datos a guardar:', data)

      // Aquí iría tu llamada a la API
      // await crearEmpresa(data)

      setTimeout(() => {
        alert(empresaId ? 'Empresa actualizada correctamente' : 'Empresa creada correctamente')
        router.push('/companies/list')
      }, 1500)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar la empresa')
    } finally {
      setIsGuardando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={6}>
        {/* DATOS DE LA EMPRESA */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className='tabler-building' style={{ fontSize: '24px' }} />
                  <Typography variant='h5'>Ingresar Datos de la Empresa</Typography>
                </Box>
              }
              subheader='Información comercial y bancaria de la empresa'
            />
            <CardContent>
              <Grid container spacing={6}>
                {/* Logo */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Box>
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                      Adjuntar Logo
                    </Typography>
                    <Box
                      sx={{
                        border: '2px dashed',
                        borderColor: 'divider',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        position: 'relative',
                        minHeight: 200,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {logoPreview ? (
                        <>
                          <Box
                            component='img'
                            src={logoPreview}
                            alt='Logo'
                            sx={{
                              maxWidth: '100%',
                              maxHeight: 150,
                              objectFit: 'contain'
                            }}
                          />
                          <IconButton
                            size='small'
                            onClick={handleEliminarLogo}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'error.main',
                              color: 'white',
                              '&:hover': { bgcolor: 'error.dark' }
                            }}
                          >
                            <i className='tabler-trash' style={{ fontSize: '16px' }} />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <i
                            className='tabler-upload'
                            style={{ fontSize: '48px', color: 'var(--mui-palette-text-disabled)' }}
                          />
                          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                            Haga clic para seleccionar
                          </Typography>
                        </>
                      )}
                      <input
                        type='file'
                        accept='image/*'
                        onChange={handleLogoChange}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          opacity: 0,
                          cursor: 'pointer'
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>

                {/* Nombre Comercial */}
                <Grid size={{ xs: 12, sm: 6, md: 8 }}>
                  <CustomTextField
                    fullWidth
                    label='Nombre Comercial *'
                    placeholder='Ej: TRANS SAIPINA'
                    {...register('nombreComercial')}
                    error={!!errors.nombreComercial}
                    helperText={errors.nombreComercial?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-building-store' style={{ fontSize: '20px' }} />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                {/* Nombre de Banco */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name='nombreBanco'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        select
                        fullWidth
                        label='Nombre de Banco *'
                        {...field}
                        error={!!errors.nombreBanco}
                        helperText={errors.nombreBanco?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position='start'>
                              <i className='tabler-building-bank' style={{ fontSize: '20px' }} />
                            </InputAdornment>
                          )
                        }}
                      >
                        <MenuItem value=''>Seleccionar banco...</MenuItem>
                        <MenuItem value='BANCO UNION'>BANCO UNION</MenuItem>
                        <MenuItem value='BANCO NACIONAL'>BANCO NACIONAL</MenuItem>
                        <MenuItem value='BANCO MERCANTIL'>BANCO MERCANTIL</MenuItem>
                        <MenuItem value='BANCO FIE'>BANCO FIE</MenuItem>
                        <MenuItem value='BANCO SOL'>BANCO SOL</MenuItem>
                      </CustomTextField>
                    )}
                  />
                </Grid>

                {/* Número de Cuenta */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomTextField
                    fullWidth
                    label='Número de Cuenta *'
                    placeholder='1000000652145'
                    {...register('nroCuenta')}
                    error={!!errors.nroCuenta}
                    helperText={errors.nroCuenta?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-credit-card' style={{ fontSize: '20px' }} />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                {/* Tipo de Cuenta */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name='tipoCuenta'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        select
                        fullWidth
                        label='Tipo de Cuenta *'
                        {...field}
                        error={!!errors.tipoCuenta}
                        helperText={errors.tipoCuenta?.message}
                      >
                        <MenuItem value=''>Seleccionar tipo...</MenuItem>
                        <MenuItem value='AHORRO'>AHORRO</MenuItem>
                        <MenuItem value='CORRIENTE'>CORRIENTE</MenuItem>
                      </CustomTextField>
                    )}
                  />
                </Grid>

                {/* Comisión */}
                <Grid size={{ xs: 12, sm: 3 }}>
                  <CustomTextField
                    fullWidth
                    type='number'
                    label='Comisión (%) *'
                    placeholder='1'
                    {...register('comision')}
                    error={!!errors.comision}
                    helperText={errors.comision?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-percentage' style={{ fontSize: '20px' }} />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                {/* Horas para Cancelar */}
                <Grid size={{ xs: 12, sm: 3 }}>
                  <CustomTextField
                    fullWidth
                    type='number'
                    label='Horas antes para Cancelar *'
                    placeholder='3'
                    {...register('horasCancelar')}
                    error={!!errors.horasCancelar}
                    helperText={errors.horasCancelar?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-clock' style={{ fontSize: '20px' }} />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* DATOS DEL REPRESENTANTE */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className='tabler-user' style={{ fontSize: '24px' }} />
                  <Typography variant='h5'>Ingresar Datos del Representante</Typography>
                </Box>
              }
              subheader='Información del representante legal de la empresa'
            />
            <CardContent>
              <Grid container spacing={6}>
                {/* Nombre y Apellido */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomTextField
                    fullWidth
                    label='Nombre y Apellido *'
                    placeholder='Ej: JOAQUIN CARDENAS'
                    {...register('nombreRepresentante')}
                    error={!!errors.nombreRepresentante}
                    helperText={errors.nombreRepresentante?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-user-circle' style={{ fontSize: '20px' }} />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                {/* Número de Celular */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomTextField
                    fullWidth
                    label='Número de Celular *'
                    placeholder='75142695'
                    {...register('nroCelular')}
                    error={!!errors.nroCelular}
                    helperText={errors.nroCelular?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-phone' style={{ fontSize: '20px' }} />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* DATOS DE LA CUENTA */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className='tabler-lock' style={{ fontSize: '24px' }} />
                  <Typography variant='h5'>Ingresar Datos de la Cuenta</Typography>
                </Box>
              }
              subheader='Credenciales de acceso al sistema'
            />
            <CardContent>
              <Grid container spacing={6}>
                {/* Usuario */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomTextField
                    fullWidth
                    label='Usuario *'
                    placeholder='TRANSAIPINA156'
                    {...register('usuario')}
                    error={!!errors.usuario}
                    helperText={errors.usuario?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-user-check' style={{ fontSize: '20px' }} />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                {/* Contraseña */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomTextField
                    fullWidth
                    type={mostrarContrasena ? 'text' : 'password'}
                    label='Contraseña *'
                    placeholder='••••••••'
                    {...register('contrasena')}
                    error={!!errors.contrasena}
                    helperText={errors.contrasena?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-key' style={{ fontSize: '20px' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton onClick={() => setMostrarContrasena(!mostrarContrasena)} edge='end'>
                            <i
                              className={mostrarContrasena ? 'tabler-eye-off' : 'tabler-eye'}
                              style={{ fontSize: '20px' }}
                            />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                {/* Repetir Contraseña */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomTextField
                    fullWidth
                    type={mostrarRepetirContrasena ? 'text' : 'password'}
                    label='Repetir Contraseña *'
                    placeholder='••••••••'
                    {...register('repetirContrasena')}
                    error={!!errors.repetirContrasena}
                    helperText={errors.repetirContrasena?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-key' style={{ fontSize: '20px' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton onClick={() => setMostrarRepetirContrasena(!mostrarRepetirContrasena)} edge='end'>
                            <i
                              className={mostrarRepetirContrasena ? 'tabler-eye-off' : 'tabler-eye'}
                              style={{ fontSize: '20px' }}
                            />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Botones de acción */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
            <Button
              variant='tonal'
              color='secondary'
              size='large'
              onClick={handleCancelar}
              disabled={isGuardando}
              startIcon={<i className='tabler-x' style={{ fontSize: '18px' }} />}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              variant='contained'
              size='large'
              disabled={isGuardando}
              startIcon={
                isGuardando ? (
                  <i className='tabler-loader' style={{ fontSize: '18px' }} />
                ) : (
                  <i className='tabler-check' style={{ fontSize: '18px' }} />
                )
              }
            >
              {isGuardando ? 'Guardando...' : empresaId ? 'Actualizar' : 'Crear'} Empresa
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  )
}

export default FormularioEmpresa
