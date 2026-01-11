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
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import { isAxiosError } from 'axios'

import CustomTextField from '@core/components/mui/TextField'
import type { Ticket, TicketSeat } from '@/types/api/tickets'
import { usePassengersByCustomer, useCreatePassenger, type Passenger } from '@/hooks/usePassengers'

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
}

const AssignPassengersDialog = ({ open, onClose, ticket, onPayCash, onPayQR, isLoading }: AssignPassengersDialogProps) => {
  const [assignments, setAssignments] = useState<Record<string, number | null>>({})
  const [openSelectModal, setOpenSelectModal] = useState(false)
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPassengerName, setNewPassengerName] = useState('')
  const [newPassengerCI, setNewPassengerCI] = useState('')
  const [duplicateCIError, setDuplicateCIError] = useState<string | null>(null)

  const customerId = (ticket as any)?.buyer?.id || null
  const { data: passengers, isLoading: loadingPassengers } = usePassengersByCustomer(customerId)
  const createPassengerMutation = useCreatePassenger()

  useEffect(() => {
    if (open && ticket) {
      const initialAssignments: Record<string, number | null> = {}

      ticket.seats.forEach(seat => {
        initialAssignments[seat.seatNumber] = null
      })
      setAssignments(initialAssignments)
    } else {
      setAssignments({})
      setOpenSelectModal(false)
      setSelectedSeat(null)
      setShowCreateForm(false)
      setNewPassengerName('')
      setNewPassengerCI('')
      setDuplicateCIError(null)
    }
  }, [open, ticket])

  const handleOpenSelectModal = (seatNumber: string) => {
    setSelectedSeat(seatNumber)
    setOpenSelectModal(true)
    setShowCreateForm(false)
    setDuplicateCIError(null)
  }

  const handleSelectPassenger = (passengerId: number) => {
    if (selectedSeat) {
      setAssignments(prev => ({
        ...prev,
        [selectedSeat]: passengerId
      }))
      setOpenSelectModal(false)
      setSelectedSeat(null)
    }
  }

  const handleRemoveAssignment = (seatNumber: string) => {
    setAssignments(prev => ({
      ...prev,
      [seatNumber]: null
    }))
  }

  const handleCreatePassenger = async () => {
    if (!customerId || !newPassengerName.trim() || !newPassengerCI.trim()) return

    setDuplicateCIError(null)

    try {
      const newPassenger = await createPassengerMutation.mutateAsync({
        customerId,
        fullName: newPassengerName,
        ci: newPassengerCI
      })

      if (selectedSeat) {
        setAssignments(prev => ({
          ...prev,
          [selectedSeat]: newPassenger.id
        }))
      }

      setNewPassengerName('')
      setNewPassengerCI('')
      setShowCreateForm(false)
      setOpenSelectModal(false)
      setSelectedSeat(null)
    } catch (error) {
      console.error('Error creating passenger:', error)

      // Manejo de error 409: CI duplicado
      if (isAxiosError(error) && error.response?.status === 409) {
        const errorMessage = error.response?.data?.message || ''

        if (errorMessage.includes('already exists') || errorMessage.includes('ci')) {
          setDuplicateCIError(`El CI ${newPassengerCI} ya está registrado. Por favor, verifica el número de carnet.`)
        } else {
          setDuplicateCIError('Este pasajero ya está registrado en el sistema.')
        }
      }
    }
  }

  const getAvailablePassengers = (): Passenger[] => {
    if (!passengers) return []

    const assignedPassengerIds = Object.values(assignments).filter(id => id !== null)

    return passengers.filter(p => !assignedPassengerIds.includes(p.id))
  }

  const getAssignedPassenger = (seatNumber: string): Passenger | null => {
    const passengerId = assignments[seatNumber]

    if (!passengerId || !passengers) return null

    return passengers.find(p => p.id === passengerId) || null
  }

  const handlePayment = async (paymentMethod: 'cash' | 'qr') => {
    if (!ticket || !customerId) return

    // Solo incluir asientos que tienen pasajero asignado
    const seatAssignments: SeatAssignment[] = ticket.seats
      .filter(seat => assignments[seat.seatNumber] !== null)
      .map(seat => ({
        seatId: seat.id || Number(seat.seatNumber),
        passengerId: Number(assignments[seat.seatNumber]!),
        customerId: Number(customerId)
      }))

    if (paymentMethod === 'cash') {
      await onPayCash(seatAssignments)
    } else {
      await onPayQR(seatAssignments)
    }
  }

  if (!ticket) return null

  const availablePassengers = getAvailablePassengers()

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

            {ticket.seats.map(seat => {
              const assignedPassenger = getAssignedPassenger(seat.seatNumber)

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
                          <Chip
                            label={`Piso ${seat.deck}`}
                            size='small'
                            color='secondary'
                            variant='outlined'
                          />
                        )}
                        <Typography variant='body2' color='text.secondary'>
                          Bs. {seat.price}
                        </Typography>
                      </Box>

                      <Box display='flex' alignItems='center' gap={1}>
                        {assignedPassenger ? (
                          <>
                            <Chip
                              label={`${assignedPassenger.fullName} - CI: ${assignedPassenger.ci}`}
                              color='success'
                              variant='outlined'
                              onDelete={() => handleRemoveAssignment(seat.seatNumber)}
                              deleteIcon={<i className='tabler-x' />}
                            />
                          </>
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

      <Dialog open={openSelectModal} onClose={() => setOpenSelectModal(false)} maxWidth='sm' fullWidth>
        <DialogTitle>
          <Box display='flex' alignItems='center' justifyContent='space-between'>
            <Typography variant='h6' fontWeight={600}>
              Seleccionar Pasajero - Asiento {selectedSeat}
            </Typography>
            <IconButton onClick={() => setOpenSelectModal(false)} size='small'>
              <i className='tabler-x' />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {loadingPassengers ? (
              <Box display='flex' justifyContent='center' py={3}>
                <CircularProgress size={30} />
              </Box>
            ) : showCreateForm ? (
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
                      disabled={!newPassengerName.trim() || !newPassengerCI.trim() || createPassengerMutation.isPending}
                      startIcon={
                        createPassengerMutation.isPending ? <CircularProgress size={16} /> : <i className='tabler-check' />
                      }
                      fullWidth
                    >
                      {createPassengerMutation.isPending ? 'Creando...' : 'Crear Pasajero'}
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
                {availablePassengers.length > 0 && (
                  <>
                    <CustomTextField
                      select
                      label='Seleccionar Pasajero'
                      value=''
                      onChange={e => {
                        const passengerId = Number(e.target.value)

                        if (passengerId) {
                          handleSelectPassenger(passengerId)
                        }
                      }}
                      fullWidth
                      helperText='Selecciona un pasajero de la lista'
                    >
                      <MenuItem value=''>Seleccionar...</MenuItem>
                      {availablePassengers.map(passenger => (
                        <MenuItem key={passenger.id} value={passenger.id}>
                          {passenger.fullName} - CI: {passenger.ci}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                    <Divider>
                      <Chip label='O' size='small' />
                    </Divider>
                  </>
                )}
                {availablePassengers.length === 0 && (
                  <Alert severity='info' icon={<i className='tabler-info-circle' />}>
                    No hay pasajeros disponibles. Crea uno nuevo.
                  </Alert>
                )}
                <Button
                  variant='contained'
                  color='primary'
                  startIcon={<i className='tabler-user-plus' />}
                  onClick={() => setShowCreateForm(true)}
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
