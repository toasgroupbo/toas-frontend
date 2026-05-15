'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'

import { useAuth } from '@/contexts/AuthContext'
import { useSettings, useUpdateSettings } from '@/hooks/useSettings'
import TipTapEditor from './components/TipTapEditor'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel = ({ children, value, index }: TabPanelProps) => {
  return (
    <div role='tabpanel' hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

const TerminosView = () => {
  const router = useRouter()
  const { isSuperAdmin, isLoading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState(0)
  const [terminosContent, setTerminosContent] = useState('')
  const [politicasContent, setPoliticasContent] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  const { data: settings, isLoading, error } = useSettings()
  const updateSettingsMutation = useUpdateSettings()

  useEffect(() => {
    if (!authLoading && !isSuperAdmin) {
      router.push('/home')
    }
  }, [authLoading, isSuperAdmin, router])

  useEffect(() => {
    if (settings) {
      setTerminosContent(settings.terminos_y_condiciones || '')
      setPoliticasContent(settings.politicas_de_privacidad || '')
    }
  }, [settings])

  const handleTerminosChange = (html: string) => {
    setTerminosContent(html)
    setHasChanges(true)
  }

  const handlePoliticasChange = (html: string) => {
    setPoliticasContent(html)
    setHasChanges(true)
  }

  const handleSave = async () => {
    await updateSettingsMutation.mutateAsync({
      terminos_y_condiciones: terminosContent,
      politicas_de_privacidad: politicasContent
    })
    setHasChanges(false)
  }

  if (authLoading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress size={40} />
      </Box>
    )
  }

  if (!isSuperAdmin) {
    return (
      <Box p={4}>
        <Alert severity='error'>No tienes permisos para acceder a esta página.</Alert>
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' minHeight='400px' gap={2}>
        <CircularProgress size={40} />
        <Typography variant='body2' color='text.secondary'>
          Cargando configuración...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity='error'>Error al cargar la configuración. Por favor, intente nuevamente.</Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Card>
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <i className='tabler-file-text' style={{ fontSize: '32px', color: 'var(--mui-palette-primary-main)' }} />
              <div>
                <Typography variant='h5' fontWeight='bold'>
                  Términos y Políticas
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Configura los términos de uso y políticas de privacidad de la plataforma
                </Typography>
              </div>
            </Box>
            <Button
              variant='contained'
              startIcon={
                updateSettingsMutation.isPending ? (
                  <CircularProgress size={20} color='inherit' />
                ) : (
                  <i className='tabler-device-floppy' />
                )
              }
              onClick={handleSave}
              disabled={!hasChanges || updateSettingsMutation.isPending}
            >
              {updateSettingsMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </Box>
        </Box>

        <Box sx={{ px: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              icon={<i className='tabler-file-certificate' style={{ fontSize: '20px' }} />}
              iconPosition='start'
              label='Términos y Condiciones'
            />
            <Tab
              icon={<i className='tabler-shield-lock' style={{ fontSize: '20px' }} />}
              iconPosition='start'
              label='Políticas de Privacidad'
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ mb: 2 }}>
              <Typography variant='subtitle1' fontWeight={600} gutterBottom>
                Términos y Condiciones de Uso
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Define los términos y condiciones que los usuarios deben aceptar para usar la plataforma.
              </Typography>
            </Box>
            <TipTapEditor
              key='terminos-editor'
              content={terminosContent}
              onChange={handleTerminosChange}
              placeholder='Escribe los términos y condiciones aquí...'
            />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Box sx={{ mb: 2 }}>
              <Typography variant='subtitle1' fontWeight={600} gutterBottom>
                Políticas de Privacidad
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Define las políticas de privacidad y manejo de datos de los usuarios.
              </Typography>
            </Box>
            <TipTapEditor
              key='politicas-editor'
              content={politicasContent}
              onChange={handlePoliticasChange}
              placeholder='Escribe las políticas de privacidad aquí...'
            />
          </TabPanel>
        </Box>

        {updateSettingsMutation.isSuccess && (
          <Box sx={{ px: 3, pb: 3 }}>
            <Alert severity='success'>Los cambios se han guardado correctamente.</Alert>
          </Box>
        )}

        {updateSettingsMutation.isError && (
          <Box sx={{ px: 3, pb: 3 }}>
            <Alert severity='error'>Error al guardar los cambios. Por favor, intente nuevamente.</Alert>
          </Box>
        )}
      </Card>
    </Box>
  )
}

export default TerminosView
