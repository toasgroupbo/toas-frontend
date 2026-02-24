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
  IconButton
} from '@mui/material'

import { useSearchCustomerByCi, useCreateCustomerForCashier } from '@/hooks/useCustomersByCi'
import type { Customer } from '@/types/api/customers'

interface CustomerSearchFieldProps {
  onCustomerSelect: (customer: Customer) => void
  disabled?: boolean
  hasError?: boolean
  helperText?: string
}

const CustomerSearchField = ({
  onCustomerSelect,
  disabled = false,
  hasError = false,
  helperText
}: CustomerSearchFieldProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [shouldSearch, setShouldSearch] = useState(false)

  const {
    data: customer,
    isLoading,
    error
  } = useSearchCustomerByCi(searchQuery, shouldSearch && searchQuery.length > 0)

  const createCustomerMutation = useCreateCustomerForCashier()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setSearchTerm(value)
    setSelectedCustomer(null)
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

  // Resetear shouldSearch cuando se obtienen resultados
  useEffect(() => {
    if (customer || error) {
      setShouldSearch(false)
    }
  }, [customer, error])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  const handleSelectCustomer = (selectedCustomer: Customer) => {
    setSelectedCustomer(selectedCustomer)
    setSearchTerm(selectedCustomer.ci || '')
    setShowResults(false)
    onCustomerSelect(selectedCustomer)
  }

  const handleCreateCustomer = async () => {
    if (!newCustomerName.trim() || !searchTerm.trim()) return

    try {
      const newCustomer = await createCustomerMutation.mutateAsync({
        name: newCustomerName.trim(),
        ci: searchTerm.trim()
      })

      handleSelectCustomer(newCustomer)
      setOpenCreateDialog(false)
      setNewCustomerName('')
    } catch (error) {
      console.error('Error creating customer:', error)
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

    if (error || !customer) {
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
            onClick={() => handleSelectCustomer(customer)}
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
                  <Typography fontWeight={600}>{customer.name}</Typography>
                </Box>
              }
              secondary={`CI: ${customer.ci}`}
            />
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
              label='Buscar Cliente por CI'
              placeholder='Ingrese el CI del cliente y presione Enter o buscar'
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              error={hasError}
              helperText={hasError && !selectedCustomer ? helperText : ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <i className='tabler-id' />
                  </InputAdornment>
                ),
                endAdornment: selectedCustomer ? (
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
              sx={{ minWidth: 120, height: 56 }}
            >
              {isLoading ? <CircularProgress size={24} color='inherit' /> : <i className='tabler-search' />}
            </Button>
          </Box>
          {renderSearchResults()}
        </Box>

        {selectedCustomer && (
          <Alert severity='success' icon={<i className='tabler-user-check' />} sx={{ mt: 1 }}>
            Cliente seleccionado: <strong>{selectedCustomer.name}</strong>
          </Alert>
        )}
      </Box>

      {/* Create Customer Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>
          <Box display='flex' alignItems='center' gap={1}>
            <i className='tabler-user-plus' />
            Crear Nuevo Cliente
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display='flex' flexDirection='column' gap={3} mt={2}>
            <TextField label='CI' value={searchTerm} disabled fullWidth />
            <TextField
              label='Nombre Completo'
              value={newCustomerName}
              onChange={e => setNewCustomerName(e.target.value)}
              placeholder='Ej: Juan Pérez'
              autoFocus
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenCreateDialog(false)} variant='outlined' color='secondary'>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateCustomer}
            variant='contained'
            color='primary'
            disabled={!newCustomerName.trim() || createCustomerMutation.isPending}
            startIcon={
              createCustomerMutation.isPending ? <CircularProgress size={20} /> : <i className='tabler-check' />
            }
          >
            {createCustomerMutation.isPending ? 'Creando...' : 'Crear Cliente'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default CustomerSearchField
