'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'

import type { Ticket } from '@/types/api/tickets'
import { getStatusColor, getStatusLabel } from '../utils/ticketStatus'
import { formatDate, formatTime } from '../../sale/utils/dateFormatters'

interface TicketDetailDialogProps {
  open: boolean
  onClose: () => void
  ticket: Ticket | null
}

const TicketDetailDialog = ({ open, onClose, ticket }: TicketDetailDialogProps) => {
  if (!ticket) return null

  // Determinar si el ticket está cancelado
  const isCancelled = ticket.status === 'cancelled'

  const hasBillingInfo = ticket.billing && (ticket.billing.nombre || ticket.billing.ci)
  const hasBuyerInfo = ticket.buyer && (ticket.buyer.name || ticket.buyer.ci)

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Box display='flex' alignItems='center' gap={2}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className='tabler-ticket' style={{ fontSize: '28px', color: 'white' }} />
            </Box>
            <Box>
              <Typography variant='h5' fontWeight={600}>
                Detalle del Ticket #{ticket.id}
              </Typography>
              <Chip
                label={getStatusLabel(ticket.status)}
                size='small'
                color={getStatusColor(ticket.status) as any}
                variant='tonal'
              />
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <i className='tabler-x' />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Información del Comprador (Billing) */}
          <Grid item xs={12} md={6}>
            <Typography
              variant='subtitle2'
              color='primary'
              fontWeight={700}
              sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <i className='tabler-user' />
              Información del Comprador
            </Typography>
            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              {hasBillingInfo ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i
                      className='tabler-user-circle'
                      style={{ fontSize: '18px', color: 'var(--mui-palette-primary-main)' }}
                    />
                    <Typography variant='body2' color='text.secondary'>
                      Nombre:
                    </Typography>
                    <Typography variant='body2' fontWeight={600}>
                      {ticket.billing!.nombre || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className='tabler-id' style={{ fontSize: '18px', color: 'var(--mui-palette-primary-main)' }} />
                    <Typography variant='body2' color='text.secondary'>
                      CI / NIT:
                    </Typography>
                    <Typography variant='body2' fontWeight={600}>
                      {ticket.billing!.ci || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              ) : hasBuyerInfo ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i
                      className='tabler-user-circle'
                      style={{ fontSize: '18px', color: 'var(--mui-palette-primary-main)' }}
                    />
                    <Typography variant='body2' color='text.secondary'>
                      Nombre:
                    </Typography>
                    <Typography variant='body2' fontWeight={600}>
                      {ticket.buyer!.name || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className='tabler-id' style={{ fontSize: '18px', color: 'var(--mui-palette-primary-main)' }} />
                    <Typography variant='body2' color='text.secondary'>
                      CI:
                    </Typography>
                    <Typography variant='body2' fontWeight={600}>
                      {ticket.buyer!.ci || 'N/A'}
                    </Typography>
                  </Box>
                  {ticket.buyer!.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <i
                        className='tabler-mail'
                        style={{ fontSize: '18px', color: 'var(--mui-palette-primary-main)' }}
                      />
                      <Typography variant='body2' color='text.secondary'>
                        Email:
                      </Typography>
                      <Typography variant='body2' fontWeight={600}>
                        {ticket.buyer!.email}
                      </Typography>
                    </Box>
                  )}
                  {ticket.buyer!.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <i
                        className='tabler-phone'
                        style={{ fontSize: '18px', color: 'var(--mui-palette-primary-main)' }}
                      />
                      <Typography variant='body2' color='text.secondary'>
                        Teléfono:
                      </Typography>
                      <Typography variant='body2' fontWeight={600}>
                        {ticket.buyer!.phone}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center', py: 2 }}>
                  <i className='tabler-user-off' style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }} />
                  No hay información del comprador disponible
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Información del Ticket */}
          <Grid item xs={12} md={6}>
            <Typography
              variant='subtitle2'
              color='primary'
              fontWeight={700}
              sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <i className='tabler-info-circle' />
              Información del Ticket
            </Typography>
            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i
                    className='tabler-building-store'
                    style={{ fontSize: '18px', color: 'var(--mui-palette-primary-main)' }}
                  />
                  <Typography variant='body2' color='text.secondary'>
                    Tipo de Venta:
                  </Typography>
                  <Typography variant='body2' fontWeight={600}>
                    {ticket.type === 'IN_OFFICE' ? 'En Oficina' : ticket.type === 'ONLINE' ? 'En Línea' : ticket.type}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i
                    className={ticket.payment_type === 'qr' ? 'tabler-qrcode' : 'tabler-cash'}
                    style={{ fontSize: '18px', color: 'var(--mui-palette-primary-main)' }}
                  />
                  <Typography variant='body2' color='text.secondary'>
                    Método de Pago:
                  </Typography>
                  <Chip
                    label={ticket.payment_type === 'qr' ? 'QR' : ticket.payment_type === 'cash' ? 'Efectivo' : 'N/A'}
                    color={ticket.payment_type === 'qr' ? 'info' : 'warning'}
                    variant='tonal'
                    size='small'
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i
                    className='tabler-calendar'
                    style={{ fontSize: '18px', color: 'var(--mui-palette-primary-main)' }}
                  />
                  <Typography variant='body2' color='text.secondary'>
                    Fecha de Creación:
                  </Typography>
                  <Typography variant='body2' fontWeight={600}>
                    {formatDate(ticket.createdAt)} {formatTime(ticket.createdAt)}
                  </Typography>
                </Box>
                {ticket.commission && parseFloat(ticket.commission) > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i
                      className='tabler-percentage'
                      style={{ fontSize: '18px', color: 'var(--mui-palette-warning-main)' }}
                    />
                    <Typography variant='body2' color='text.secondary'>
                      Comisión:
                    </Typography>
                    <Typography variant='body2' fontWeight={600} color='warning.main'>
                      Bs. {parseFloat(ticket.commission).toFixed(2)}
                    </Typography>
                  </Box>
                )}
                {/* Solo mostrar información de cancelación si el ticket está cancelado */}
                {isCancelled && ticket.cancelledAt && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i
                      className='tabler-circle-x'
                      style={{ fontSize: '18px', color: 'var(--mui-palette-error-main)' }}
                    />
                    <Typography variant='body2' color='text.secondary'>
                      Fecha de Cancelación:
                    </Typography>
                    <Typography variant='body2' fontWeight={600} color='error.main'>
                      {formatDate(ticket.cancelledAt)} {formatTime(ticket.cancelledAt)}
                    </Typography>
                  </Box>
                )}
                {isCancelled && ticket.canceledBy && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className='tabler-user-x' style={{ fontSize: '18px', color: 'var(--mui-palette-error-main)' }} />
                    <Typography variant='body2' color='text.secondary'>
                      Cancelado por:
                    </Typography>
                    <Typography variant='body2' fontWeight={600}>
                      {ticket.canceledBy.fullName || ticket.canceledBy.email || 'N/A'}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i
                    className='tabler-user-circle'
                    style={{ fontSize: '18px', color: 'var(--mui-palette-info-main)' }}
                  />
                  <Typography variant='body2' color='text.secondary'>
                    Vendedor:
                  </Typography>
                  <Typography variant='body2' fontWeight={600}>
                    {ticket.soldBy?.fullName || ticket.soldBy?.email || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Detalles de Asientos y Pasajeros */}
          <Grid item xs={12}>
            <Typography
              variant='subtitle2'
              color='primary'
              fontWeight={700}
              sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <i className='tabler-armchair' />
              Asientos y Pasajeros ({ticket.seats.length} asiento{ticket.seats.length !== 1 ? 's' : ''})
            </Typography>
            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              {isCancelled && (!ticket.travelSeats || ticket.travelSeats.length === 0) ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <i className='tabler-ban' style={{ fontSize: '48px', color: 'var(--mui-palette-error-main)' }} />
                  <Typography variant='body1' color='text.secondary' sx={{ mt: 2 }}>
                    Este ticket fue cancelado y no tiene asientos asignados
                  </Typography>
                </Box>
              ) : (
                <Table size='small'>
                  <TableBody>
                    {ticket.travelSeats && ticket.travelSeats.length > 0
                      ? ticket.travelSeats.map(seat => (
                          <TableRow key={seat.id} sx={{ '&:last-child td': { border: 0 } }}>
                            <TableCell sx={{ p: 1.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Chip
                                  label={`#${seat.seatNumber}`}
                                  size='small'
                                  color='primary'
                                  variant='outlined'
                                  icon={<i className='tabler-armchair' style={{ fontSize: '12px' }} />}
                                />
                                <Box>
                                  <Typography variant='body2' fontWeight={500}>
                                    Piso {seat.deck}
                                  </Typography>
                                  {seat.passenger ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                      <i
                                        className='tabler-user-check'
                                        style={{ fontSize: '14px', color: 'var(--mui-palette-success-main)' }}
                                      />
                                      <Typography variant='caption' color='success.main' fontWeight={500}>
                                        {seat.passenger.name}
                                        {seat.passenger.ci && ` (CI: ${seat.passenger.ci})`}
                                      </Typography>
                                    </Box>
                                  ) : (
                                    <Typography variant='caption' color='text.secondary'>
                                      Sin pasajero asignado
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align='right' sx={{ p: 1.5 }}>
                              <Typography variant='body2' fontWeight={600} color='success.main'>
                                Bs. {parseFloat(seat.price).toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))
                      : ticket.seats.map((seat, index) => (
                          <TableRow key={index} sx={{ '&:last-child td': { border: 0 } }}>
                            <TableCell sx={{ p: 1.5 }}>
                              <Chip
                                label={`#${seat.seatNumber}`}
                                size='small'
                                color='primary'
                                variant='outlined'
                                icon={<i className='tabler-armchair' style={{ fontSize: '12px' }} />}
                              />
                            </TableCell>
                            <TableCell align='right' sx={{ p: 1.5 }}>
                              <Typography variant='body2' fontWeight={600} color='success.main'>
                                Bs. {parseFloat(seat.price).toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Total */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            bgcolor: isCancelled ? 'error.lighter' : 'success.lighter',
            p: 2,
            borderRadius: 1
          }}
        >
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant='caption' color='text.secondary'>
              Total del Ticket
            </Typography>
            <Typography variant='h4' color={isCancelled ? 'error.main' : 'success.main'} fontWeight={700}>
              Bs. {parseFloat(ticket.total_price).toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant='contained' color='primary' fullWidth>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TicketDetailDialog
