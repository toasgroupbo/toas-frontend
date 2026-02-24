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
  passengerId: number
  customerId: number
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
      // Verificar si el pasajero ya está asignado a otro asiento
      const alreadyAssigned = Object.entries(assignments).find(
        ([seatNum, p]) => p?.id === passenger.id && seatNum !== selectedSeat
      )

      if (alreadyAssigned) {
        setSearchError(`Este pasajero ya está asignado al asiento ${alreadyAssigned[0]}`)

        return
      }

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

  const handleCreatePassenger = () => {
    if (!newPassengerName.trim() || !newPassengerCI.trim()) return

    // Crear un pasajero local (sin llamar al API)
    // El backend lo creará cuando se asigne al ticket
    const newPassenger: Passenger = {
      id: -1, // ID temporal para indicar que es nuevo
      fullName: newPassengerName.trim(),
      ci: newPassengerCI.trim(),
      customerId: customerId || 0
    }

    if (selectedSeat) {
      // Verificar si el CI ya está asignado a otro asiento
      const alreadyAssigned = Object.entries(assignments).find(
        ([seatNum, p]) => p?.ci === newPassenger.ci && seatNum !== selectedSeat
      )

      if (alreadyAssigned) {
        setDuplicateCIError(`Este CI ya está asignado al asiento ${alreadyAssigned[0]}`)

        return
      }

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
    if (!ticket || !customerId) return

    const seatAssignments: SeatAssignment[] = ticket.seats
      .filter(seat => assignments[seat.seatNumber] !== null)
      .map(seat => ({
        seatId: seat.id || Number(seat.seatNumber),
        passengerId: assignments[seat.seatNumber]!.id,
        customerId: Number(customerId),
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
      <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
        <DialogTitle>
          <Box display='flex' alignItems='center' justifyContent='space-between'>
            <Box display='flex' alignItems='center' gap={2}>
              <i className='tabler-users' style={{ fontSize: '24px' }} />
              <Typography variant='h5' fontWeight={600}>
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
              Asigna un pasajero a cada asiento seleccionado. Cliente: <strong>{(ticket as any)?.buyer?.name}</strong>
            </Alert>

            {ticket.travelSeats.map(seat => {
              const assignedPassenger = assignments[seat.seatNumber]

              return (
                <Card key={seat.seatNumber} variant='outlined'>
                  <CardContent>
                    <Box display='flex' alignItems='center' justifyContent='space-between' gap={2}>
                      <Box display='flex' alignItems='center' gap={2} flex={1}>
                        <Chip
                          label={`Asiento ${seat.seatNumber}`}
                          color='primary'
                          variant='tonal'
                          icon={<i className='tabler-armchair' />}
                        />
                        {seat.deck && (
                          <Chip label={`Piso ${seat.deck}`} size='small' color='secondary' variant='outlined' />
                        )}
                        <Typography variant='body2' color='text.secondary' sx={{ minWidth: 80 }}>
                          Bs. {seat.price}
                        </Typography>
                      </Box>

                      <Box display='flex' alignItems='center' gap={1}>
                        {assignedPassenger ? (
                          <Chip
                            label={`${assignedPassenger.fullName} - CI: ${assignedPassenger.ci}`}
                            color='success'
                            variant='outlined'
                            onDelete={() => handleRemoveAssignment(seat.seatNumber)}
                            deleteIcon={<i className='tabler-x' />}
                          />
                        ) : (
                          <Button
                            variant='outlined'
                            size='small'
                            startIcon={<i className='tabler-user-plus' />}
                            onClick={() => handleOpenSelectModal(seat.seatNumber)}
                            disabled={isLoading}
                          >
                            Asignar Pasajero
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
                p: 2,
                bgcolor: 'success.lighter',
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography variant='h6' fontWeight='bold'>
                Total a pagar:
              </Typography>
              <Typography variant='h5' color='success.main' fontWeight='bold'>
                Bs. {ticket.total_price}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button onClick={onClose} variant='outlined' color='secondary' disabled={isLoading} sx={{ flex: 1 }}>
            Cancelar
          </Button>
          <Button
            onClick={() => handlePayment('cash')}
            variant='contained'
            color='success'
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <i className='tabler-cash' />}
            sx={{ flex: 1 }}
          >
            Pagar en Efectivo
          </Button>
          <Button
            onClick={() => handlePayment('qr')}
            variant='contained'
            color='info'
            disabled={isLoading}
            startIcon={<i className='tabler-qrcode' />}
            sx={{ flex: 1 }}
          >
            Pagar por QR
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para buscar/crear pasajero */}
      <Dialog open={openSelectModal} onClose={() => setOpenSelectModal(false)} maxWidth='sm' fullWidth>
        <DialogTitle>
          <Box display='flex' alignItems='center' justifyContent='space-between'>
            <Typography variant='h6' fontWeight={600}>
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
                  <Box display='flex' gap={2}>
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
                <CustomTextField
                  label='Buscar por CI'
                  placeholder='Ingrese el CI del pasajero'
                  value={searchCI}
                  onChange={e => {
                    setSearchCI(e.target.value)
                    setSearchError(null)
                    setFoundPassenger(null)
                  }}
                  onKeyDown={handleSearchKeyDown}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='tabler-search' />
                      </InputAdornment>
                    ),
                    endAdornment: searchPassengerMutation.isPending && (
                      <InputAdornment position='end'>
                        <CircularProgress size={20} />
                      </InputAdornment>
                    )
                  }}
                  helperText='Presiona Enter para buscar'
                />

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
                    <CardContent>
                      <Box display='flex' alignItems='center' justifyContent='space-between'>
                        <Box display='flex' alignItems='center' gap={2}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              bgcolor: 'primary.lighter',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <i
                              className='tabler-user'
                              style={{ fontSize: '20px', color: 'var(--mui-palette-primary-main)' }}
                            />
                          </Box>
                          <Box>
                            <Typography variant='body1' fontWeight={600}>
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
                  variant='contained'
                  color='primary'
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
