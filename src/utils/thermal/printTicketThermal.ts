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

  // Header
  builder
    .alignCenter()
    .doubleSeparator()
    .bold()
    .doubleSize()
    .line(companyName)
    .normalSize()
    .doubleSeparator()
    .bold()
    .line(`TICKET #${ticket.id}`)
    .bold(false)

  if (isCancelled) {
    builder.bold().line('*** CANCELADO ***').bold(false)
  }

  builder.emptyLine()

  // Route box
  builder.boxTop().alignCenter().bold().boxLine(`${origin} --> ${destination}`).bold(false).boxMiddle().alignLeft()

  // Departure info inside box
  const depInfo = `FECHA: ${departureDate}  HORA: ${departureTime}`

  builder.boxLine(depInfo)
  builder.boxLine(`CARRIL: ${lane}`)
  builder.boxBottom()

  builder.emptyLine()

  // Buyer section
  builder
    .alignLeft()
    .bold()
    .line('--- COMPRADOR ---')
    .bold(false)
    .twoColumns('Nombre:', buyerName)
    .twoColumns('CI/NIT:', buyerCi)

  builder.emptyLine()

  // Seats section
  builder
    .bold()
    .line('--- ASIENTOS ---')
    .bold(false)
    .tableRow(['N', 'Piso', 'Pasajero', 'Precio'], [4, 6, 22, 14])
    .separator()

  seats?.forEach(seat => {
    const seatAny = seat as any
    const passengerName = seatAny.passenger?.name || buyerName
    const deck = seatAny.deck || '-'
    const price = `Bs.${parseFloat(seat.price).toFixed(2)}`

    builder.tableRow([seat.seatNumber, String(deck), passengerName.substring(0, 20), price], [4, 6, 22, 14])
  })

  builder.emptyLine()

  // Total
  builder
    .doubleSeparator()
    .alignCenter()
    .bold()
    .doubleSize()
    .line(`TOTAL: Bs. ${totalPrice}`)
    .normalSize()
    .bold(false)
    .doubleSeparator()

  builder.emptyLine()

  // Additional info
  builder
    .alignLeft()
    .twoColumns('Tipo:', getSaleTypeLabel(ticket.type))
    .twoColumns('Pago:', getPaymentLabel(ticket.payment_type))
    .twoColumns('Emision:', `${formatDate(ticket.createdAt)} ${formatTime(ticket.createdAt)}`)

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

  // Footer
  builder.separator('-').alignCenter().bold().line('Gracias por su preferencia!').line('Buen Viaje').bold(false)

  // Cut paper
  builder.cut()

  return builder.build()
}

export const printTicketThermal = async (ticket: Ticket): Promise<void> => {
  const data = buildTicketThermalData(ticket)

  await printData(data)
}

export default printTicketThermal
