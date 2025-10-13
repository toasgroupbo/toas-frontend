'use client'

import { useState, useEffect, useCallback } from 'react'

import { useRouter } from 'next/navigation'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

import CustomTextField from '@core/components/mui/TextField'
import ModalAddLugar from './ModalAddLugar'

import { useEventoActividad } from '@/hooks/UseEventoActividad'
import { useAutoTranslation } from '@/hooks/useAutoTranslation'
import { useSnackbar } from '@/contexts/SnackbarContext'
import { useAuth } from '@/contexts/AuthContext'
import { eventoActividadSchema, type EventoActividadFormData } from '@/schemas/eventoActividadSchema'

interface Props {
  fechaInicial?: string
  actividadId?: number
  onSuccess?: () => void
  onCancel?: () => void
}

const formatearFechaParaNombre = (fechaString: string): { es: string; en: string } => {
  if (!fechaString) return { es: '', en: '' }

  const fecha = new Date(fechaString + 'T00:00:00')

  const diasSemana = {
    es: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  }

  const meses = {
    es: [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre'
    ],
    en: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ]
  }

  const diaSemana = fecha.getDay()
  const dia = fecha.getDate()
  const mes = fecha.getMonth()

  const nombreEs = `${diasSemana.es[diaSemana]}, ${dia} de ${meses.es[mes]}`
  const nombreEn = `${diasSemana.en[diaSemana]}, ${meses.en[mes]} ${dia}`

  return {
    es: nombreEs,
    en: nombreEn
  }
}

