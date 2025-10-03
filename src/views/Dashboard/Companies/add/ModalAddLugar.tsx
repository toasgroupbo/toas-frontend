'use client'

import { useState, useCallback, useEffect } from 'react'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import { styled } from '@mui/material/styles'

import { useDropzone } from 'react-dropzone'

import CustomTextField from '@core/components/mui/TextField'
import { useLugares } from '@/hooks/useLugares'
import { useImagenes, type ImagenArchivo } from '@/hooks/useImagenes'
import { useAutoTranslation } from '@/hooks/useAutoTranslation'
import { lugarSchema, imagenFileSchema } from '@/schemas/lugaresSchema'
import type { Lugar, CreateLugarRequest } from '@/types/api/lugares'

const AppReactDropzone = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(6),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: 'transparent',
  '&:hover, &.drag-active': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover
  },
  '&.drag-reject': {
    borderColor: theme.palette.error.main,
    backgroundColor: theme.palette.error.light + '10'
  }
}))

interface ModalNuevoLugarProps {
  open: boolean
  onClose: () => void
  onLugarCreado: (lugar: any) => void
  lugarAEditar?: Lugar | null
}

const ModalAddLugar = ({ open, onClose, onLugarCreado, lugarAEditar }: ModalNuevoLugarProps) => {
  const { useCreateLugar, useUpdateLugar } = useLugares()
  const { useSubirImagen, procesarArchivo, limpiarPreview } = useImagenes()

  const createLugar = useCreateLugar()
  const updateLugar = useUpdateLugar()
  const subirImagen = useSubirImagen()

  const [imagenArchivo, setImagenArchivo] = useState<ImagenArchivo | null>(null)
  const [imagenError, setImagenError] = useState<string>('')
  const [subiendoImagen, setSubiendoImagen] = useState(false)
  const [imagenSubidaExitosa, setImagenSubidaExitosa] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<CreateLugarRequest>({
    resolver: zodResolver(lugarSchema),
    defaultValues: {
      nombre_es: '',
      nombre_en: '',
      descripcion_es: '',
      descripcion_en: '',
      direccion: '',
      ubicacion: '',
      imagenes: [],
      url_ubicacion: '',
      estado: true
    }
  })

  const watchNombreEs = watch('nombre_es') || ''
  const watchDescripcionEs = watch('descripcion_es') || ''
  const watchNombreEn = watch('nombre_en') || ''
  const watchDescripcionEn = watch('descripcion_en') || ''

  const traduccionNombre = useAutoTranslation((traduccion: string) => {
    setValue('nombre_en', traduccion)
  }, 1000)

  const traduccionDescripcion = useAutoTranslation((traduccion: string) => {
    setValue('descripcion_en', traduccion)
  }, 1500)

  const isEditing = !!lugarAEditar
  const isLoading = createLugar.isPending || updateLugar.isPending || subiendoImagen
  const error = createLugar.error || updateLugar.error || subirImagen.error

  useEffect(() => {
    if (isEditing && lugarAEditar) {
      reset({
        nombre_es: lugarAEditar.nombre_es || '',
        nombre_en: lugarAEditar.nombre_en || '',
        descripcion_es: lugarAEditar.descripcion_es || '',
        descripcion_en: lugarAEditar.descripcion_en || '',
        direccion: lugarAEditar.direccion || '',
        ubicacion: lugarAEditar.ubicacion || '',
        imagenes: lugarAEditar.imagenes || [],
        url_ubicacion: lugarAEditar.url_ubicacion || '',
        estado: lugarAEditar.estado ?? true
      })
    } else {
      handleLimpiarFormulario()
    }
  }, [isEditing, lugarAEditar, open])

  const handleNombreEsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setValue('nombre_es', value)
    traduccionNombre.translateText(value)
  }

  const handleNombreEnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setValue('nombre_en', value)
    traduccionNombre.setTargetValue(value)
  }

  const handleDescripcionEsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setValue('descripcion_es', value)
    traduccionDescripcion.translateText(value)
  }

  const handleDescripcionEnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setValue('descripcion_en', value)
    traduccionDescripcion.setTargetValue(value)
  }

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setImagenError('')
      setImagenSubidaExitosa(false)

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0]
        let errorMessage = 'Archivo no válido'

        if (rejection.errors) {
          const error = rejection.errors[0]

          switch (error.code) {
            case 'file-too-large':
              errorMessage = 'La imagen debe ser menor a 1MB'
              break
            case 'file-invalid-type':
              errorMessage = 'Solo se permiten archivos JPG/JPEG'
              break
            default:
              errorMessage = error.message || 'Archivo no válido'
          }
        }

        setImagenError(errorMessage)

        return
      }

      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]

      try {
        imagenFileSchema.parse({ file })

        if (imagenArchivo) {
          limpiarPreview(imagenArchivo)
        }

        const nuevaImagen = procesarArchivo(file)

        setImagenArchivo(nuevaImagen)
        setImagenError('')
      } catch (error) {
        if (error instanceof z.ZodError) {
          setImagenError(error.issues[0].message)
        } else {
          setImagenError('Error al procesar la imagen')
        }
      }
    },
    [procesarArchivo, imagenArchivo, limpiarPreview]
  )

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/jpg': ['.jpg']
    },
    maxSize: 1 * 1024 * 1024,
    multiple: false,
    disabled: isLoading,
    maxFiles: 1,
    validator: file => {
      if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
        return {
          code: 'file-invalid-type',
          message: 'Solo se permiten archivos JPG/JPEG'
        }
      }

      if (file.size > 1 * 1024 * 1024) {
        return {
          code: 'file-too-large',
          message: 'La imagen debe ser menor a 1MB'
        }
      }

      return null
    }
  })

  const handleEliminarImagen = () => {
    if (imagenArchivo) {
      limpiarPreview(imagenArchivo)
      setImagenArchivo(null)
      setImagenError('')
      setImagenSubidaExitosa(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const onSubmit = async (data: CreateLugarRequest) => {
    try {
      let nombreImagen = ''

      if (imagenArchivo) {
        try {
          imagenFileSchema.parse({ file: imagenArchivo.file })
        } catch (error) {
          if (error instanceof z.ZodError) {
            setImagenError(error.issues[0].message)

            return
          }
        }

        setSubiendoImagen(true)
        setImagenError('')

        try {
          nombreImagen = await subirImagen.mutateAsync(imagenArchivo.file)
          setImagenSubidaExitosa(true)
        } catch (error) {
          setSubiendoImagen(false)
          setImagenError('Error al subir la imagen. Intente nuevamente.')
          console.error('Error subiendo imagen:', error)

          return
        } finally {
          setSubiendoImagen(false)
        }
      }

      const { url_ubicacion, ...restData } = data

      const datosApi = {
        ...restData,
        url_ubicacion: url_ubicacion?.trim() || null,
        imagenes: nombreImagen ? [nombreImagen] : data.imagenes
      } as CreateLugarRequest

      let resultado

      if (isEditing && lugarAEditar?.id) {
        resultado = await updateLugar.mutateAsync({
          id: lugarAEditar.id,
          ...datosApi
        })
      } else {
        resultado = await createLugar.mutateAsync(datosApi)
      }

      onLugarCreado(resultado)
      handleLimpiarFormulario()
    } catch (error) {
      console.error(`Error al ${isEditing ? 'actualizar' : 'crear'} lugar:`, error)
    }
  }

  const handleLimpiarFormulario = () => {
    if (imagenArchivo) {
      limpiarPreview(imagenArchivo)
    }

    reset({
      nombre_es: '',
      nombre_en: '',
      descripcion_es: '',
      descripcion_en: '',
      direccion: '',
      ubicacion: '',
      imagenes: [],
      url_ubicacion: '',
      estado: true
    })
    setImagenArchivo(null)
    setImagenError('')
    setImagenSubidaExitosa(false)
    traduccionNombre.setTargetValue('')
    traduccionDescripcion.setTargetValue('')
  }

  const handleClose = () => {
    if (!isLoading) {
      handleLimpiarFormulario()
      onClose()
    }
  }

  const getDropzoneClassName = () => {
    if (isDragAccept) return 'drag-active'
    if (isDragReject) return 'drag-reject'

    return ''
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle>
        <div className='flex items-center justify-between'>
          <div>
            <Typography variant='h5' component='div'>
              {isEditing ? 'Editar Lugar' : 'Crear Nuevo Lugar'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {isEditing ? 'Modifica la información del lugar' : 'Complete la información del nuevo lugar'}
            </Typography>
          </div>
          <IconButton onClick={handleClose} disabled={isLoading}>
            <i className='tabler-x' />
          </IconButton>
        </div>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          {error && (
            <Alert severity='error' sx={{ mb: 3 }}>
              <Typography variant='h6'>Error al {isEditing ? 'actualizar' : 'crear'} lugar</Typography>
              {error.message || 'Ha ocurrido un error inesperado'}
            </Alert>
          )}

          <Grid container spacing={4}>
            <Grid size={12}>
              <Typography variant='h6' gutterBottom>
                Información Básica
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Nombre (Español) *'
                placeholder='Ej: Auditorio Principal'
                value={watchNombreEs}
                onChange={handleNombreEsChange}
                error={!!errors.nombre_es}
                helperText={
                  errors.nombre_es?.message ||
                  (traduccionNombre.error
                    ? `❌ ${traduccionNombre.error}`
                    : traduccionNombre.isSupported
                      ? 'Se traduce automáticamente'
                      : 'Traducción no disponible')
                }
                disabled={isLoading}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Nombre (Inglés) *'
                placeholder=''
                value={watchNombreEn}
                onChange={handleNombreEnChange}
                error={!!errors.nombre_en}
                helperText={
                  errors.nombre_en?.message ||
                  (isEditing ? 'Edite manualmente si es necesario' : 'Traducción automática (editable)')
                }
                disabled={isLoading || traduccionNombre.isTranslating}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Dirección'
                placeholder='Ej: Av. Principal 123, Piso 2'
                {...register('direccion')}
                error={!!errors.direccion}
                helperText={errors.direccion?.message}
                disabled={isLoading}
              />
            </Grid>
            {/* 
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Ubicación (Coordenadas)'
                placeholder=''
                {...register('ubicacion')}
                disabled={isLoading}
                helperText='Ubicación específica dentro del lugar'
              />
            </Grid> */}

            <Grid size={12}>
              <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
                Descripciones
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                multiline
                rows={4}
                label='Descripción (Español)'
                placeholder='Descripción detallada del lugar en español...'
                value={watchDescripcionEs}
                onChange={handleDescripcionEsChange}
                disabled={isLoading}
                helperText={
                  traduccionDescripcion.error
                    ? `❌ ${traduccionDescripcion.error}`
                    : traduccionDescripcion.isSupported
                      ? 'Se traduce automáticamente'
                      : 'Traducción no disponible'
                }
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                multiline
                rows={4}
                label='Descripción (Inglés)'
                placeholder='Detailed description of the place in English...'
                value={watchDescripcionEn}
                onChange={handleDescripcionEnChange}
                disabled={isLoading || traduccionDescripcion.isTranslating}
                helperText={isEditing ? 'Edite manualmente si es necesario' : 'Traducción automática (editable)'}
              />
            </Grid>

            <Grid size={12}>
              <CustomTextField
                fullWidth
                label='URL de Ubicación'
                placeholder='https://maps.google.com/... o https://goo.gl/maps/...'
                {...register('url_ubicacion')}
                error={!!errors.url_ubicacion}
                helperText={
                  errors.url_ubicacion?.message ||
                  'Enlace de Google Maps (debe empezar con: https://maps.google.com/ o https://goo.gl/maps/)'
                }
                disabled={isLoading}
              />
            </Grid>

            <Grid size={12}>
              <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
                Imagen
              </Typography>
            </Grid>

            <Grid size={12}>
              {isEditing && lugarAEditar?.imagenes?.[0] && !imagenArchivo && (
                <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant='subtitle2' gutterBottom>
                    Imagen actual
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      component='img'
                      src={`${process.env.NEXT_PUBLIC_API_URL}api/imagenes/lugares/${lugarAEditar.imagenes[0]}`}
                      alt={lugarAEditar.nombre_es}
                      sx={{
                        width: 80,
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: 1
                      }}
                    />
                    <Typography variant='body2' color='text.secondary'>
                      Sube una nueva imagen para reemplazar la actual
                    </Typography>
                  </Box>
                </Box>
              )}

              <AppReactDropzone {...getRootProps()} className={getDropzoneClassName()}>
                <input {...getInputProps()} />

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      backgroundColor: isDragReject ? 'error.light' : 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isDragReject ? 'error.contrastText' : 'primary.contrastText'
                    }}
                  >
                    <i className={isDragReject ? 'tabler-x' : 'tabler-cloud-upload'} style={{ fontSize: '2rem' }} />
                  </Box>

                  <div>
                    <Typography variant='h6' gutterBottom>
                      {isDragActive
                        ? isDragReject
                          ? 'Archivo no válido'
                          : 'Suelta la imagen aquí'
                        : isEditing
                          ? 'Arrastra una nueva imagen aquí'
                          : 'Arrastra y suelta tu imagen aquí'}
                    </Typography>

                    {!isDragActive && (
                      <>
                        <Typography variant='body2' color='text.secondary'>
                          o haz clic para seleccionar archivo
                        </Typography>
                        <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                          Solo JPG/JPEG • Máximo: 1MB
                        </Typography>
                      </>
                    )}
                  </div>
                </Box>
              </AppReactDropzone>

              {imagenError && (
                <Alert severity='error' sx={{ mt: 2 }}>
                  {imagenError}
                </Alert>
              )}

              {subiendoImagen && (
                <Alert severity='info' sx={{ mt: 2 }}>
                  Subiendo imagen...
                </Alert>
              )}

              {imagenSubidaExitosa && !subiendoImagen && (
                <Alert severity='success' sx={{ mt: 2 }}>
                  Imagen subida exitosamente
                </Alert>
              )}

              {imagenArchivo && (
                <Box sx={{ mt: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant='subtitle2' gutterBottom>
                    {isEditing ? 'Nueva imagen seleccionada' : 'Imagen seleccionada'}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      component='img'
                      src={imagenArchivo.preview}
                      alt={imagenArchivo.file.name}
                      sx={{
                        width: 80,
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: 1
                      }}
                    />

                    <Box sx={{ flex: 1 }}>
                      <Typography variant='body2' noWrap sx={{ maxWidth: '300px' }}>
                        {imagenArchivo.file.name}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {formatFileSize(imagenArchivo.file.size)}
                      </Typography>
                    </Box>

                    <IconButton onClick={handleEliminarImagen} disabled={isLoading} color='error' size='small'>
                      <i className='tabler-trash' />
                    </IconButton>
                  </Box>
                </Box>
              )}
            </Grid>

            <Grid size={12}>
              <Controller
                name='estado'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={field.onChange} disabled={isLoading} />}
                    label='Lugar activo'
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} disabled={isLoading} color='secondary'>
            Cancelar
          </Button>
          <Button type='submit' variant='contained' disabled={isLoading || !!imagenError}>
            {isLoading
              ? subiendoImagen
                ? 'Subiendo imagen...'
                : isEditing
                  ? 'Actualizando...'
                  : 'Creando...'
              : isEditing
                ? 'Actualizar Lugar'
                : 'Crear Lugar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ModalAddLugar
