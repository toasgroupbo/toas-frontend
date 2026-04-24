'use client'

import { useState } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import InputAdornment from '@mui/material/InputAdornment'
import Tooltip from '@mui/material/Tooltip'

import type { Travel } from '@/types/api/travels'
import { formatDate, formatTime } from '../utils/dateFormatters'
import { useSearchStaff, useAssignStaff, useCloseTravel } from '@/hooks/useCashierTravels'
import { useSnackbar } from '@/contexts/SnackbarContext'

interface StaffMember {
  id?: number
  name: string
  ci: string
  phone: string
  createdAt?: string
}

interface CloseTravelDialogProps {
  open: boolean
  onClose: () => void
  selectedTravel: Travel | undefined
  onConfirmClose: () => Promise<void>
  isLoading: boolean
}

const CloseTravelDialog = ({ open, onClose, selectedTravel, onConfirmClose, isLoading }: CloseTravelDialogProps) => {
  const [activeTab, setActiveTab] = useState<'driver' | 'assistant'>('driver')
  const [searchCI, setSearchCI] = useState('')
  const [drivers, setDrivers] = useState<StaffMember[]>([])
  const [assistants, setAssistants] = useState<StaffMember[]>([])
  const [searchResult, setSearchResult] = useState<StaffMember | null>(null)
  const [searchError, setSearchError] = useState('')
  const [editingIndex, setEditingIndex] = useState<{ type: 'driver' | 'assistant'; index: number } | null>(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '' })
  const [isAddingNew, setIsAddingNew] = useState<'driver' | 'assistant' | null>(null)
  const [newForm, setNewForm] = useState({ ci: '', name: '', phone: '' })

  const { showSuccess, showError } = useSnackbar()
  const searchStaffMutation = useSearchStaff()
  const assignStaffMutation = useAssignStaff()
  const closeTravelMutation = useCloseTravel()

  const canClose = drivers.length >= 1
  const isProcessing = assignStaffMutation.isPending || closeTravelMutation.isPending || isLoading

  const resetForm = () => {
    setSearchCI('')
    setSearchResult(null)
    setSearchError('')
    setDrivers([])
    setAssistants([])
    setEditingIndex(null)
    setEditForm({ name: '', phone: '' })
    setActiveTab('driver')
    setIsAddingNew(null)
    setNewForm({ ci: '', name: '', phone: '' })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSearch = async () => {
    if (!searchCI.trim()) {
      setSearchError('Ingrese un CI válido')

      return
    }

    setSearchError('')
    setSearchResult(null)

    try {
      const result = await searchStaffMutation.mutateAsync(searchCI)

      setSearchResult(result)
    } catch (error: any) {
      if (error?.response?.data?.message === 'Staff not found') {
        setSearchError('Personal no encontrado')
      } else {
        setSearchError(error?.response?.data?.message || 'Error al buscar el personal')
      }
    }
  }

  const handleAddStaff = () => {
    if (!searchResult) return

    if (activeTab === 'driver') {
      if (!drivers.some(d => d.ci === searchResult.ci)) {
        setDrivers([...drivers, searchResult])
        showSuccess('Conductor agregado')
        setSearchResult(null)
        setSearchCI('')
      } else {
        showError('Este conductor ya fue agregado')
      }
    } else {
      if (!assistants.some(a => a.ci === searchResult.ci)) {
        setAssistants([...assistants, searchResult])
        showSuccess('Ayudante agregado')
        setSearchResult(null)
        setSearchCI('')
      } else {
        showError('Este ayudante ya fue agregado')
      }
    }
  }

  const handleRemoveStaff = (type: 'driver' | 'assistant', index: number) => {
    if (type === 'driver') {
      setDrivers(drivers.filter((_, i) => i !== index))
    } else {
      setAssistants(assistants.filter((_, i) => i !== index))
    }
  }

  const handleEditStaff = (type: 'driver' | 'assistant', index: number, member: StaffMember) => {
    setEditingIndex({ type, index })
    setEditForm({ name: member.name, phone: member.phone })
  }

  const handleSaveEdit = () => {
    if (!editingIndex) return

    if (editingIndex.type === 'driver') {
      const updatedDrivers = [...drivers]

      updatedDrivers[editingIndex.index] = {
        ...updatedDrivers[editingIndex.index],
        name: editForm.name,
        phone: editForm.phone
      }
      setDrivers(updatedDrivers)
    } else {
      const updatedAssistants = [...assistants]

      updatedAssistants[editingIndex.index] = {
        ...updatedAssistants[editingIndex.index],
        name: editForm.name,
        phone: editForm.phone
      }
      setAssistants(updatedAssistants)
    }

    setEditingIndex(null)
    showSuccess('Datos actualizados')
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
  }

  const handleCreateNew = () => {
    if (activeTab === 'driver' && drivers.some(d => d.ci === searchCI)) {
      showError('Este conductor ya fue agregado')

      return
    }

    if (activeTab === 'assistant' && assistants.some(a => a.ci === searchCI)) {
      showError('Este ayudante ya fue agregado')

      return
    }

    setNewForm({ ci: searchCI, name: '', phone: '' })
    setIsAddingNew(activeTab)
    setSearchError('')
    setSearchResult(null)
  }

  const handleSaveNew = () => {
    if (!newForm.name.trim()) {
      showError('El nombre es requerido')

      return
    }

    const newMember: StaffMember = {
      name: newForm.name.trim(),
      ci: newForm.ci,
      phone: newForm.phone.trim()
    }

    if (isAddingNew === 'driver') {
      setDrivers([...drivers, newMember])
      showSuccess('Conductor agregado exitosamente')
    } else {
      setAssistants([...assistants, newMember])
      showSuccess('Ayudante agregado exitosamente')
    }

    setIsAddingNew(null)
    setNewForm({ ci: '', name: '', phone: '' })
    setSearchCI('')
  }

  const handleCancelNew = () => {
    setIsAddingNew(null)
    setNewForm({ ci: '', name: '', phone: '' })
    setSearchCI('')
  }

  const handleConfirmClose = async () => {
    if (!selectedTravel) return

    const staffData = {
      drivers: drivers.map(d => ({ name: d.name, ci: d.ci, phone: d.phone })),
      assistants: assistants.map(a => ({ name: a.name, ci: a.ci, phone: a.phone }))
    }

    try {
      if (drivers.length > 0 || assistants.length > 0) {
        await assignStaffMutation.mutateAsync({
          travelId: selectedTravel.id,
          data: staffData
        })
      }

      await closeTravelMutation.mutateAsync(selectedTravel.id)
      showSuccess('Viaje cerrado exitosamente')
      resetForm()
      onClose()
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Error al cerrar el viaje')
    }
  }

  const currentList = activeTab === 'driver' ? drivers : assistants
  const currentType = activeTab === 'driver' ? 'conductor' : 'ayudante'

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box display='flex' alignItems='center' gap={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: 'warning.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <i className='tabler-lock' style={{ fontSize: '24px', color: 'var(--mui-palette-warning-main)' }} />
          </Box>
          <Box>
            <Typography variant='h6' fontWeight={600}>
              Cerrar Viaje
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Asigna el personal antes de cerrar
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {selectedTravel && (
          <Card variant='outlined' sx={{ mb: 3, bgcolor: 'action.hover' }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Box display='flex' alignItems='center' gap={1} mb={1}>
                <i className='tabler-route' style={{ fontSize: '18px', color: 'var(--mui-palette-primary-main)' }} />
                <Typography variant='body2' fontWeight={600}>
                  {selectedTravel.route?.officeOrigin?.place?.name || 'N/A'} →{' '}
                  {selectedTravel.route?.officeDestination?.place?.name || 'N/A'}
                </Typography>
              </Box>
              <Box display='flex' gap={3} flexWrap='wrap'>
                <Box display='flex' alignItems='center' gap={0.5}>
                  <i
                    className='tabler-calendar'
                    style={{ fontSize: '14px', color: 'var(--mui-palette-text-secondary)' }}
                  />
                  <Typography variant='caption' color='text.secondary'>
                    {formatDate(selectedTravel.departure_time)} - {formatTime(selectedTravel.departure_time)}
                  </Typography>
                </Box>
                <Box display='flex' alignItems='center' gap={0.5}>
                  <i className='tabler-bus' style={{ fontSize: '14px', color: 'var(--mui-palette-text-secondary)' }} />
                  <Typography variant='caption' color='text.secondary'>
                    {selectedTravel.bus?.name || 'N/A'} ({selectedTravel.bus?.plaque || 'N/A'})
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        <Box display='flex' gap={1} mb={3}>
          <Chip
            label={`Conductores (${drivers.length})`}
            color={activeTab === 'driver' ? 'primary' : 'default'}
            variant={activeTab === 'driver' ? 'filled' : 'outlined'}
            onClick={() => setActiveTab('driver')}
            icon={<i className='tabler-steering-wheel' style={{ fontSize: '16px' }} />}
            sx={{ flex: 1, justifyContent: 'center' }}
          />
          <Chip
            label={`Ayudantes (${assistants.length})`}
            color={activeTab === 'assistant' ? 'info' : 'default'}
            variant={activeTab === 'assistant' ? 'filled' : 'outlined'}
            onClick={() => setActiveTab('assistant')}
            icon={<i className='tabler-user-plus' style={{ fontSize: '16px' }} />}
            sx={{ flex: 1, justifyContent: 'center' }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>
            Buscar {currentType} por CI
          </Typography>
          <Box display='flex' gap={1}>
            <TextField
              fullWidth
              size='small'
              placeholder='Ej: 12345678'
              value={searchCI}
              onChange={e => {
                setSearchCI(e.target.value)
                setSearchError('')
                setSearchResult(null)
              }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              error={!!searchError}
              helperText={searchError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <i className='tabler-id' style={{ fontSize: '18px' }} />
                  </InputAdornment>
                )
              }}
            />
            <Button
              variant='contained'
              onClick={handleSearch}
              disabled={searchStaffMutation.isPending || !searchCI.trim()}
              sx={{ minWidth: 100 }}
            >
              {searchStaffMutation.isPending ? <CircularProgress size={20} color='inherit' /> : 'Buscar'}
            </Button>
          </Box>
        </Box>

        {searchResult && (
          <Alert
            severity='success'
            sx={{ mb: 2 }}
            icon={<i className='tabler-user-check' style={{ fontSize: '20px' }} />}
            action={
              <Button color='inherit' size='small' variant='outlined' onClick={handleAddStaff}>
                Agregar
              </Button>
            }
          >
            <Typography variant='body2' fontWeight={500}>
              {searchResult.name}
            </Typography>
            <Typography variant='caption'>
              CI: {searchResult.ci} | Tel: {searchResult.phone || 'N/A'}
            </Typography>
          </Alert>
        )}

        {searchError && searchCI && !searchStaffMutation.isPending && !isAddingNew && (
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <Button
              variant='outlined'
              color='primary'
              onClick={handleCreateNew}
              startIcon={<i className='tabler-user-plus' />}
            >
              Nuevo {currentType}
            </Button>
          </Box>
        )}

        {isAddingNew === activeTab && (
          <Card
            variant='outlined'
            sx={{
              mb: 3,
              border: '2px solid',
              borderColor: 'primary.main',
              bgcolor: 'primary.lighter'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display='flex' alignItems='center' gap={1} mb={3}>
                <i
                  className='tabler-user-plus'
                  style={{ fontSize: '24px', color: 'var(--mui-palette-primary-main)' }}
                />
                <Typography variant='h6' fontWeight={600} color='primary.main'>
                  Nuevo {currentType}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  size='medium'
                  label='CI'
                  value={newForm.ci}
                  disabled
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='tabler-id' style={{ fontSize: '20px' }} />
                      </InputAdornment>
                    )
                  }}
                />
                <TextField
                  size='medium'
                  label='Nombre completo'
                  placeholder='Ingrese el nombre completo'
                  value={newForm.name}
                  onChange={e => setNewForm({ ...newForm, name: e.target.value })}
                  fullWidth
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='tabler-user' style={{ fontSize: '20px' }} />
                      </InputAdornment>
                    )
                  }}
                />
                <TextField
                  size='medium'
                  label='Teléfono'
                  placeholder='Ingrese el teléfono'
                  value={newForm.phone}
                  onChange={e => setNewForm({ ...newForm, phone: e.target.value })}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='tabler-phone' style={{ fontSize: '20px' }} />
                      </InputAdornment>
                    )
                  }}
                />
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                  <Button size='large' variant='outlined' onClick={handleCancelNew} sx={{ minWidth: 120 }}>
                    Cancelar
                  </Button>
                  <Button
                    size='large'
                    variant='contained'
                    onClick={handleSaveNew}
                    startIcon={<i className='tabler-check' />}
                    sx={{ minWidth: 120 }}
                  >
                    Guardar
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1.5 }}>
          {activeTab === 'driver' ? 'Conductores asignados' : 'Ayudantes asignados'} ({currentList.length})
        </Typography>

        {currentList.length === 0 ? (
          <Box
            sx={{
              py: 4,
              textAlign: 'center',
              bgcolor: 'action.hover',
              borderRadius: 2,
              border: '2px dashed',
              borderColor: 'divider'
            }}
          >
            <i
              className={activeTab === 'driver' ? 'tabler-steering-wheel' : 'tabler-user-plus'}
              style={{ fontSize: '32px', color: 'var(--mui-palette-text-disabled)' }}
            />
            <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
              No hay {activeTab === 'driver' ? 'conductores' : 'ayudantes'} asignados
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {currentList.map((member, idx) => (
              <Card key={idx} variant='outlined' sx={{ bgcolor: 'background.paper' }}>
                <CardContent sx={{ py: 2, px: 2.5, '&:last-child': { pb: 2 } }}>
                  {editingIndex?.type === activeTab && editingIndex?.index === idx ? (
                    <Box>
                      <Box display='flex' alignItems='center' gap={1.5} mb={3}>
                        <i
                          className='tabler-edit'
                          style={{ fontSize: '22px', color: 'var(--mui-palette-primary-main)' }}
                        />
                        <Typography variant='h6' fontWeight={600} color='primary.main'>
                          Editar {currentType}
                        </Typography>
                        <Typography variant='body2' color='text.secondary' sx={{ ml: 'auto' }}>
                          CI: {member.ci}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                          size='medium'
                          label='Nombre completo'
                          placeholder='Ingrese el nombre completo'
                          value={editForm.name}
                          onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                          fullWidth
                          autoFocus
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position='start'>
                                <i className='tabler-user' style={{ fontSize: '20px' }} />
                              </InputAdornment>
                            )
                          }}
                        />
                        <TextField
                          size='medium'
                          label='Teléfono'
                          placeholder='Ingrese el teléfono'
                          value={editForm.phone}
                          onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position='start'>
                                <i className='tabler-phone' style={{ fontSize: '20px' }} />
                              </InputAdornment>
                            )
                          }}
                        />
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                          <Button size='large' variant='outlined' onClick={handleCancelEdit} sx={{ minWidth: 120 }}>
                            Cancelar
                          </Button>
                          <Button
                            size='large'
                            variant='contained'
                            onClick={handleSaveEdit}
                            startIcon={<i className='tabler-check' />}
                            sx={{ minWidth: 120 }}
                          >
                            Guardar
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    <Box display='flex' alignItems='center' justifyContent='space-between'>
                      <Box>
                        <Typography variant='body1' fontWeight={500}>
                          {member.name || (
                            <Typography component='span' color='warning.main' fontStyle='italic'>
                              Sin nombre - Editar
                            </Typography>
                          )}
                        </Typography>
                        <Box display='flex' gap={3} mt={0.5}>
                          <Typography variant='body2' color='text.secondary'>
                            CI: {member.ci}
                          </Typography>
                          {member.phone && (
                            <Typography variant='body2' color='text.secondary'>
                              Tel: {member.phone}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Box>
                        <Tooltip title='Editar'>
                          <IconButton
                            size='medium'
                            onClick={() => handleEditStaff(activeTab, idx, member)}
                            color='primary'
                          >
                            <i className='tabler-edit' style={{ fontSize: '20px' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Eliminar'>
                          <IconButton size='medium' onClick={() => handleRemoveStaff(activeTab, idx)} color='error'>
                            <i className='tabler-trash' style={{ fontSize: '20px' }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {!canClose && (
          <Alert
            severity='warning'
            sx={{ mt: 2 }}
            icon={<i className='tabler-alert-triangle' style={{ fontSize: '20px' }} />}
          >
            Debes agregar al menos un conductor para cerrar el viaje
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
        <Button onClick={handleClose} variant='outlined' color='inherit' disabled={isProcessing} sx={{ flex: 1 }}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirmClose}
          variant='contained'
          color='warning'
          sx={{ flex: 1 }}
          startIcon={isProcessing ? <CircularProgress size={18} color='inherit' /> : <i className='tabler-lock' />}
          disabled={!canClose || isProcessing}
        >
          {isProcessing ? 'Cerrando...' : 'Cerrar Viaje'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CloseTravelDialog
