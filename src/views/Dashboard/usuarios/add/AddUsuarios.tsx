'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Box from '@mui/material/Box'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'

import CustomTextField from '@core/components/mui/TextField'
import ModalAddLugar from '@/views/Dashboard/Companies/add/ModalAddLugar'

import { useUsuarios, useUsuarioForm } from '@/hooks/useUsuarios'
import { useEventoActividad } from '@/hooks/UseEventoActividad'
import { useSnackbar } from '@/contexts/SnackbarContext'
import { OPCIONES_ROLES, type Roles } from '@/types/api/usuarios'

import { useAuth } from '@/contexts/AuthContext'

interface Props {
  usuarioId?: number
  onSuccess?: () => void
  onCancel?: () => void
}

const FormularioUsuarios: React.FC<Props> = ({ usuarioId }) => {
  const router = useRouter()
  const { showSuccess, showError } = useSnackbar()
  const { getRolesDisponibles, userRole } = useAuth()

  const {
    formData,
    errors,
    isEditing,
    isLoading: cargandoUsuario,
    updateField,
    setFieldError,
    clearFieldError,
    resetForm,
    validateForm,
    usuarioExistente
  } = useUsuarioForm(usuarioId)

  // Estados para búsqueda de lugares
  const [searchLugar, setSearchLugar] = useState('')
  const [filtroLugarDebounced, setFiltroLugarDebounced] = useState('')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [modalNuevoLugarOpen, setModalNuevoLugarOpen] = useState(false)
  const [modalExitoOpen, setModalExitoOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Hooks para operaciones
  const { useCreateUsuario, useUpdateUsuario, useGetPerfilesNegocio } = useUsuarios()

  const { data: perfilesNegocio = [] } = useGetPerfilesNegocio(
    !['Admin_Negocio', 'Operador_Negocio'].includes(userRole)
  )

  const { useBuscarLugares } = useEventoActividad()

  const createUsuario = useCreateUsuario()
  const updateUsuario = useUpdateUsuario()

  const { data: lugares = [], isLoading: buscandoLugares } = useBuscarLugares(
    filtroLugarDebounced,
    filtroLugarDebounced.length >= 2
  ) as { data: any[]; isLoading: boolean }

  const isProcessing = createUsuario.isPending || updateUsuario.isPending
  const error = createUsuario.error || updateUsuario.error

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFiltroLugarDebounced(searchLugar)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchLugar])

  useEffect(() => {
    if (lugares.length > 0 && filtroLugarDebounced.length >= 2) {
      setDropdownOpen(true)
    } else {
      setDropdownOpen(false)
    }
  }, [lugares, filtroLugarDebounced])

  const lugarSeleccionado = lugares.find(lugar => lugar.id === formData.lugar_id)

  useEffect(() => {
    if (isEditing && formData.tipoPublicador === 'otro' && formData.lugar_id > 0 && !searchLugar) {
      if (lugarSeleccionado) {
        setSearchLugar(lugarSeleccionado.nombre_es)
      }
    }
  }, [isEditing, formData.tipoPublicador, formData.lugar_id, searchLugar, lugarSeleccionado])

  const handleBuscarLugar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setSearchLugar(value)
    setAnchorEl(e.currentTarget)

    if (value.trim() === '') {
      setDropdownOpen(false)
    }
  }

  const handleTipoPublicadorChange = (tipo: 'perfil' | 'otro') => {
    updateField('tipoPublicador', tipo)

    if (tipo === 'perfil') {
      updateField('nombre_publicador', '')
      updateField('lugar_id', 0)
      setSearchLugar('')
    } else {
      updateField('perfil_negocio_id', 0)
    }
  }

  const handleSeleccionarLugar = (lugar: any) => {
    updateField('lugar_id', lugar.id)
    setSearchLugar(lugar.nombre_es)
    setDropdownOpen(false)
    clearFieldError('lugar_id')
  }

  const handleLimpiarBusqueda = () => {
    setSearchLugar('')
    updateField('lugar_id', 0)
    setDropdownOpen(false)
  }

  const handleClickAway = () => {
    setDropdownOpen(false)
  }

  const handleNuevoLugarCreado = (nuevoLugar: any) => {
    const lugar = nuevoLugar.data || nuevoLugar

    if (lugar.id) {
      updateField('lugar_id', lugar.id)
      setSearchLugar(lugar.nombre_es || `Lugar ${lugar.id}`)
      clearFieldError('lugar_id')
    }

    setModalNuevoLugarOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      const datosEnvio = {
        usuario: formData.usuario,
        correo: formData.correo,
        estado: formData.estado,
        roles: formData.roles,
        ...(formData.tipoPublicador === 'perfil'
          ? { perfil_negocio_id: formData.perfil_negocio_id }
          : {
              nombre_publicador: formData.nombre_publicador,
              lugar_id: formData.lugar_id
            }),
        ...(formData.contraseña && { contraseña: formData.contraseña })
      }

      let resultado

      if (isEditing) {
        resultado = await updateUsuario.mutateAsync({
          id: usuarioId!,
          ...datosEnvio
        })
        showSuccess('Usuario actualizado correctamente')
        setTimeout(() => {
          router.push('/usuarios/list')
        }, 2000)
      } else {
        if (!formData.contraseña) {
          setFieldError('contraseña', 'La contraseña es requerida para usuarios nuevos')

          return
        }

        resultado = await createUsuario.mutateAsync({
          ...datosEnvio,
          contraseña: formData.contraseña
        })
        showSuccess('Usuario creado correctamente')
        setModalExitoOpen(true)
      }
    } catch (error: any) {
      console.error(`Error al ${isEditing ? 'actualizar' : 'crear'} usuario:`, error)
      showError(`Error al ${isEditing ? 'actualizar' : 'crear'} el usuario`)
    }
  }

  const handleCancelar = () => {
    router.push('/usuarios/list')
  }

  const handleCrearOtro = () => {
    resetForm()
    setSearchLugar('')
    setModalExitoOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCerrarModalExito = () => {
    router.push('/usuarios/list')
  }

  if (cargandoUsuario) {
    return (
      <Card>
        <CardContent>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Cargando información del usuario...</Typography>
          </div>
        </CardContent>
      </Card>
    )
  }

  const ModalExito = () => (
    <Dialog
      open={modalExitoOpen}
      onClose={handleCerrarModalExito}
      maxWidth='sm'
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, textAlign: 'center' } }}
    >
      <DialogTitle sx={{ position: 'relative' }}>
        <IconButton
          onClick={handleCerrarModalExito}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'grey.500',
            '&:hover': { color: 'grey.700', backgroundColor: 'grey.100' }
          }}
        >
          <i className='tabler-x' style={{ fontSize: '20px' }} />
        </IconButton>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: 'success.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            <i className='tabler-check' style={{ fontSize: '32px' }} />
          </Box>
          <Typography variant='h5' component='div' color='success.main' fontWeight='600'>
            Usuario Creado Correctamente
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
        <Typography variant='body1' color='textSecondary'>
          El usuario ha sido creado exitosamente en el sistema.
        </Typography>
        <Typography variant='body2' color='textSecondary' sx={{ mt: 1 }}>
          ¿Qué desea hacer a continuación?
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', gap: 2, px: 3, pb: 3 }}>
        <Button
          variant='outlined'
          color='primary'
          size='large'
          onClick={handleCrearOtro}
          startIcon={<i className='tabler-user-plus' style={{ fontSize: '18px' }} />}
          sx={{ minWidth: 180 }}
        >
          Crear Otro Usuario
        </Button>

        <Button
          variant='contained'
          color='primary'
          size='large'
          onClick={handleCerrarModalExito}
          startIcon={<i className='tabler-list' style={{ fontSize: '18px' }} />}
          sx={{ minWidth: 180 }}
        >
          Ver Lista de Usuarios
        </Button>
      </DialogActions>
    </Dialog>
  )

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={6}>
          {error && (
            <Grid size={{ xs: 12 }}>
              <Alert severity='error'>
                <Typography variant='h6'>Error al {isEditing ? 'actualizar' : 'crear'} usuario</Typography>
                {error.message || 'Ha ocurrido un error inesperado'}
              </Alert>
            </Grid>
          )}

          {/* Información básica del usuario */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader
                title='👤 Información Básica'
                subheader='Complete los datos básicos del usuario'
                action={
                  isEditing ? (
                    <Chip label='Modo Edición' color='info' variant='outlined' />
                  ) : (
                    <Chip label='Modo Creación' color='success' variant='outlined' />
                  )
                }
              />

              <CardContent>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      fullWidth
                      label='Nombre de Usuario *'
                      placeholder='Ej: juan.perez'
                      value={formData.usuario}
                      onChange={e => updateField('usuario', e.target.value)}
                      error={!!errors.usuario}
                      helperText={errors.usuario || 'Nombre único para identificar al usuario'}
                      disabled={isProcessing}
                    />
                  </Grid>

                  {!isEditing && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CustomTextField
                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        label='Contraseña *'
                        placeholder='Contraseña segura'
                        value={formData.contraseña}
                        onChange={e => updateField('contraseña', e.target.value)}
                        error={!!errors.contraseña}
                        helperText={errors.contraseña || 'Mínimo 6 caracteres'}
                        disabled={isProcessing}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton onClick={() => setShowPassword(!showPassword)} size='small'>
                                <i
                                  className={showPassword ? 'tabler-eye-off' : 'tabler-eye'}
                                  style={{ fontSize: '18px' }}
                                />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                  )}

                  {!isEditing && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CustomTextField
                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        label='Confirmar Contraseña *'
                        placeholder='Repetir contraseña'
                        value={formData.confirmarContraseña}
                        onChange={e => updateField('confirmarContraseña', e.target.value)}
                        error={!!errors.confirmarContraseña}
                        helperText={errors.confirmarContraseña || 'Debe coincidir con la contraseña'}
                        disabled={isProcessing}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton onClick={() => setShowPassword(!showPassword)} size='small'>
                                <i
                                  className={showPassword ? 'tabler-eye-off' : 'tabler-eye'}
                                  style={{ fontSize: '18px' }}
                                />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                  )}

                  <Grid size={{ xs: 12, sm: 8 }}>
                    <CustomTextField
                      fullWidth
                      type='email'
                      label='Correo Electrónico *'
                      placeholder='usuario@dominio.com'
                      value={formData.correo}
                      onChange={e => updateField('correo', e.target.value)}
                      error={!!errors.correo}
                      helperText={errors.correo || 'Correo único para el usuario'}
                      disabled={isProcessing}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <CustomTextField
                      select
                      fullWidth
                      label='Rol *'
                      value={formData.roles}
                      onChange={e => updateField('roles', e.target.value as Roles)}
                      error={!!errors.roles}
                      helperText={errors.roles}
                      disabled={isProcessing}
                    >
                      <MenuItem value=''>
                        <em>Seleccionar rol...</em>
                      </MenuItem>
                      {getRolesDisponibles().map(opcion => (
                        <MenuItem key={opcion.value} value={opcion.value}>
                          <div>
                            <Typography variant='body2'>{opcion.label}</Typography>
                            <Typography variant='caption' color='text.secondary'></Typography>
                          </div>
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.estado}
                          onChange={e => updateField('estado', e.target.checked)}
                          disabled={isProcessing}
                          color='success'
                        />
                      }
                      label={<Typography variant='body2'>Usuario {formData.estado ? 'activo' : 'inactivo'}</Typography>}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Información del perfil de negocio */}
          {!['Admin_Negocio', 'Operador_Negocio'].includes(userRole) && (
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardHeader
                  title='🏢 Información del Publicador'
                  subheader='Seleccione un perfil de negocio existente o ingrese un nombre personalizado'
                />
                <CardContent>
                  <Grid container spacing={4}>
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <Button
                          variant={formData.tipoPublicador === 'perfil' ? 'contained' : 'outlined'}
                          onClick={() => handleTipoPublicadorChange('perfil')}
                          disabled={isProcessing}
                          startIcon={<i className='tabler-building-store' style={{ fontSize: '18px' }} />}
                        >
                          Perfil de Negocio
                        </Button>
                        <Button
                          variant={formData.tipoPublicador === 'otro' ? 'contained' : 'outlined'}
                          onClick={() => handleTipoPublicadorChange('otro')}
                          disabled={isProcessing}
                          startIcon={<i className='tabler-edit' style={{ fontSize: '18px' }} />}
                        >
                          Otro (Personalizado)
                        </Button>
                      </Box>

                      {formData.tipoPublicador === 'perfil' ? (
                        <CustomTextField
                          select
                          fullWidth
                          label='Perfil de Negocio *'
                          value={formData.perfil_negocio_id || ''}
                          onChange={e => {
                            const selectedId = Number(e.target.value)

                            updateField('perfil_negocio_id', selectedId)

                            // Auto-llenar lugar_id basado en el perfil seleccionado
                            const selectedProfile = perfilesNegocio.find(p => p.id === selectedId)

                            if (selectedProfile) {
                              updateField('lugar_id', selectedProfile.lugar.id)
                            }
                          }}
                          error={!!errors.perfil_negocio_id}
                          helperText={errors.perfil_negocio_id || 'El lugar se asignará automáticamente'}
                          disabled={isProcessing}
                        >
                          <MenuItem value=''>
                            <em>Seleccionar perfil de negocio...</em>
                          </MenuItem>
                          {perfilesNegocio.map(perfil => (
                            <MenuItem key={perfil.id} value={perfil.id}>
                              <div>
                                <Typography variant='body2'>{perfil.nombre_publicador}</Typography>
                              </div>
                            </MenuItem>
                          ))}
                        </CustomTextField>
                      ) : (
                        <>
                          <CustomTextField
                            fullWidth
                            label='Nombre del Publicador *'
                            placeholder='Ej: Mi Empresa S.R.L.'
                            value={formData.nombre_publicador}
                            onChange={e => updateField('nombre_publicador', e.target.value)}
                            error={!!errors.nombre_publicador}
                            helperText={errors.nombre_publicador || 'Nombre personalizado del publicador'}
                            disabled={isProcessing}
                            sx={{ mb: 3 }}
                          />

                          <Divider sx={{ mb: 2 }}>
                            <Typography variant='caption' color='text.secondary'>
                              Lugar Asociado
                            </Typography>
                          </Divider>

                          {formData.lugar_id > 0 && lugarSeleccionado && (
                            <Card sx={{ mb: 3, bgcolor: 'success.50' }}>
                              <CardContent>
                                <div className='flex items-center justify-between'>
                                  <div>
                                    <Typography variant='h6' color='success.main'>
                                      ✓ Lugar seleccionado
                                    </Typography>
                                    <Typography variant='body1' sx={{ fontWeight: 'medium' }}>
                                      {lugarSeleccionado.nombre_es}
                                    </Typography>
                                    <Typography variant='body2' color='text.secondary'>
                                      {lugarSeleccionado.direccion}
                                    </Typography>
                                  </div>
                                  <Button
                                    variant='outlined'
                                    size='small'
                                    onClick={() => {
                                      updateField('lugar_id', 0)
                                      setSearchLugar('')
                                    }}
                                    disabled={isProcessing}
                                  >
                                    Cambiar
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {formData.lugar_id === 0 && (
                            <div className='flex gap-2'>
                              <div className='flex-1 relative'>
                                <ClickAwayListener onClickAway={handleClickAway}>
                                  <div>
                                    <CustomTextField
                                      fullWidth
                                      label='Buscar lugar *'
                                      placeholder='Escribe para buscar lugares...'
                                      value={searchLugar}
                                      onChange={handleBuscarLugar}
                                      error={!!errors.lugar_id}
                                      helperText={errors.lugar_id || 'Busque un lugar existente o cree uno nuevo'}
                                      disabled={isProcessing}
                                      InputProps={{
                                        startAdornment: (
                                          <InputAdornment position='start'>
                                            {buscandoLugares ? (
                                              <CircularProgress size={20} />
                                            ) : (
                                              <i className='tabler-search' style={{ fontSize: '20px' }} />
                                            )}
                                          </InputAdornment>
                                        ),
                                        endAdornment: searchLugar && (
                                          <InputAdornment position='end'>
                                            <IconButton size='small' onClick={handleLimpiarBusqueda}>
                                              <i className='tabler-x' style={{ fontSize: '16px' }} />
                                            </IconButton>
                                          </InputAdornment>
                                        )
                                      }}
                                    />

                                    <Popper
                                      open={dropdownOpen}
                                      anchorEl={anchorEl}
                                      placement='bottom-start'
                                      style={{ width: anchorEl?.clientWidth, zIndex: 1300 }}
                                    >
                                      <Paper elevation={3} sx={{ maxHeight: 200, overflow: 'auto' }}>
                                        <List dense>
                                          {lugares.length > 0 ? (
                                            lugares.map((lugar: any, index: number) => (
                                              <ListItem key={lugar.id || index} disablePadding>
                                                <ListItemButton onClick={() => handleSeleccionarLugar(lugar)}>
                                                  <i
                                                    className='tabler-map-pin'
                                                    style={{
                                                      fontSize: '18px',
                                                      marginRight: 8,
                                                      color: 'text.secondary'
                                                    }}
                                                  />
                                                  <ListItemText
                                                    primary={lugar.nombre_es}
                                                    secondary={lugar.nombre_en || lugar.direccion}
                                                  />
                                                </ListItemButton>
                                              </ListItem>
                                            ))
                                          ) : filtroLugarDebounced.length >= 2 && !buscandoLugares ? (
                                            <ListItem>
                                              <ListItemText
                                                primary='No se encontraron lugares'
                                                secondary='Intenta con otros términos o crea uno nuevo'
                                              />
                                            </ListItem>
                                          ) : null}
                                        </List>
                                      </Paper>
                                    </Popper>
                                  </div>
                                </ClickAwayListener>
                              </div>
                              <Button
                                variant='outlined'
                                startIcon={<i className='tabler-plus' style={{ fontSize: '18px' }} />}
                                onClick={() => setModalNuevoLugarOpen(true)}
                                disabled={isProcessing}
                                sx={{ whiteSpace: 'nowrap', height: '56px', minWidth: 'auto' }}
                              >
                                Nuevo Lugar
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Botones de acción */}
          <Grid size={{ xs: 12 }}>
            <div className='flex gap-4 justify-end'>
              <Button
                variant='tonal'
                color='secondary'
                size='large'
                onClick={handleCancelar}
                startIcon={<i className='tabler-arrow-left' style={{ fontSize: '18px' }} />}
                disabled={isProcessing}
              >
                Cancelar
              </Button>
              <Button
                type='submit'
                variant='contained'
                size='large'
                disabled={isProcessing || cargandoUsuario}
                startIcon={
                  isProcessing ? <i className='tabler-loader animate-spin' style={{ fontSize: '18px' }} /> : null
                }
              >
                {isProcessing
                  ? isEditing
                    ? 'Actualizando...'
                    : 'Creando...'
                  : isEditing
                    ? 'Actualizar Usuario'
                    : 'Crear Usuario'}
              </Button>
            </div>
          </Grid>
        </Grid>
      </form>

      <ModalAddLugar
        open={modalNuevoLugarOpen}
        onClose={() => setModalNuevoLugarOpen(false)}
        onLugarCreado={handleNuevoLugarCreado}
      />

      <ModalExito />
    </>
  )
}

export default FormularioUsuarios
