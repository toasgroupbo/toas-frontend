import type { Ticket } from '@/types/api/tickets'
import { ESCPOSBuilder } from './escpos'
import { printData } from './webusb'

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)

  return date.toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/La_Paz'
  })
}

const formatTime = (dateString: string): string => {
  const date = new Date(dateString)

  return date.toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/La_Paz'
  })
}

const getSaleTypeLabel = (type: string): string => {
  if (type === 'IN_OFFICE') return 'Oficina'
  if (type === 'IN_APP') return 'App'

  return type
}

const getPaymentLabel = (paymentType?: string): string => {
  if (paymentType === 'qr') return 'QR'
  if (paymentType === 'cash') return 'Efectivo'

  return 'N/A'
}

export const buildTicketThermalData = (ticket: Ticket): Uint8Array => {
  const builder = new ESCPOSBuilder(48) // 48 chars for 80mm paper

  const isCancelled = ticket.status === 'cancelled'
  const companyName = ticket.travel?.company?.name || 'EMPRESA'
  const origin = ticket.travel?.route?.officeOrigin?.place?.name || 'N/A'
  const destination = ticket.travel?.route?.officeDestination?.place?.name || 'N/A'
  const departureDate = ticket.travel?.departure_time ? formatDate(ticket.travel.departure_time) : 'N/A'
  const departureTime = ticket.travel?.departure_time ? formatTime(ticket.travel.departure_time) : 'N/A'
  const lane = ticket.travel?.lane || '-'

  const buyerName = ticket.billingSnapshot?.nombre || ticket.billing?.nombre || ticket.buyer?.name || 'N/A'
  const buyerCi = ticket.billingSnapshot?.ci || ticket.billing?.ci || ticket.buyer?.ci || 'N/A'

  const seats = ticket.travelSeats?.length > 0 ? ticket.travelSeats : ticket.seats
  const totalPrice = parseFloat(ticket.total_price).toFixed(2)

  // Header - Company name large and bold
  builder
    .alignCenter()
    .bold()
    .doubleSize()
    .line(companyName)
    .normalSize()
    .emptyLine()
    .line(`TICKET #${ticket.id}`)
    .bold(false)

  if (isCancelled) {
    builder.emptyLine().bold().line('*** CANCELADO ***').bold(false)
  }

  builder.emptyLine()

  // Route section with box
  builder
    .separator('-')
    .alignLeft()
    .bold()
    .text('ORIGEN: ')
    .bold(false)
    .text(`${origin} ->`)
    .newLine()
    .bold()
    .text('DESTINO: ')
    .bold(false)
    .line(destination)
    .separator('-')

  // Date, Time, Lane in columns
  builder
    .bold()
    .tableRow(['FECHA', 'HORA', 'CARRIL'], [18, 18, 12])
    .bold(false)
    .tableRow([departureDate, departureTime, String(lane)], [18, 18, 12])

  builder.separator('-')

  // Buyer section
  builder
    .emptyLine()
    .bold()
    .line('COMPRADOR')
    .bold(false)
    .separator('-')
    .twoColumns('Nombre:', buyerName)
    .twoColumns('CI/NIT:', buyerCi)

  builder.emptyLine()

  // Seats section
  builder
    .bold()
    .line('ASIENTOS')
    .bold(false)
    .separator('-')
    .bold()
    .tableRow(['N', 'Piso', 'Pasajero', 'Precio'], [4, 6, 24, 12])
    .bold(false)
    .emptyLine()

  seats?.forEach(seat => {
    const seatAny = seat as any
    const passengerName = seatAny.passenger?.name || buyerName
    const deck = seatAny.deck || '-'
    const price = `Bs.${parseFloat(seat.price).toFixed(2)}`

    builder.tableRow([seat.seatNumber, String(deck), passengerName.substring(0, 22), price], [4, 6, 24, 12])
  })

  builder.emptyLine()

  // Total section - large and prominent
  builder
    .alignCenter()
    .line('TOTAL A PAGAR')
    .emptyLine()
    .bold()
    .doubleSize()
    .line(`Bs. ${totalPrice}`)
    .normalSize()
    .bold(false)

  builder.emptyLine()
  builder.separator('-')

  // Additional info - right aligned values
  builder
    .alignLeft()
    .twoColumns('Tipo de Venta:', getSaleTypeLabel(ticket.type))
    .twoColumns('Metodo de Pago:', getPaymentLabel(ticket.payment_type))
    .twoColumns('Fecha Emision:', `${formatDate(ticket.createdAt)} ${formatTime(ticket.createdAt)}`)

  if (ticket.type === 'IN_OFFICE' && ticket.soldBy) {
    builder.twoColumns('Cajero:', ticket.soldBy.fullName || ticket.soldBy.email || 'N/A')
  }

  // Cancelled info
  if (isCancelled) {
    builder.emptyLine().bold().alignCenter().line('*** TICKET CANCELADO ***').bold(false).alignLeft()

    if (ticket.cancelledAt) {
      builder.twoColumns('Fecha cancel.:', `${formatDate(ticket.cancelledAt)} ${formatTime(ticket.cancelledAt)}`)
    }
  }

  builder.emptyLine()
  builder.separator('-')

  // Footer
  builder
    .alignCenter()
    .bold()
    .line('!Gracias por su preferencia!')
    .line('Buen Viaje')
    .bold(false)

  // Cut paper
  builder.cut()

  return builder.build()
}

export const printTicketThermal = async (ticket: Ticket): Promise<void> => {
  const data = buildTicketThermalData(ticket)

  await printData(data)
}

export default printTicketThermal
