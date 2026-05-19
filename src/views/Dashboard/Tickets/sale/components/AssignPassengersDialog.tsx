'use client'

import { useState, useEffect } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import CustomTextField from '@core/components/mui/TextField'
import type { Ticket } from '@/types/api/tickets'
import { useSearchPassengerByCI, type Passenger } from '@/hooks/usePassengers'

interface AssignPassengersDialogProps {
  open: boolean
  onClose: () => void
  ticket: Ticket | null
  onPayCash: (assignments: SeatAssignment[]) => Promise<void>
  onPayQR: (assignments: SeatAssignment[]) => Promise<void>
  isLoading?: boolean
}

export interface SeatAssignment {
  seatId: number
  passengerName: string
  passengerCI: string
}

const AssignPassengersDialog = ({
  open,
  onClose,
  ticket,
  onPayCash,
  onPayQR,
  isLoading
}: AssignPassengersDialogProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [assignments, setAssignments] = useState<Record<string, Passenger | null>>({})
  const [openSelectModal, setOpenSelectModal] = useState(false)
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null)
  const [searchCI, setSearchCI] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPassengerName, setNewPassengerName] = useState('')
  const [newPassengerCI, setNewPassengerCI] = useState('')
  const [duplicateCIError, setDuplicateCIError] = useState<string | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [foundPassenger, setFoundPassenger] = useState<Passenger | null>(null)
  const [editingSeat, setEditingSeat] = useState<string | null>(null)
  const [editedName, setEditedName] = useState('')

  const customerId = (ticket as any)?.buyer?.id || null
  const searchPassengerMutation = useSearchPassengerByCI()

  const handleSearchPassenger = async () => {
    if (searchCI.length < 3) {
      setSearchError('Ingresa al menos 3 caracteres para buscar')

      return
    }

    setSearchError(null)
    setFoundPassenger(null)

    try {
      const result = await searchPassengerMutation.mutateAsync(searchCI)

      if (result) {
        setFoundPassenger(result)
      } else {
        setSearchError('No se encontró ningún pasajero con ese CI')
      }
    } catch {
      setSearchError('Error al buscar pasajero')
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearchPassenger()
    }
  }

  useEffect(() => {
    if (open && ticket) {
      const initialAssignments: Record<string, Passenger | null> = {}

      ticket.seats.forEach(seat => {
        initialAssignments[seat.seatNumber] = null
      })
      setAssignments(initialAssignments)
    } else {
      setAssignments({})
      setOpenSelectModal(false)
      setSelectedSeat(null)
      setSearchCI('')
      setShowCreateForm(false)
      setNewPassengerName('')
      setNewPassengerCI('')
      setDuplicateCIError(null)
      setSearchError(null)
      setEditingSeat(null)
      setEditedName('')
    }
  }, [open, ticket])

  const handleOpenSelectModal = (seatNumber: string) => {
    setSelectedSeat(seatNumber)
    setOpenSelectModal(true)
    setShowCreateForm(false)
    setSearchCI('')
    setDuplicateCIError(null)
    setSearchError(null)
  }

  const handleSelectPassenger = (passenger: Passenger) => {
    if (selectedSeat) {
      setAssignments(prev => ({
        ...prev,
        [selectedSeat]: passenger
      }))
      setOpenSelectModal(false)
      setSelectedSeat(null)
      setSearchCI('')
    }
  }

  const handleRemoveAssignment = (seatNumber: string) => {
    setAssignments(prev => ({
      ...prev,
      [seatNumber]: null
    }))
  }

  const handleStartEdit = (seatNumber: string) => {
    const passenger = assignments[seatNumber]

    if (passenger) {
      setEditingSeat(seatNumber)
      setEditedName(passenger.fullName)
    }
  }

  const handleSaveEdit = () => {
    if (editingSeat && editedName.trim()) {
      setAssignments(prev => {
        const currentPassenger = prev[editingSeat]

        if (currentPassenger) {
          return {
            ...prev,
            [editingSeat]: {
              ...currentPassenger,
              fullName: editedName.trim()
            }
          }
        }

        return prev
      })
      setEditingSeat(null)
      setEditedName('')
    }
  }

  const handleCancelEdit = () => {
    setEditingSeat(null)
    setEditedName('')
  }

  const handleCreatePassenger = () => {
    if (!newPassengerName.trim() || !newPassengerCI.trim()) return

    const newPassenger: Passenger = {
      id: -1,
      fullName: newPassengerName.trim(),
      ci: newPassengerCI.trim(),
      customerId: customerId || 0
    }

    if (selectedSeat) {
      setAssignments(prev => ({
        ...prev,
        [selectedSeat]: newPassenger
      }))
    }

    setNewPassengerName('')
    setNewPassengerCI('')
    setShowCreateForm(false)
    setOpenSelectModal(false)
    setSelectedSeat(null)
    setDuplicateCIError(null)
  }

  const handlePayment = async (paymentMethod: 'cash' | 'qr') => {
    if (!ticket) return

    const seatAssignments: SeatAssignment[] = ticket.seats
      .filter(seat => assignments[seat.seatNumber] !== null)
      .map(seat => ({
        seatId: seat.id || Number(seat.seatNumber),
        passengerName: assignments[seat.seatNumber]!.fullName,
        passengerCI: assignments[seat.seatNumber]!.ci
      }))

    if (paymentMethod === 'cash') {
      await onPayCash(seatAssignments)
    } else {
      await onPayQR(seatAssignments)
    }
  }

  if (!ticket) return null

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth fullScreen={isMobile}>
        <DialogTitle>
          <Box display='flex' alignItems='center' justifyContent='space-between'>
            <Box display='flex' alignItems='center' gap={{ xs: 1, sm: 2 }}>
              <i className='tabler-users' style={{ fontSize: isMobile ? '20px' : '24px' }} />
              <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={600}>
                Asignar Pasajeros
              </Typography>
            </Box>
            <IconButton onClick={onClose} disabled={isLoading}>
              <i className='tabler-x' />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            <Alert severity='info' icon={<i className='tabler-info-circle' />}>
              <Typography variant={isMobile ? 'caption' : 'body2'}>
                Asigna un pasajero a cada asiento. Cliente: <strong>{(ticket as any)?.buyer?.name}</strong>
              </Typography>
            </Alert>

            {ticket.travelSeats.map(seat => {
              const assignedPassenger = assignments[seat.seatNumber]

              return (
                <Card key={seat.seatNumber} variant='outlined'>
                  <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
                    <Box
                      display='flex'
                      flexDirection={{ xs: 'column', sm: 'row' }}
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      justifyContent='space-between'
                      gap={2}
                    >
                      <Box display='flex' alignItems='center' gap={1} flexWrap='wrap'>
                        <Chip
                          label={`Asiento ${seat.seatNumber}`}
                          color='primary'
                          variant='tonal'
                          size={isMobile ? 'small' : 'medium'}
                          icon={<i className='tabler-armchair' />}
                        />
                        {seat.deck && (
                          <Chip label={`Piso ${seat.deck}`} size='small' color='secondary' variant='outlined' />
                        )}
                        <Typography variant='body2' color='text.secondary'>
                          Bs. {seat.price}
                        </Typography>
                      </Box>

                      <Box display='flex' alignItems='center' gap={1} width={{ xs: '100%', sm: 'auto' }}>
                        {assignedPassenger ? (
                          editingSeat === seat.seatNumber ? (
                            <Box display='flex' alignItems='center' gap={0.5} width='100%'>
                              <CustomTextField
                                size='small'
                                value={editedName}
                                onChange={e => setEditedName(e.target.value)}
                                placeholder='Nombre del pasajero'
                                autoFocus
                                sx={{ minWidth: { xs: 120, sm: 180 } }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleSaveEdit()
                                  }

                                  if (e.key === 'Escape') {
                                    handleCancelEdit()
                                  }
                                }}
                              />
                              <IconButton size='small' color='success' onClick={handleSaveEdit}>
                                <i className='tabler-check' style={{ fontSize: '16px' }} />
                              </IconButton>
                              <IconButton size='small' color='error' onClick={handleCancelEdit}>
                                <i className='tabler-x' style={{ fontSize: '16px' }} />
                              </IconButton>
                            </Box>
                          ) : (
                            <Box display='flex' alignItems='center' gap={0.5}>
                              <Chip
                                label={`${assignedPassenger.fullName} - CI: ${assignedPassenger.ci}`}
                                color='success'
                                variant='outlined'
                                size={isMobile ? 'small' : 'medium'}
                                sx={{
                                  maxWidth: { xs: '100%', sm: 'none' },
                                  '& .MuiChip-label': {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }
                                }}
                              />
                              <IconButton
                                size='small'
                                color='primary'
                                onClick={() => handleStartEdit(seat.seatNumber)}
                                disabled={isLoading}
                              >
                                <i className='tabler-pencil' style={{ fontSize: '16px' }} />
                              </IconButton>
                              <IconButton
                                size='small'
                                color='error'
                                onClick={() => handleRemoveAssignment(seat.seatNumber)}
                                disabled={isLoading}
                              >
                                <i className='tabler-trash' style={{ fontSize: '16px' }} />
                              </IconButton>
                            </Box>
                          )
                        ) : (
                          <Button
                            variant='outlined'
                            size='small'
                            startIcon={<i className='tabler-user-plus' />}
                            onClick={() => handleOpenSelectModal(seat.seatNumber)}
                            disabled={isLoading}
                            fullWidth={isMobile}
                          >
                            {isMobile ? 'Asignar' : 'Asignar Pasajero'}
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )
            })}

            <Box
              sx={{
                p: { xs: 1.5, sm: 2 },
                bgcolor: 'success.lighter',
                borderRadius: 1,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'center', sm: 'center' },
                gap: { xs: 0.5, sm: 0 }
              }}
            >
              <Typography variant={isMobile ? 'body1' : 'h6'} fontWeight='bold'>
                Total a pagar:
              </Typography>
              <Typography variant={isMobile ? 'h6' : 'h5'} color='success.main' fontWeight='bold'>
                Bs. {ticket.total_price}
              </Typography>
            </Box>
          </Stack>
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
            onClick={() => handlePayment('cash')}
            variant='contained'
            color='success'
            disabled={isLoading}
            fullWidth={isMobile}
            startIcon={isLoading ? <CircularProgress size={20} /> : <i className='tabler-cash' />}
            sx={{ flex: { sm: 1 }, order: { xs: 1, sm: 2 } }}
          >
            {isMobile ? 'Efectivo' : 'Pagar en Efectivo'}
          </Button>
          <Button
            onClick={() => handlePayment('qr')}
            variant='contained'
            color='info'
            disabled={isLoading}
            fullWidth={isMobile}
            startIcon={<i className='tabler-qrcode' />}
            sx={{ flex: { sm: 1 }, order: { xs: 2, sm: 3 } }}
          >
            {isMobile ? 'Pagar QR' : 'Pagar por QR'}
          </Button>
          <Button
            onClick={onClose}
            variant='outlined'
            color='secondary'
            disabled={isLoading}
            fullWidth={isMobile}
            sx={{ flex: { sm: 1 }, order: { xs: 3, sm: 1 } }}
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openSelectModal}
        onClose={() => setOpenSelectModal(false)}
        maxWidth='sm'
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box display='flex' alignItems='center' justifyContent='space-between'>
            <Typography variant={isMobile ? 'body1' : 'h6'} fontWeight={600}>
              Buscar Pasajero - Asiento {selectedSeat}
            </Typography>
            <IconButton onClick={() => setOpenSelectModal(false)} size='small'>
              <i className='tabler-x' />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {showCreateForm ? (
              <Box>
                <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 2 }}>
                  Crear Nuevo Pasajero
                </Typography>
                <Stack spacing={2}>
                  {duplicateCIError && (
                    <Alert severity='error' icon={<i className='tabler-alert-circle' />}>
                      {duplicateCIError}
                    </Alert>
                  )}
                  <CustomTextField
                    label='Nombre Completo'
                    value={newPassengerName}
                    onChange={e => setNewPassengerName(e.target.value)}
                    fullWidth
                    size='small'
                  />
                  <CustomTextField
                    label='CI'
                    value={newPassengerCI}
                    onChange={e => {
                      setNewPassengerCI(e.target.value)
                      setDuplicateCIError(null)
                    }}
                    fullWidth
                    size='small'
                    error={!!duplicateCIError}
                  />
                  <Box display='flex' flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                    <Button
                      variant='contained'
                      color='primary'
                      onClick={handleCreatePassenger}
                      disabled={!newPassengerName.trim() || !newPassengerCI.trim()}
                      startIcon={<i className='tabler-check' />}
                      fullWidth
                    >
                      Agregar Pasajero
                    </Button>
                    <Button
                      variant='outlined'
                      onClick={() => {
                        setShowCreateForm(false)
                        setDuplicateCIError(null)
                      }}
                      fullWidth
                    >
                      Cancelar
                    </Button>
                  </Box>
                </Stack>
              </Box>
            ) : (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1,
                    alignItems: 'flex-end'
                  }}
                >
                  <CustomTextField
                    label='Buscar por CI'
                    placeholder={isMobile ? 'Ingrese CI' : 'Ingrese el CI del pasajero'}
                    value={searchCI}
                    onChange={e => {
                      setSearchCI(e.target.value)
                      setSearchError(null)
                      setFoundPassenger(null)
                    }}
                    onKeyDown={handleSearchKeyDown}
                    fullWidth
                    size='small'
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-id' />
                        </InputAdornment>
                      ),
                      endAdornment: searchPassengerMutation.isPending && (
                        <InputAdornment position='end'>
                          <CircularProgress size={20} />
                        </InputAdornment>
                      )
                    }}
                  />

                  <Button
                    variant='contained'
                    color='primary'
                    onClick={handleSearchPassenger}
                    disabled={searchCI.length < 3 || searchPassengerMutation.isPending}
                    sx={{
                      minWidth: { xs: '100%', sm: 120 },
                      height: 40,
                      flexShrink: 0
                    }}
                  >
                    {searchPassengerMutation.isPending ? (
                      <CircularProgress size={20} color='inherit' />
                    ) : (
                      <>
                        <i className='tabler-search' style={{ marginRight: 6 }} />
                        {!isMobile && 'Buscar'}
                      </>
                    )}
                  </Button>
                </Box>

                {searchError && (
                  <Alert severity='error' icon={<i className='tabler-alert-circle' />}>
                    {searchError}
                  </Alert>
                )}

                {foundPassenger && !searchPassengerMutation.isPending && (
                  <Card
                    variant='outlined'
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                    onClick={() => handleSelectPassenger(foundPassenger)}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
                      <Box
                        display='flex'
                        flexDirection={{ xs: 'column', sm: 'row' }}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        justifyContent='space-between'
                        gap={2}
                      >
                        <Box display='flex' alignItems='center' gap={2}>
                          <Box
                            sx={{
                              width: { xs: 36, sm: 40 },
                              height: { xs: 36, sm: 40 },
                              borderRadius: '50%',
                              bgcolor: 'primary.lighter',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <i
                              className='tabler-user'
                              style={{ fontSize: '20px', color: 'var(--mui-palette-primary-main)' }}
                            />
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant='body1' fontWeight={600} noWrap>
                              {foundPassenger.fullName}
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                              CI: {foundPassenger.ci}
                            </Typography>
                          </Box>
                        </Box>
                        <Button
                          variant='contained'
                          size='small'
                          fullWidth={isMobile}
                          startIcon={<i className='tabler-check' />}
                          onClick={() => handleSelectPassenger(foundPassenger)}
                        >
                          Seleccionar
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                )}

                <Button
                  variant='outlined'
                  startIcon={<i className='tabler-user-plus' />}
                  onClick={() => {
                    setShowCreateForm(true)
                    setNewPassengerCI(searchCI)
                  }}
                  fullWidth
                >
                  Crear Nuevo Pasajero
                </Button>
              </>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AssignPassengersDialog
