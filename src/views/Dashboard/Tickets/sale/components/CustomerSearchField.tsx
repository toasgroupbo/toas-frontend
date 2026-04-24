'use client'

import { useState, useEffect } from 'react'

import {
  Box,
  TextField,
  CircularProgress,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material'

import { useSearchBillingByCi } from '@/hooks/useCustomersByCi'
import type { BillingInfo } from '@/types/api/tickets'

interface CustomerSearchFieldProps {
  onBillingSelect: (billing: BillingInfo) => void
  disabled?: boolean
  hasError?: boolean
  helperText?: string
}

const CustomerSearchField = ({
  onBillingSelect,
  disabled = false,
  hasError = false,
  helperText
}: CustomerSearchFieldProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [searchTerm, setSearchTerm] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState('')
  const [selectedBilling, setSelectedBilling] = useState<BillingInfo | null>(null)
  const [shouldSearch, setShouldSearch] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')

  const {
    data: billingData,
    isLoading,
    error
  } = useSearchBillingByCi(searchQuery, shouldSearch && searchQuery.length > 0)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setSearchTerm(value)
    setSelectedBilling(null)
    setShowResults(false)
    setShouldSearch(false)
  }

  const handleSearch = () => {
    if (searchTerm.trim().length === 0) return

    const trimmedSearch = searchTerm.trim()

    setSearchQuery(trimmedSearch)
    setShowResults(true)
    setShouldSearch(true)
  }

  useEffect(() => {
    if (billingData || error) {
      setShouldSearch(false)
    }
  }, [billingData, error])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  const handleSelectBilling = (billing: BillingInfo) => {
    setSelectedBilling(billing)
    setEditedName(billing.nombre || '')
    setSearchTerm(billing.ci || '')
    setShowResults(false)
    setIsEditingName(false)
    onBillingSelect(billing)
  }

  const handleStartEditName = () => {
    setIsEditingName(true)
  }

  const handleSaveEditedName = () => {
    if (selectedBilling && editedName.trim()) {
      const updatedBilling: BillingInfo = {
        ...selectedBilling,
        nombre: editedName.trim()
      }

      setSelectedBilling(updatedBilling)
      setIsEditingName(false)
      onBillingSelect(updatedBilling)
    }
  }

  const handleCancelEdit = () => {
    if (selectedBilling) {
      setEditedName(selectedBilling.nombre || '')
    }

    setIsEditingName(false)
  }

  const handleCreateBilling = async () => {
    if (!newCustomerName.trim() || !searchTerm.trim()) return

    try {
      const newBilling: BillingInfo = {
        ci: searchTerm.trim(),
        nombre: newCustomerName.trim()
      }

      handleSelectBilling(newBilling)
      setOpenCreateDialog(false)
      setNewCustomerName('')
    } catch (error) {
      console.error('Error creating billing:', error)
    }
  }

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true)
    setShowResults(false)
  }

  const renderSearchResults = () => {
    if (!showResults || searchQuery.length === 0) return null

    if (isLoading) {
      return (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 0.5,
            zIndex: 1000,
            maxHeight: 300,
            overflow: 'auto'
          }}
        >
          <Box display='flex' justifyContent='center' alignItems='center' p={3}>
            <CircularProgress size={24} />
            <Typography ml={2} variant='body2'>
              Buscando cliente...
            </Typography>
          </Box>
        </Paper>
      )
    }

    if (error || !billingData) {
      return (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 0.5,
            zIndex: 1000,
            p: 2
          }}
        >
          <Alert severity='info' icon={<i className='tabler-user-question' />}>
            No se encontró un cliente con CI: {searchQuery}
          </Alert>
          <Button
            fullWidth
            variant='contained'
            color='primary'
            startIcon={<i className='tabler-user-plus' />}
            onClick={handleOpenCreateDialog}
            sx={{ mt: 2 }}
          >
            Crear Nuevo Cliente
          </Button>
        </Paper>
      )
    }

    return (
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          mt: 0.5,
          zIndex: 1000
        }}
      >
        <List disablePadding>
          <ListItem
            onClick={() => handleSelectBilling(billingData)}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            <ListItemText
              primary={
                <Box display='flex' alignItems='center' gap={1}>
                  <i className='tabler-user' />
                  <Typography fontWeight={600}>{billingData.nombre}</Typography>
                </Box>
              }
              secondary={`CI: ${billingData.ci}`}
            />
            <Typography variant='caption' color='primary.main' sx={{ ml: 1 }}>
              Seleccionar
            </Typography>
          </ListItem>
        </List>
      </Paper>
    )
  }

  return (
    <>
      <Box position='relative'>
        <Box display='flex' gap={1} flexDirection='column' flex={1}>
          <Box display='flex' gap={1}>
            <TextField
              fullWidth
              label={isMobile ? 'CI del Cliente' : 'Buscar Cliente por CI'}
              placeholder={isMobile ? 'Ingrese CI y presione Enter' : 'Ingrese el CI del cliente y presione Enter o buscar'}
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              error={hasError}
              helperText={hasError && !selectedBilling ? helperText : ''}
              size={isMobile ? 'small' : 'medium'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <i className='tabler-id' />
                  </InputAdornment>
                ),
                endAdornment: selectedBilling ? (
                  <InputAdornment position='end'>
                    <i className='tabler-check' style={{ color: 'green' }} />
                  </InputAdornment>
                ) : null
              }}
            />
            <Button
              variant='contained'
              color='primary'
              onClick={handleSearch}
              disabled={disabled || searchTerm.trim().length === 0 || isLoading}
              sx={{ minWidth: { xs: 50, sm: 120 }, height: { xs: 40, sm: 56 } }}
            >
              {isLoading ? <CircularProgress size={isMobile ? 20 : 24} color='inherit' /> : <i className='tabler-search' />}
            </Button>
          </Box>
          {renderSearchResults()}
        </Box>

        {selectedBilling && (
          <Alert
            severity='success'
            icon={<i className='tabler-user-check' />}
            sx={{ mt: 1 }}
            action={
              !isEditingName && (
                <IconButton size='small' color='inherit' onClick={handleStartEditName}>
                  <i className='tabler-pencil' style={{ fontSize: '16px' }} />
                </IconButton>
              )
            }
          >
            {isEditingName ? (
              <Box display='flex' alignItems='center' gap={1} flexWrap='wrap'>
                <Typography variant='body2'>Cliente:</Typography>
                <TextField
                  size='small'
                  value={editedName}
                  onChange={e => setEditedName(e.target.value)}
                  placeholder='Nombre del cliente'
                  autoFocus
                  sx={{ minWidth: 150, bgcolor: 'white', borderRadius: 1 }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSaveEditedName()
                    }

                    if (e.key === 'Escape') {
                      handleCancelEdit()
                    }
                  }}
                />
                <IconButton size='small' color='inherit' onClick={handleSaveEditedName}>
                  <i className='tabler-check' style={{ fontSize: '16px' }} />
                </IconButton>
                <IconButton size='small' color='inherit' onClick={handleCancelEdit}>
                  <i className='tabler-x' style={{ fontSize: '16px' }} />
                </IconButton>
              </Box>
            ) : (
              <>
                Cliente seleccionado: <strong>{selectedBilling.nombre}</strong>
              </>
            )}
          </Alert>
        )}
      </Box>

      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth='sm' fullWidth fullScreen={isMobile}>
        <DialogTitle>
          <Box display='flex' alignItems='center' gap={1}>
            <i className='tabler-user-plus' style={{ fontSize: isMobile ? '18px' : '24px' }} />
            <Typography variant={isMobile ? 'body1' : 'h6'} fontWeight={600}>
              Crear Nuevo Cliente
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display='flex' flexDirection='column' gap={{ xs: 2, sm: 3 }} mt={2}>
            <TextField label='CI' value={searchTerm} disabled fullWidth size={isMobile ? 'small' : 'medium'} />
            <TextField
              label='Nombre Completo'
              value={newCustomerName}
              onChange={e => setNewCustomerName(e.target.value)}
              placeholder='Ej: Juan Pérez'
              autoFocus
              fullWidth
              size={isMobile ? 'small' : 'medium'}
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            pb: { xs: 2, sm: 3 },
            gap: { xs: 1, sm: 2 },
            flexDirection: { xs: 'column', sm: 'row' }
          }}
        >
          <Button
            onClick={handleCreateBilling}
            variant='contained'
            color='primary'
            fullWidth={isMobile}
            disabled={!newCustomerName.trim()}
            startIcon={<i className='tabler-check' />}
            sx={{ order: { xs: 1, sm: 2 } }}
          >
            Usar Datos
          </Button>
          <Button
            onClick={() => setOpenCreateDialog(false)}
            variant='outlined'
            color='secondary'
            fullWidth={isMobile}
            sx={{ order: { xs: 2, sm: 1 } }}
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default CustomerSearchField