const FormularioEventoActividad: React.FC<Props> = ({ fechaInicial, actividadId }) => {
  const {
    guardarFormularioCompleto,
    useDatosFormulario,
    useTiposActividad,
    useBuscarLugares,
    usePerfilesNegocio,
    isGuardando,
    errorGuardando
  } = useEventoActividad()

  const router = useRouter()
  const { showSuccess, showError } = useSnackbar()

  const [fechaParaBusqueda, setFechaParaBusqueda] = useState(fechaInicial || '')
  const [lugaresSeleccionados, setLugaresSeleccionados] = useState<{ id: number; nombre_es: string }[]>([])
  const [modalExitoOpen, setModalExitoOpen] = useState(false)

  const [searchLugar, setSearchLugar] = useState('')
  const [filtroLugarDebounced, setFiltroLugarDebounced] = useState('')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [open, setOpen] = useState(false)

  const [modalNuevoLugarOpen, setModalNuevoLugarOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<EventoActividadFormData>({
    resolver: zodResolver(eventoActividadSchema),
    defaultValues: {
      fecha: fechaInicial || '',
      nombreDiaEs: '',
      nombreDiaEn: '',
      descripcionDiaEs: '',
      descripcionDiaEn: '',
      nombreActividadEs: '',
      nombreActividadEn: '',
      descripcionActividadEs: '',
      descripcionActividadEn: '',
      horaInicio: '',
      horaFin: '',
      lugares: [],
      tipoSeleccionado: '',
      perfilNegocioSeleccionado: ''
    }
  })

  const watchFecha = watch('fecha')
  const watchNombreActividadEs = watch('nombreActividadEs')
  const watchDescripcionActividadEs = watch('descripcionActividadEs')
  const watchDescripcionDiaEs = watch('descripcionDiaEs')

  const traduccionDescripcionActividad = useAutoTranslation((traduccion: string) => {
    setValue('descripcionActividadEn', traduccion)
  }, 1500)

  const traduccionDescripcionDia = useAutoTranslation((traduccion: string) => {
    setValue('descripcionDiaEn', traduccion)
  }, 1500)

  const traduccionNombreActividad = useAutoTranslation((traduccion: string) => {
    setValue('nombreActividadEn', traduccion)
  }, 1000)

  const { hasRole } = useAuth()
  const isAdminNegocio = hasRole('Admin_Negocio')
  const isOperador = hasRole('Operador')
  const isOperadorNegocio = hasRole('Operador_Negocio')

  useEffect(() => {
    if (!watchFecha) {
      setFechaParaBusqueda('')

      return
    }

    const fechaCompleta = /^\d{4}-\d{2}-\d{2}$/.test(watchFecha)

    if (!fechaCompleta) return

    const timeoutId = setTimeout(() => {
      setFechaParaBusqueda(watchFecha)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [watchFecha])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFiltroLugarDebounced(searchLugar)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchLugar])

  const { data: datosExistentes, isLoading: cargandoDatos } = useDatosFormulario(fechaParaBusqueda, actividadId)
  const { data: tiposResponse, isLoading: cargandoTipos } = useTiposActividad()

  const { data: perfilesNegocio = [], isLoading: cargandoPerfiles } = usePerfilesNegocio(
    !isAdminNegocio && !isOperador && !isOperadorNegocio
  )

  const { data: lugaresBusqueda = [], isLoading: buscandoLugares } = useBuscarLugares(
    filtroLugarDebounced,
    filtroLugarDebounced.length >= 2
  )

  const tiposActividad = tiposResponse || []

  useEffect(() => {
    setValue('nombreDiaEs', '')
    setValue('nombreDiaEn', '')
    setValue('descripcionDiaEs', '')
    setValue('descripcionDiaEn', '')

    if (cargandoDatos) {
      return
    }

    if (datosExistentes?.evento) {
      setValue('nombreDiaEs', datosExistentes.evento.nombre_es || '')
      setValue('nombreDiaEn', datosExistentes.evento.nombre_en || '')
      setValue('descripcionDiaEs', datosExistentes.evento.descripcion_es || '')
      setValue('descripcionDiaEn', datosExistentes.evento.descripcion_en || '')
    } else if (fechaParaBusqueda) {
      const nombres = formatearFechaParaNombre(fechaParaBusqueda)

      setValue('nombreDiaEs', nombres.es)
      setValue('nombreDiaEn', nombres.en)
    }
  }, [datosExistentes?.evento, fechaParaBusqueda, cargandoDatos, setValue])

  useEffect(() => {
    if (actividadId && datosExistentes?.actividad) {
      const actividad = datosExistentes.actividad

      setValue('nombreActividadEs', actividad.nombre_es || '')
      setValue('nombreActividadEn', actividad.nombre_en || '')
      setValue('descripcionActividadEs', actividad.descripcion_es || '')
      setValue('descripcionActividadEn', actividad.descripcion_en || '')
      setValue('horaInicio', actividad.horaInicio || '')
      setValue('horaFin', actividad.horaFin || '')

      const lugaresIds = actividad.lugares || []

      const lugares = lugaresIds.map(item => ({
        id: item.lugar.id,
        nombre_es: item.lugar.nombre_es
      }))

      setLugaresSeleccionados(lugares)
      setValue(
        'lugares',
        lugares.map(l => l.id)
      )
      setValue('tipoSeleccionado', actividad.tipo_id?.toString() || '')
      setValue('perfilNegocioSeleccionado', actividad.perfil_negocio_id?.toString() || '')
    } else if (!actividadId) {
      setValue('nombreActividadEs', '')
      setValue('nombreActividadEn', '')
      setValue('descripcionActividadEs', '')
      setValue('descripcionActividadEn', '')
      setValue('horaInicio', '')
      setValue('horaFin', '')
      setLugaresSeleccionados([])
      setValue('lugares', [])
      setValue('tipoSeleccionado', '')
      setValue('perfilNegocioSeleccionado', '')
    }
  }, [datosExistentes?.actividad, actividadId])

  useEffect(() => {
    if (actividadId && datosExistentes?.evento?.fecha && !watchFecha) {
      const fecha = datosExistentes.evento.fecha.split('T')[0]

      setValue('fecha', fecha)
      setFechaParaBusqueda(fecha)
    }
  }, [datosExistentes?.evento?.fecha, actividadId, watchFecha, setValue])

  useEffect(() => {
    if (lugaresBusqueda.length > 0 && filtroLugarDebounced.length >= 2) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }, [lugaresBusqueda, filtroLugarDebounced])

  const handleBuscarLugar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setSearchLugar(value)
    setAnchorEl(e.currentTarget)

    if (value.trim() === '') {
      setOpen(false)
    }
  }

  const handleDescripcionActividadEsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setValue('descripcionActividadEs', value)
    traduccionDescripcionActividad.translateText(value)
  }

  const handleDescripcionDiaEsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setValue('descripcionDiaEs', value)
    traduccionDescripcionDia.translateText(value)
  }

  const handleNombreActividadEsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setValue('nombreActividadEs', value)
    traduccionNombreActividad.translateText(value)
  }

  const handleSeleccionarLugar = (lugar: any) => {
    if (!lugaresSeleccionados.find(l => l.id === lugar.id)) {
      const nuevosLugares = [...lugaresSeleccionados, { id: lugar.id, nombre_es: lugar.nombre_es }]

      setLugaresSeleccionados(nuevosLugares)
      setValue(
        'lugares',
        nuevosLugares.map(l => l.id)
      )
    }

    setSearchLugar('')
    setOpen(false)
  }

  const handleEliminarLugar = (lugarId: number) => {
    const nuevosLugares = lugaresSeleccionados.filter(lugar => lugar.id !== lugarId)

    setLugaresSeleccionados(nuevosLugares)
    setValue(
      'lugares',
      nuevosLugares.map(l => l.id)
    )
  }

  const handleLimpiarBusqueda = () => {
    setSearchLugar('')
    setOpen(false)
  }

  const handleClickAway = () => {
    setOpen(false)
  }

  const handleAbrirModalNuevoLugar = () => {
    setModalNuevoLugarOpen(true)
  }

  const handleCerrarModalNuevoLugar = () => {
    setModalNuevoLugarOpen(false)
  }

  const handleNuevoLugarCreado = (nuevoLugar: any) => {
    const lugar = nuevoLugar.data || nuevoLugar

    if (lugar.id) {
      const nuevoLugarParaEstado = {
        id: lugar.id,
        nombre_es: lugar.nombre_es || `Lugar ${lugar.id}`
      }

      const nuevosLugares = [...lugaresSeleccionados, nuevoLugarParaEstado]

      setLugaresSeleccionados(nuevosLugares)
      setValue(
        'lugares',
        nuevosLugares.map(l => l.id)
      )
    }

    setModalNuevoLugarOpen(false)
  }

  const resetearCamposDia = () => {
    setValue('fecha', '')
    setFechaParaBusqueda('')
    setValue('nombreDiaEs', '')
    setValue('nombreDiaEn', '')
    setValue('descripcionDiaEs', '')
    setValue('descripcionDiaEn', '')
  }

  const resetearTodoFormulario = () => {
    reset()
    setFechaParaBusqueda('')
    setLugaresSeleccionados([])
    setSearchLugar('')
    setOpen(false)
  }

  const handleAgregarActividadOtroDia = () => {
    resetearCamposDia()
    setModalExitoOpen(false)
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const handleAgregarNuevaActividad = () => {
    resetearTodoFormulario()
    setModalExitoOpen(false)
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const handleCerrarModalExito = () => {
    resetearTodoFormulario()
    setModalExitoOpen(false)
  }

  const handleCancelar = () => {
    router.push('/actividades/list')
  }

  const handleCerrarYRedirigir = () => {
    router.push('/actividades/list')
  }

  const onSubmit = async (data: EventoActividadFormData) => {
    try {
      const formData = {
        fecha: data.fecha,
        nombre_dia_es: data.nombreDiaEs,
        nombre_dia_en: data.nombreDiaEn,
        descripcion_dia_es: data.descripcionDiaEs,
        descripcion_dia_en: data.descripcionDiaEn,
        nombre_actividad_es: data.nombreActividadEs,
        nombre_actividad_en: data.nombreActividadEn,
        descripcion_actividad_es: data.descripcionActividadEs,
        descripcion_actividad_en: data.descripcionActividadEn,
        programa_es: '',
        programa_en: '',
        horaInicio: data.horaInicio,
        horaFin: data.horaFin || '',
        lugares: data.lugares,
        tipo_id: parseInt(data.tipoSeleccionado) || 1,
        perfil_negocio_id: parseInt(data.perfilNegocioSeleccionado) || 1,
        actividadId
      }

      const resultado = await guardarFormularioCompleto(formData)

      if (actividadId) {
        showSuccess('¡Actividad actualizada correctamente!')
        setTimeout(() => {
          router.push('/actividades/list')
        }, 2000)
      } else {
        showSuccess('¡Actividad creada correctamente!')
        setModalExitoOpen(true)
      }
    } catch (error) {
      console.error('❌ Error guardando:', error)
      showError('Error al guardar la actividad')
    }
  }

  if (cargandoTipos || cargandoPerfiles) {
    return (
      <Card>
        <CardContent>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Typography>Cargando formulario...</Typography>
          </div>
        </CardContent>
      </Card>
    )
  }

  const eventoExistente = datosExistentes?.evento
  const mostrarDescripcionDia = !isAdminNegocio && !isOperador && !isOperadorNegocio

  const ModalExito = () => (
    <Dialog
      open={modalExitoOpen}
      onClose={handleCerrarModalExito}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          textAlign: 'center'
        }
      }}
    >
      <DialogTitle sx={{ position: 'relative' }}>
        <IconButton
          onClick={handleCerrarModalExito}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'grey.500',
            '&:hover': {
              color: 'grey.700',
              backgroundColor: 'grey.100'
            }
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
            ¡Actividad Registrada Correctamente!
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
        <Typography variant='body1' color='textSecondary'>
          La actividad ha sido {actividadId ? 'actualizada' : 'creada'} exitosamente en el sistema.
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
          onClick={handleAgregarActividadOtroDia}
          startIcon={<i className='tabler-calendar-plus' style={{ fontSize: '18px' }} />}
          sx={{ minWidth: 180 }}
        >
          Agregar Actividad a Otro Día
        </Button>

        <Button
          variant='contained'
          color='primary'
          size='large'
          onClick={handleAgregarNuevaActividad}
          startIcon={<i className='tabler-plus' style={{ fontSize: '18px' }} />}
          sx={{ minWidth: 180 }}
        >
          Agregar Nueva Actividad
        </Button>

        <Button
          variant='outlined'
          color='secondary'
          size='large'
          onClick={handleCerrarYRedirigir}
          startIcon={<i className='tabler-x' style={{ fontSize: '18px' }} />}
          sx={{ minWidth: 120 }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader
                title='📅 Información del Día'
                subheader='Configure el día de la actividad'
                action={
                  cargandoDatos ? (
                    <Chip label='Buscando...' color='default' variant='outlined' size='small' />
                  ) : eventoExistente ? (
                    <Chip
                      label='Día agendado – puede editar la descripción si lo desea.'
                      color='info'
                      variant='outlined'
                      size='small'
                    />
                  ) : fechaParaBusqueda ? (
                    <Chip
                      label='Día nuevo – se añadirá como día con actividades.'
                      color='success'
                      variant='outlined'
                      size='small'
                    />
                  ) : null
                }
              />
              <CardContent>
                <Grid container spacing={6} className='mbe-6'>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      fullWidth
                      type='date'
                      label='Fecha de la actividad'
                      {...register('fecha')}
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.fecha}
                      helperText={
                        errors.fecha?.message ||
                        (cargandoDatos ? 'Buscando información del día...' : 'Seleccione la día de la actividad')
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      fullWidth
                      label='Día de la actividad (Español)'
                      {...register('nombreDiaEs')}
                      helperText={eventoExistente ? '' : 'Se genera automáticamente al seleccionar la fecha'}
                      disabled={true}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      fullWidth
                      label='Día de la actividad (Inglés)'
                      {...register('nombreDiaEn')}
                      helperText={eventoExistente ? '' : 'Se traduce automáticamente'}
                      disabled={true}
                    />
                  </Grid>
                </Grid>

                {mostrarDescripcionDia && (
                  <>
                    <Typography variant='h6' className='mbe-4 mbs-2'>
                      Descripción del Día
                    </Typography>
                    <Grid container spacing={6}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomTextField
                          fullWidth
                          multiline
                          rows={4}
                          label='Descripción del día (Español)'
                          value={watchDescripcionDiaEs}
                          onChange={handleDescripcionDiaEsChange}
                          helperText={
                            traduccionDescripcionDia.error
                              ? `❌ ${traduccionDescripcionDia.error}`
                              : traduccionDescripcionDia.isSupported
                                ? 'Se traduce automáticamente'
                                : 'Traducción no disponible'
                          }
                          disabled={cargandoDatos}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomTextField
                          fullWidth
                          multiline
                          rows={4}
                          label='Descripción del día (Inglés)'
                          {...register('descripcionDiaEn')}
                          onChange={e => traduccionDescripcionDia.setTargetValue(e.target.value)}
                          disabled={cargandoDatos || traduccionDescripcionDia.isTranslating}
                          helperText='Traducción automática (editable)'
                        />
                      </Grid>
                    </Grid>
                  </>
                )}

                {!isAdminNegocio && eventoExistente && (
                  <Alert severity='info' sx={{ mt: 2 }}>
                    Día existente con actividades puede editar la descripción si lo desea.
                  </Alert>
                )}

                {!isAdminNegocio && fechaParaBusqueda && !eventoExistente && !cargandoDatos && (
                  <Alert severity='success' sx={{ mt: 2 }}>
                    Se creará un nuevo día en agenda con la información proporcionada.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader
                title='🎯 Información de la Actividad'
                subheader='Detalles específicos de la actividad a realizar'
              />
              <CardContent>
                <Grid container spacing={6} className='mbe-6'>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      fullWidth
                      label='Nombre de la actividad (Español) *'
                      value={watchNombreActividadEs}
                      onChange={handleNombreActividadEsChange}
                      disabled={cargandoDatos}
                      error={!!errors.nombreActividadEs}
                      helperText={
                        errors.nombreActividadEs?.message ||
                        (traduccionNombreActividad.isSupported ? '' : 'Traducción no disponible')
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      fullWidth
                      label='Nombre de la actividad (Inglés) *'
                      {...register('nombreActividadEn')}
                      onChange={e => traduccionNombreActividad.setTargetValue(e.target.value)}
                      disabled={cargandoDatos || traduccionNombreActividad.isTranslating}
                      error={!!errors.nombreActividadEn}
                      helperText={errors.nombreActividadEn?.message || 'Traducción automática (editable)'}
                    />
                  </Grid>

                  {/* Hora de inicio */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      fullWidth
                      type='time'
                      label='Hora de inicio *'
                      {...register('horaInicio')}
                      onChange={e => {
                        const valorAnterior = watch('horaInicio') || ''
                        const valorNuevo = e.target.value

                        setValue('horaInicio', valorNuevo)

                        if (valorAnterior.length >= 3 && valorNuevo.length === 5) {
                          const minutosAnteriores = valorAnterior.length >= 5 ? valorAnterior.slice(-2) : ''
                          const minutosNuevos = valorNuevo.slice(-2)

                          if (minutosNuevos.match(/^[0-5][0-9]$/) && minutosAnteriores !== minutosNuevos) {
                            setTimeout(() => {
                              e.target.blur()
                            }, 150)
                          }
                        }
                      }}
                      InputLabelProps={{ shrink: true }}
                      disabled={cargandoDatos}
                      error={!!errors.horaInicio}
                      helperText={errors.horaInicio?.message || 'Seleccione la hora de inicio de la actividad'}
                    />
                  </Grid>

                  {/* Hora de fin */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      fullWidth
                      type='time'
                      label='Hora de fin'
                      {...register('horaFin')}
                      onChange={e => {
                        const valorAnterior = watch('horaFin') || ''
                        const valorNuevo = e.target.value

                        setValue('horaFin', valorNuevo)

                        if (valorAnterior.length >= 3 && valorNuevo.length === 5) {
                          const minutosAnteriores = valorAnterior.length >= 5 ? valorAnterior.slice(-2) : ''
                          const minutosNuevos = valorNuevo.slice(-2)

                          if (minutosNuevos.match(/^[0-5][0-9]$/) && minutosAnteriores !== minutosNuevos) {
                            setTimeout(() => {
                              e.target.blur()
                            }, 150)
                          }
                        }
                      }}
                      InputLabelProps={{ shrink: true }}
                      helperText='Hora de finalización de la actividad (opcional)'
                      disabled={cargandoDatos}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name='tipoSeleccionado'
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          select
                          fullWidth
                          label='Tipo de actividad *'
                          value={field.value}
                          onChange={field.onChange}
                          error={!!errors.tipoSeleccionado}
                          helperText={errors.tipoSeleccionado?.message || 'Seleccione el tipo de actividad'}
                          disabled={cargandoDatos}
                        >
                          <MenuItem value=''>
                            <em>Seleccionar tipo...</em>
                          </MenuItem>
                          {tiposActividad.map((tipo: any) => (
                            <MenuItem key={tipo.id} value={tipo.id.toString()}>
                              {tipo.tipo_es}
                            </MenuItem>
                          ))}
                        </CustomTextField>
                      )}
                    />
                  </Grid>

                  {!isAdminNegocio && !isOperador && !isOperadorNegocio && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name='perfilNegocioSeleccionado'
                        control={control}
                        render={({ field }) => (
                          <CustomTextField
                            select
                            fullWidth
                            label='Nombre Publicador '
                            value={field.value}
                            onChange={field.onChange}
                            disabled={cargandoDatos}
                            error={!!errors.perfilNegocioSeleccionado}
                            helperText={errors.perfilNegocioSeleccionado?.message || 'Seleccione el perfil de negocio'}
                          >
                            <MenuItem value=''>
                              <em>Seleccionar publicador...</em>
                            </MenuItem>
                            {perfilesNegocio.map((perfil: any) => (
                              <MenuItem key={perfil.id} value={perfil.id.toString()}>
                                {perfil.nombre_publicador}
                              </MenuItem>
                            ))}
                          </CustomTextField>
                        )}
                      />
                    </Grid>
                  )}
                  {!isOperadorNegocio && !isAdminNegocio && (
                    <Grid size={{ xs: 12 }}>
                      <div className='flex gap-2'>
                        <div className='flex-1 relative'>
                          <ClickAwayListener onClickAway={handleClickAway}>
                            <div>
                              <CustomTextField
                                fullWidth
                                label='Buscar lugares'
                                placeholder='Escribe al menos 4 caracteres para buscar...'
                                value={searchLugar}
                                onChange={handleBuscarLugar}
                                helperText='Busque y seleccione los lugares donde se realizará'
                                disabled={cargandoDatos}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position='start'>
                                      {buscandoLugares ? (
                                        <CircularProgress size={20} />
                                      ) : (
                                        <i className='tabler-search text-textSecondary' style={{ fontSize: '20px' }} />
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
                                open={open}
                                anchorEl={anchorEl}
                                placement='bottom-start'
                                style={{ width: anchorEl?.clientWidth, zIndex: 1300 }}
                              >
                                <Paper elevation={3} sx={{ maxHeight: 200, overflow: 'auto' }}>
                                  <List dense>
                                    {lugaresBusqueda.length > 0 ? (
                                      lugaresBusqueda.map((lugar: any) => (
                                        <ListItem key={lugar.id} disablePadding>
                                          <ListItemButton onClick={() => handleSeleccionarLugar(lugar)}>
                                            <i
                                              className='tabler-map-pin text-textSecondary'
                                              style={{ fontSize: '18px', marginRight: 8 }}
                                            />
                                            <ListItemText
                                              primary={lugar.nombre_es || lugar.nombre}
                                              secondary={lugar.nombre_en}
                                            />
                                          </ListItemButton>
                                        </ListItem>
                                      ))
                                    ) : filtroLugarDebounced.length >= 2 && !buscandoLugares ? (
                                      <ListItem>
                                        <ListItemText
                                          primary='No se encontraron lugares'
                                          secondary='Intenta con otros términos de búsqueda'
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
                          onClick={handleAbrirModalNuevoLugar}
                          disabled={cargandoDatos}
                          sx={{
                            whiteSpace: 'nowrap',
                            height: '56px',
                            minWidth: 'auto'
                          }}
                        >
                          Nuevo Lugar
                        </Button>
                      </div>

                      {lugaresSeleccionados.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                          <Typography variant='body2' color='textSecondary' gutterBottom>
                            Lugares seleccionados:
                          </Typography>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {lugaresSeleccionados.map(lugar => (
                              <Chip
                                key={lugar.id}
                                label={lugar.nombre_es}
                                onDelete={() => handleEliminarLugar(lugar.id)}
                                color='primary'
                                variant='outlined'
                                size='small'
                                disabled={cargandoDatos}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </Grid>
                  )}
                </Grid>

                <Typography variant='h6' className='mbe-4 mbs-2'>
                  Descripción de la Actividad
                </Typography>
                <Grid container spacing={6}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      fullWidth
                      multiline
                      rows={4}
                      label='Descripción de la actividad (Español)'
                      value={watchDescripcionActividadEs}
                      onChange={handleDescripcionActividadEsChange}
                      helperText={
                        traduccionDescripcionActividad.error
                          ? ` ${traduccionDescripcionActividad.error}`
                          : traduccionDescripcionActividad.isSupported
                            ? ' '
                            : 'Traducción no disponible'
                      }
                      disabled={cargandoDatos}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      fullWidth
                      multiline
                      rows={4}
                      label='Descripción de la actividad (Inglés)'
                      {...register('descripcionActividadEn')}
                      onChange={e => traduccionDescripcionActividad.setTargetValue(e.target.value)}
                      disabled={cargandoDatos || traduccionDescripcionActividad.isTranslating}
                      helperText='Traducción automática (editable manualmente)'
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {errorGuardando && (
            <Grid size={{ xs: 12 }}>
              <Alert severity='error'>
                <Typography variant='h6'>Error al guardar</Typography>
                {errorGuardando.message}
              </Alert>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <div className='flex gap-4 justify-end'>
              <Button
                variant='tonal'
                color='secondary'
                size='large'
                onClick={handleCancelar}
                startIcon={<i className='tabler-arrow-left' style={{ fontSize: '18px' }} />}
              >
                Cancelar
              </Button>
              <Button
                type='submit'
                variant='contained'
                size='large'
                disabled={isGuardando || cargandoDatos || !fechaParaBusqueda}
                startIcon={isGuardando ? <i className='tabler-loader' style={{ fontSize: '18px' }} /> : null}
              >
                {isGuardando ? 'Guardando...' : actividadId ? 'Actualizar' : 'Crear'} Actividad
              </Button>
            </div>
          </Grid>
        </Grid>
      </form>

      <ModalAddLugar
        open={modalNuevoLugarOpen}
        onClose={handleCerrarModalNuevoLugar}
        onLugarCreado={handleNuevoLugarCreado}
      />

      <ModalExito />
    </>
  )
}

export default FormularioEventoActividad
