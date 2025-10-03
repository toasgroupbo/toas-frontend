'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

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

import { servicioSchema, type ServicioFormData } from '@/schemas/serviciosSchema'

import CustomTextField from '@core/components/mui/TextField'
import ModalAddLugar from '@/views/Dashboard/Companies/add/ModalAddLugar'

import { useServicio } from '@/hooks/useServicio'
import { useEventoActividad } from '@/hooks/UseEventoActividad'
import { useSnackbar } from '@/contexts/SnackbarContext'

import type { Lugar } from '@/types/api/lugares'

interface Props {
  lugarServicioId?: number
  onSuccess?: () => void
  onCancel?: () => void
}

const FormularioServicio: React.FC<Props> = ({ lugarServicioId }) => {
  const router = useRouter()
  const { showSuccess, showError } = useSnackbar()

  const isEditing = !!lugarServicioId && lugarServicioId > 0

  const { useCreateServicio, useUpdateServicio, useGetLugarServicio, useGetSubcategoriasServicio } = useServicio()

  const { useBuscarLugares } = useEventoActividad()

  const createServicio = useCreateServicio()
  const updateServicio = useUpdateServicio()
  const { data: subcategorias = [] } = useGetSubcategoriasServicio()

  const { data: lugarExistente, isLoading: cargandoLugarExistente } = useGetLugarServicio(
    isEditing ? lugarServicioId : undefined
  )

  const [lugarSeleccionado, setLugarSeleccionado] = useState<Lugar | null>(null)
  const [searchLugar, setSearchLugar] = useState('')
  const [filtroLugarDebounced, setFiltroLugarDebounced] = useState('')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [modalNuevoLugarOpen, setModalNuevoLugarOpen] = useState(false)
  const [modalEditarLugarOpen, setModalEditarLugarOpen] = useState(false)
  const [modalExitoOpen, setModalExitoOpen] = useState(false)
  const [modalLugarExisteOpen, setModalLugarExisteOpen] = useState(false)

  const { data: lugares = [], isLoading: buscandoLugares } = useBuscarLugares(
    filtroLugarDebounced,
    filtroLugarDebounced.length >= 2
  ) as { data: any[]; isLoading: boolean }

  const isLoading = createServicio.isPending || updateServicio.isPending
  const error = createServicio.error || updateServicio.error

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
    trigger
  } = useForm<ServicioFormData>({
    resolver: zodResolver(servicioSchema),
    defaultValues: {
      lugar_id: 0,
      sub_categoria_id: 0
    }
  })

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

  useEffect(() => {
    if (isEditing && lugarExistente && !cargandoLugarExistente) {
      try {
        setLugarSeleccionado({
          id: lugarExistente.id,
          nombre_es: lugarExistente.nombre_es,
          nombre_en: lugarExistente.nombre_en || '',
          descripcion_es: lugarExistente.descripcion_es || '',
          descripcion_en: lugarExistente.descripcion_en || '',
          direccion: lugarExistente.direccion || '',
          ubicacion: lugarExistente.ubicacion || null,
          imagenes: lugarExistente.imagenes || [],
          url_ubicacion: lugarExistente.url_ubicacion || null,
          estado: lugarExistente.estado ?? true,
          verificado: lugarExistente.verificado ?? false,
          createdBy: lugarExistente.createdBy || 1,
          updatedBy: lugarExistente.updatedBy || 1
        })

        const servicio = lugarExistente.l_servicio
        const subcategoriaId = lugarExistente.sub_categorias?.[0]?.sub_categoria?.id || 0

        reset({
          lugar_id: lugarExistente.id,
          telefono: servicio?.telefono || '',
          celular: servicio?.celular || '',
          sub_categoria_id: subcategoriaId
        })
      } catch (error) {
        console.error('Error cargando datos:', error)
      }
    }
  }, [isEditing, lugarExistente, cargandoLugarExistente, reset])

  const convertirALugarCompleto = (lugarBusqueda: any): Lugar => {
    return {
      id: lugarBusqueda.id,
      nombre_es: lugarBusqueda.nombre_es || '',
      nombre_en: lugarBusqueda.nombre_en || '',
      descripcion_es: '',
      descripcion_en: '',
      direccion: lugarBusqueda.direccion || '',
      ubicacion: null,
      imagenes: [],
      url_ubicacion: null,
      estado: true,
      verificado: false,
      createdBy: 1,
      updatedBy: 1
    }
  }

  const handleNumericInput =
    (fieldName: 'telefono' | 'celular', maxLength: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const numericValue = e.target.value.replace(/\D/g, '').slice(0, maxLength)

      setValue(fieldName, numericValue)
    }

  const handleBuscarLugar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setSearchLugar(value)
    setAnchorEl(e.currentTarget)

    if (value.trim() === '') {
      setDropdownOpen(false)
    }
  }

  const handleSeleccionarLugar = async (lugarBusqueda: any) => {
    const lugarCompleto = convertirALugarCompleto(lugarBusqueda)

    setLugarSeleccionado(lugarCompleto)
    setSearchLugar('')
    setValue('lugar_id', lugarCompleto.id!, { shouldValidate: true })
    await trigger('lugar_id')
    setDropdownOpen(false)
  }

  const handleLimpiarBusqueda = () => {
    setSearchLugar('')
    setDropdownOpen(false)
  }

  const handleClickAway = () => {
    setDropdownOpen(false)
  }

  const handleNuevoLugarCreado = (nuevoLugar: any) => {
    const lugar = nuevoLugar.data || nuevoLugar

    if (lugar.id) {
      const nuevoLugarCompleto = {
        id: lugar.id,
        nombre_es: lugar.nombre_es || `Lugar ${lugar.id}`,
        nombre_en: lugar.nombre_en || '',
        descripcion_es: lugar.descripcion_es || '',
        descripcion_en: lugar.descripcion_en || '',
        direccion: lugar.direccion || '',
        ubicacion: lugar.ubicacion || null,
        imagenes: lugar.imagenes || [],
        url_ubicacion: lugar.url_ubicacion || null,
        estado: lugar.estado ?? true,
        verificado: lugar.verificado ?? false,
        createdBy: lugar.createdBy || 1,
        updatedBy: lugar.updatedBy || 1
      }

      setLugarSeleccionado(nuevoLugarCompleto)
      setValue('lugar_id', lugar.id)
    }

    setModalNuevoLugarOpen(false)
  }

  const handleLugarEditado = (lugarActualizado: any) => {
    const lugar = lugarActualizado.data || lugarActualizado

    setLugarSeleccionado(prev => {
      if (!prev) return null

      return {
        ...prev,
        nombre_es: lugar.nombre_es || prev.nombre_es,
        nombre_en: lugar.nombre_en || prev.nombre_en,
        descripcion_es: lugar.descripcion_es || prev.descripcion_es,
        descripcion_en: lugar.descripcion_en || prev.descripcion_en,
        direccion: lugar.direccion || prev.direccion,
        ubicacion: lugar.ubicacion || prev.ubicacion,
        imagenes: lugar.imagenes || prev.imagenes,
        url_ubicacion: lugar.url_ubicacion || prev.url_ubicacion,
        estado: lugar.estado ?? prev.estado
      }
    })

    setModalEditarLugarOpen(false)
    showSuccess('¡Información del lugar actualizada!')
  }

  const onSubmit = async (data: ServicioFormData) => {
    try {
      const datosComunes = {
        telefono: data.telefono || null,
        celular: data.celular || null,
        sub_categoria_id: data.sub_categoria_id
      }

      let resultado

      if (isEditing) {
        resultado = await updateServicio.mutateAsync({
          id: lugarSeleccionado!.id!,
          ...datosComunes
        })
      } else {
        resultado = await createServicio.mutateAsync({
          id: lugarSeleccionado!.id!,
          ...datosComunes
        })
      }

      if (isEditing) {
        showSuccess('¡Lugar de servicio actualizado correctamente!')
        setTimeout(() => {
          router.push('/servicios/list')
        }, 2000)
      } else {
        showSuccess('¡Lugar de servicio creado correctamente!')
        setModalExitoOpen(true)
      }
    } catch (error: any) {
      console.error(`Error al ${isEditing ? 'actualizar' : 'crear'} servicio:`, error)

      if (
        error.message?.includes('Ya existe el registro de lugar con categoría Servicio') ||
        error.message?.includes('Unique constraint failed on the fields: (`id`)')
      ) {
        setModalLugarExisteOpen(true)

        return
      }

      showError(`Error al ${isEditing ? 'actualizar' : 'crear'} el lugar de servicio`)
    }
  }

  const resetearFormulario = () => {
    setLugarSeleccionado(null)
    setSearchLugar('')
    setModalExitoOpen(false)
    reset({
      lugar_id: 0,
      telefono: '',
      celular: '',
      sub_categoria_id: 0
    })
  }

  const handleCancelar = () => {
    router.push('/servicios/list')
  }

  const handleCrearOtro = () => {
    resetearFormulario()
    setModalExitoOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCerrarModalExito = () => {
    router.push('/servicios/list')
  }

  const handleLimpiarLugar = () => {
    setLugarSeleccionado(null)
    setValue('lugar_id', 0, { shouldValidate: true })
    setModalLugarExisteOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    showSuccess('Puedes seleccionar un nuevo lugar')
  }

  if (cargandoLugarExistente) {
    return (
      <Card>
        <CardContent>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Cargando información...</Typography>
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
            ¡Lugar de Servicio Creado Correctamente!
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
        <Typography variant='body1' color='textSecondary'>
          El lugar de servicio ha sido creado exitosamente en el sistema.
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
          startIcon={<i className='tabler-plus' style={{ fontSize: '18px' }} />}
          sx={{ minWidth: 180 }}
        >
          Crear Otro Lugar
        </Button>

        <Button
          variant='contained'
          color='primary'
          size='large'
          onClick={handleCerrarModalExito}
          startIcon={<i className='tabler-list' style={{ fontSize: '18px' }} />}
          sx={{ minWidth: 180 }}
        >
          Ver Lista de Lugares
        </Button>
      </DialogActions>
    </Dialog>
  )

  const ModalLugarExiste = () => (
    <Dialog
      open={modalLugarExisteOpen}
      onClose={() => setModalLugarExisteOpen(false)}
      maxWidth='sm'
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, textAlign: 'center' } }}
    >
      <DialogTitle sx={{ position: 'relative' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: 'warning.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            <i className='tabler-alert-circle' style={{ fontSize: '32px' }} />
          </Box>
          <Typography variant='h5' component='div' color='warning.main' fontWeight='600'>
            Lugar Ya Registrado
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
        <Typography variant='body1' sx={{ mb: 1 }}>
          El lugar <strong>&quot;{lugarSeleccionado?.nombre_es}&quot;</strong> ya está registrado como lugar de
          servicio.
        </Typography>
        <Typography variant='body2' color='textSecondary'>
          Puedes seleccionar otro lugar o ir a la lista para editarlo.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', gap: 2, px: 3, pb: 3 }}>
        <Button
          variant='contained'
          color='primary'
          size='large'
          onClick={handleLimpiarLugar}
          startIcon={<i className='tabler-refresh' style={{ fontSize: '18px' }} />}
          sx={{ minWidth: 180 }}
        >
          Seleccionar Otro Lugar
        </Button>

        <Button
          variant='outlined'
          color='primary'
          size='large'
          onClick={() => {
            setModalLugarExisteOpen(false)
            router.push('/servicios/list')
          }}
          startIcon={<i className='tabler-list' style={{ fontSize: '18px' }} />}
          sx={{ minWidth: 180 }}
        >
          Ver Lista de Servicios
        </Button>
      </DialogActions>
    </Dialog>
  )

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type='hidden' {...register('lugar_id', { valueAsNumber: true })} />
        <Grid container spacing={6}>
          {error &&
            !error.message?.includes('Ya existe el registro de lugar con categoría Servicio') &&
            !error.message?.includes('Unique constraint failed on the fields: (`id`)') && (
              <Grid size={{ xs: 12 }}>
                <Alert severity='error'>
                  <Typography variant='h6'>Error al {isEditing ? 'actualizar' : 'crear'} lugar de servicio</Typography>
                  {error.message || 'Ha ocurrido un error inesperado'}
                </Alert>
              </Grid>
            )}

          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader
                title='📍 Selección de Lugar'
                subheader='Busque un lugar existente o cree uno nuevo'
                action={
                  isEditing ? (
                    <Chip label='Modo Edición' color='info' variant='outlined' />
                  ) : (
                    <Chip label='Modo Creación' color='success' variant='outlined' />
                  )
                }
              />

              <CardContent>
                {lugarSeleccionado && (
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <div className='flex items-center justify-between'>
                        <div>
                          <Typography variant='h6' color={isEditing ? 'info.main' : 'success.main'}>
                            {isEditing ? '🔒 Lugar fijo' : '✓ Lugar seleccionado'}
                          </Typography>
                          <Typography variant='body1' sx={{ fontWeight: 'medium' }}>
                            {lugarSeleccionado.nombre_es}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {lugarSeleccionado.direccion}
                          </Typography>
                          {isEditing && (
                            <Typography variant='caption' color='text.secondary'>
                              Actualiza la información del lugar si lo deseas
                            </Typography>
                          )}
                        </div>

                        {isEditing ? (
                          <Button
                            variant='outlined'
                            size='small'
                            startIcon={<i className='tabler-edit' style={{ fontSize: '16px' }} />}
                            onClick={() => setModalEditarLugarOpen(true)}
                            disabled={isLoading}
                            sx={{ whiteSpace: 'nowrap' }}
                          >
                            Actualizar Información del Lugar
                          </Button>
                        ) : (
                          <Button
                            variant='outlined'
                            size='small'
                            onClick={() => setLugarSeleccionado(null)}
                            disabled={isLoading}
                          >
                            Cambiar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!lugarSeleccionado && (
                  <div className='flex gap-2'>
                    <div className='flex-1 relative'>
                      <ClickAwayListener onClickAway={handleClickAway}>
                        <div>
                          <CustomTextField
                            fullWidth
                            label='Buscar lugar existente'
                            placeholder='Escribe para buscar lugares...'
                            value={searchLugar}
                            onChange={handleBuscarLugar}
                            error={!!errors.lugar_id}
                            helperText={errors.lugar_id?.message || 'Busque un lugar existente...'}
                            disabled={isLoading}
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
                                          style={{ fontSize: '18px', marginRight: 8, color: 'text.secondary' }}
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
                      disabled={isLoading}
                      sx={{ whiteSpace: 'nowrap', height: '56px', minWidth: 'auto' }}
                    >
                      Nuevo Lugar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader
                title='🛠️ Información del Servicio'
                subheader='Complete los detalles específicos del Servicio'
              />
              <CardContent>
                <Grid container spacing={6}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      label='Teléfono (Opcional)'
                      value={watch('telefono') || ''}
                      onChange={handleNumericInput('telefono', 8)}
                      error={!!errors.telefono}
                      helperText={errors.telefono?.message || 'Máximo 8 dígitos (solo números)'}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      label='Celular '
                      value={watch('celular') || ''}
                      onChange={handleNumericInput('celular', 8)}
                      error={!!errors.celular}
                      helperText={errors.celular?.message || 'Exactamente 8 dígitos (solo números)'}
                    />
                  </Grid>

                  <Grid size={12}>
                    <CustomTextField
                      select
                      fullWidth
                      label='Subcategoría *'
                      value={watch('sub_categoria_id') ?? 0}
                      onChange={e => setValue('sub_categoria_id', Number(e.target.value) || 0)}
                      error={!!errors.sub_categoria_id}
                      helperText={errors.sub_categoria_id?.message}
                      disabled={isSubmitting}
                    >
                      <MenuItem value={0}>
                        <em>Seleccionar subcategoría...</em>
                      </MenuItem>
                      {subcategorias
                        .filter((sub: any) => sub.id !== 43)
                        .map((sub: any) => (
                          <MenuItem key={sub.id} value={sub.id}>
                            {sub.nombre_es}
                          </MenuItem>
                        ))}
                    </CustomTextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <div className='flex gap-4 justify-end'>
              <Button
                variant='tonal'
                color='secondary'
                size='large'
                onClick={handleCancelar}
                startIcon={<i className='tabler-arrow-left' style={{ fontSize: '18px' }} />}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type='submit'
                variant='contained'
                size='large'
                disabled={isSubmitting || cargandoLugarExistente}
                startIcon={isSubmitting ? <i className='tabler-loader' style={{ fontSize: '18px' }} /> : null}
              >
                {isSubmitting
                  ? isEditing
                    ? 'Actualizando...'
                    : 'Creando...'
                  : isEditing
                    ? 'Actualizar Lugar de Servicio'
                    : 'Crear Lugar de Servicio'}
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

      <ModalAddLugar
        open={modalEditarLugarOpen}
        onClose={() => setModalEditarLugarOpen(false)}
        onLugarCreado={handleLugarEditado}
        lugarAEditar={lugarSeleccionado}
      />

      <ModalExito />
      <ModalLugarExiste />
    </>
  )
}

export default FormularioServicio
